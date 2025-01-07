import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  signal,
  WritableSignal,
} from "@angular/core";
import { vscode } from "../vscode";
import { CommonModule } from "@angular/common";
import { Course } from "@shared/models/course.model";
import { Exercise } from "@shared/models/exercise.model";
import { CommandFromExtension, CommandFromWebview } from "@shared/webview-commands";

@Component({
  selector: "course-selection",
  templateUrl: "./course-selection.view.html",
  styleUrls: ["./course-selection.view.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CourseSelectionView implements OnInit {
  coursesWithNextDue: WritableSignal<{ course: Course; nextDueExercise: Exercise | undefined }[]> = signal(
    []
  );

  constructor() {}

  ngOnInit() {
    // query courses from API
    window.addEventListener("message", (event) => {
      const message = event.data; // The JSON data
      if (message.command === CommandFromExtension.SEND_COURSE_OPTIONS) {
        const courses = JSON.parse(message.text);
        const coursesWithNextDue = courses
          // filter out courses without exercises, as they are not interesting for programming
          .filter((course: Course) => {
            return course.exercises;
          })
          // for some reason, the dueDate is not correctly deserialized
          .map((course: Course) => {
            course.exercises = course.exercises!.map((exercise: Exercise) => {
              exercise.dueDate = exercise.dueDate ? new Date(exercise.dueDate) : undefined;
              return exercise;
            });
            return course;
          })
          .map((course: Course) => {
            return { course: course, nextDueExercise: this.getNextDueExercise(course) };
          });
        this.coursesWithNextDue.set(coursesWithNextDue);
      }
    });
    vscode.postMessage({ command: CommandFromWebview.GET_COURSE_OPTIONS, text: undefined });
  }

  clickCourse(course: any) {
    vscode.postMessage({
      command: CommandFromWebview.SET_COURSE_AND_EXERCISE,
      text: JSON.stringify({ course: course, exercise: undefined }),
    });

    // view change is triggered by editor
  }

  getNextDueExercise(course: Course): Exercise | undefined {
    if (!course.exercises || course.exercises.length === 0) {
      return undefined;
    }

    const now = new Date();
    return course.exercises
      .filter((exercise) => (exercise.dueDate ? exercise.dueDate > now : false))
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())[0];
  }
}

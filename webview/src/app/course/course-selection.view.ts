import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  Input,
  OnInit,
  signal,
  ViewEncapsulation,
  WritableSignal,
} from "@angular/core";
import { vscode } from "../vscode";
import { StateService, ViewState } from "../state.service";
import { CommonModule } from "@angular/common";
import { Course, TotalScores } from "@shared/models/course.model";
import { Exercise } from "@shared/models/exercise.model";
import { map } from "rxjs";

enum OutgoingCommands {
  GET_COURSE_OPTIONS = "getCourseOptions",
  SET_COURSE_AND_EXERCISE = "setCourseAndExercise",
}

enum IncomingCommands {
  SEND_COURSE_OPTIONS = "sendCourseOptions",
}

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
  coursesWithScore: WritableSignal<
    { course: Course; totalScores: TotalScores; nextDueExercise: Exercise | undefined }[] | undefined
  > = signal(undefined);

  constructor() {}

  ngOnInit() {
    // query courses from API
    window.addEventListener("message", (event) => {
      const message = event.data; // The JSON data
      if (message.command === IncomingCommands.SEND_COURSE_OPTIONS) {
        const courses = JSON.parse(message.text);
        courses
          // filter out courses without exercises, as they are not interesting for programming
          .filter((courseWithScore: { course: Course; totalScores: TotalScores }) => {
            return courseWithScore.course.exercises;
          })
          // for some reason, the dueDate is not correctly deserialized
          .map((courseWithScore: { course: Course; totalScores: TotalScores }) => {
            courseWithScore.course.exercises = courseWithScore.course.exercises!.map((exercise: Exercise) => {
              exercise.dueDate = exercise.dueDate ? new Date(exercise.dueDate) : undefined;
              return exercise;
            });
            return courseWithScore;
          })
          .forEach(
            (courseWithScore: {
              course: Course;
              totalScores: TotalScores;
              nextDueExercise: Exercise | undefined;
            }) => {
              courseWithScore.nextDueExercise = this.getNextDueExercise(courseWithScore.course);
            }
          );
        this.coursesWithScore.set(courses);
      }
    });
    vscode.postMessage({ command: OutgoingCommands.GET_COURSE_OPTIONS, text: undefined });
  }

  clickCourse(course: any) {
    vscode.postMessage({
      command: OutgoingCommands.SET_COURSE_AND_EXERCISE,
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

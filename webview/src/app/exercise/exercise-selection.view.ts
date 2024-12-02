import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  Input,
  OnInit,
  signal,
  WritableSignal,
} from "@angular/core";
import { vscode } from "../vscode";
import { StateService, ViewState } from "../state.service";
import { CommonModule } from "@angular/common";
import { Course } from "@shared/models/course.model";
import { Exercise } from "@shared/models/exercise.model";

enum OutgoingCommands {
  GET_EXERCISE_OPTIONS = "getExerciseOptions",
  SET_COURSE_AND_EXERCISE = "setCourseAndExercise",
}

enum IncomingCommands {
  SEND_EXERCISE_OPTIONS = "sendExerciseOptions",
}

@Component({
  selector: "exercise-selection",
  templateUrl: "./exercise-selection.view.html",
  styleUrls: ["./exercise-selection.view.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ExerciseSelectionView implements OnInit {
  @Input()
  course!: Course;

  exercises: WritableSignal<Exercise[] | undefined> = signal(undefined);

  constructor() {}

  ngOnInit() {
    // query courses from API
    window.addEventListener("message", (event) => {
      const message = event.data; // The JSON data
      if (message.command === IncomingCommands.SEND_EXERCISE_OPTIONS) {
        const exercises = JSON.parse(message.text);
        // for some reason, the dueDate is not correctly deserialized
        exercises.map((exercise: Exercise) => {
          exercise.dueDate = exercise.dueDate ? new Date(exercise.dueDate) : undefined;
          return exercise;
        });
        this.exercises.set(exercises);
      }
    });
    vscode.postMessage({ command: OutgoingCommands.GET_EXERCISE_OPTIONS, text: undefined });
  }

  clickExercise(exercise: Exercise) {
    vscode.postMessage({
      command: OutgoingCommands.SET_COURSE_AND_EXERCISE,
      text: JSON.stringify({ course: this.course, exercise: exercise }),
    });

    // view change is triggered by editor
  }

  getScore(exercise: Exercise): number | undefined {
    return exercise.studentParticipations
      ?.at(0)
      ?.results?.filter((result) => result.rated)
      .sort((a, b) => new Date(a.completionDate!).getTime() - new Date(b.completionDate!).getTime())
      .at(0)?.score;
  }
}

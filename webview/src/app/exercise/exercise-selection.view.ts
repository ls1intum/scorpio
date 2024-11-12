import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit, signal, WritableSignal } from "@angular/core";
import { vscode } from "../vscode";
import { StateService, ViewState } from "../state.service";
import { CommonModule } from "@angular/common";

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
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ExerciseSelectionView implements OnInit {
  course: WritableSignal<any> = signal(undefined);

  exercises: WritableSignal<[any] | undefined> = signal(undefined);

  constructor(private stateService: StateService) {}

  ngOnInit() {
    this.stateService.viewState$.subscribe(({ course: course }) => {
      this.course.set(course);
    });

    // query courses from API
    window.addEventListener("message", (event) => {
      const message = event.data; // The JSON data
      if (message.command === IncomingCommands.SEND_EXERCISE_OPTIONS) {
        this.exercises.set(JSON.parse(message.text));
      }
    });
    vscode.postMessage({ command: OutgoingCommands.GET_EXERCISE_OPTIONS, text: undefined });

    console.log("course is: ");
    console.log(this.course());
  }

  clickExercise(exercise: any) {
    vscode.postMessage({
      command: OutgoingCommands.SET_COURSE_AND_EXERCISE,
      text: JSON.stringify({ course: this.course(), exercise: exercise }),
    });

    // view change is triggered by editor
  }
}

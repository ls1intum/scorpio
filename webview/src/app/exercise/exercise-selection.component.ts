import { ChangeDetectionStrategy, Component, Input, OnInit, signal, WritableSignal } from "@angular/core";
import { vscode } from "../vscode";
import { StateService, ViewState } from "../state.service";

enum OutgoingCommands {
  GET_EXERCISE_OPTIONS = "getExerciseOptions",
  SET_COURSE_AND_EXERCISE = "setCourseAndExercise",
}

enum IncomingCommands {
  SEND_EXERCISE_OPTIONS = "sendExerciseOptions",
}

@Component({
  selector: "exercise-selection",
  templateUrl: "./exercise-selection.component.html",
  styleUrls: ["./exercise-selection.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExerciseSelectionComponent implements OnInit {
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
      text: JSON.stringify({ course: this.course, exercise: exercise }),
    });

    // course and exercise are set by the changed state in the editor
    this.stateService.changeState({
      viewState: ViewState.PROBLEM_STATEMENT,
      course: this.course(),
      exercise: exercise,
      repoKey: undefined,
    });
  }
}

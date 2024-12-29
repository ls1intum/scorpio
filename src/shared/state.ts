import * as vscode from "vscode";
import { Course } from "@shared/models//course.model";
import { Exercise } from "@shared/models/exercise.model";

export interface State {
  displayedCourse: Course | undefined;
  displayedExercise: Exercise | undefined;
  repoCourse: Course | undefined;
  repoExercise: Exercise | undefined;
}

export const onStateChange: vscode.EventEmitter<State> = new vscode.EventEmitter<State>();

export var state: State = {
  displayedCourse: undefined,
  displayedExercise: undefined,
  repoCourse: undefined,
  repoExercise: undefined,
};

export const set_state = (changes: State) => {
  // nothing is displayed, but repo was detected
  if (
    !state.displayedCourse &&
    !changes.displayedCourse &&
    changes.repoCourse &&
    !state.displayedExercise &&
    !changes.displayedExercise &&
    changes.repoExercise
  ) {
    changes.displayedCourse = changes.repoCourse;
    changes.displayedExercise = changes.repoExercise;
  }

  state.repoCourse = changes.repoCourse;
  state.repoExercise = changes.repoExercise;

  state.displayedCourse = changes.displayedCourse;
  state.displayedExercise = changes.displayedExercise;

  if (state.repoCourse && state.repoExercise) {
    vscode.commands.executeCommand("setContext", "scorpio.repoKey", [
      state.repoCourse.shortName!.toUpperCase() + state.repoExercise.shortName!.toUpperCase(),
    ]);
  } else {
    vscode.commands.executeCommand("setContext", "scorpio.repoKey", null);
  }

  if (state.displayedCourse) {
    if (state.displayedExercise) {
      vscode.commands.executeCommand(
        "setContext",
        "scorpio.displayedKey",
        state.displayedCourse.shortName!.toUpperCase() + state.displayedExercise.shortName!.toUpperCase()
      );
    }

    vscode.commands.executeCommand("setContext", "scorpio.displayBackButton", true);
  } else {
    vscode.commands.executeCommand("setContext", "scorpio.displayedKey", null);

    vscode.commands.executeCommand("setContext", "scorpio.displayBackButton", false);
  }

  onStateChange.fire(changes);
};

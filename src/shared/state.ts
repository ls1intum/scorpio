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

let _state: State = {
  displayedCourse: undefined,
  displayedExercise: undefined,
  repoCourse: undefined,
  repoExercise: undefined,
};

export const getState = (): State => {
  return _state;
};
export const set_state = (changes: State) => {
  // nothing is displayed, but repo was detected
  if (
    !_state.displayedCourse &&
    !changes.displayedCourse &&
    changes.repoCourse &&
    !_state.displayedExercise &&
    !changes.displayedExercise &&
    changes.repoExercise
  ) {
    changes.displayedCourse = changes.repoCourse;
    changes.displayedExercise = changes.repoExercise;
  }

  _state.repoCourse = changes.repoCourse;
  _state.repoExercise = changes.repoExercise;

  _state.displayedCourse = changes.displayedCourse;
  _state.displayedExercise = changes.displayedExercise;

  if (_state.repoCourse && _state.repoExercise) {
    vscode.commands.executeCommand("setContext", "scorpio.repoKey", [
      _state.repoCourse.shortName!.toUpperCase() + _state.repoExercise.shortName!.toUpperCase(),
    ]);
  } else {
    vscode.commands.executeCommand("setContext", "scorpio.repoKey", null);
  }

  if (_state.displayedCourse) {

    // of course and exercise are displayed, set context key to course + exercise
    if (_state.displayedExercise) {
      vscode.commands.executeCommand(
        "setContext",
        "scorpio.displayedKey",
        _state.displayedCourse.shortName!.toUpperCase() + _state.displayedExercise.shortName!.toUpperCase()
      );
    }

    // if either is displayed, show back button
    vscode.commands.executeCommand("setContext", "scorpio.displayBackButton", true);
  } else {
    vscode.commands.executeCommand("setContext", "scorpio.displayedKey", null);

    vscode.commands.executeCommand("setContext", "scorpio.displayBackButton", false);
  }

  onStateChange.fire(changes);
};

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

export function set_displayed_state(course: Course | undefined, exercise: Exercise | undefined) {
  state.displayedCourse = course;
  state.displayedExercise = exercise;

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
    // nothing is selected (in course selection) -> no back button
    vscode.commands.executeCommand("setContext", "scorpio.displayedKey", null);
    vscode.commands.executeCommand("setContext", "scorpio.displayBackButton", false);
  }

  onStateChange.fire(state);
}

export function set_repo_state(course: Course, exercise: Exercise) {
  state.repoCourse = course;
  state.repoExercise = exercise;

  vscode.commands.executeCommand("setContext", "scorpio.repoKey", [
    state.repoCourse.shortName!.toUpperCase() + state.repoExercise.shortName!.toUpperCase(),
  ]);

  if (!state.displayedCourse || !state.displayedExercise) {
    // this methode will fire the onStateChange event
    set_displayed_state(course, exercise);
  } else {
    onStateChange.fire(state);
  }
}

export function clear_repo_state() {
  state.repoCourse = undefined;
  state.repoExercise = undefined;

  vscode.commands.executeCommand("setContext", "scorpio.repoKey", null);
  onStateChange.fire(state);
}

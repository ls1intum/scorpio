import * as vscode from "vscode";
import { Course } from "@shared/models//course.model";
import { Exercise, getProjectKey } from "@shared/models/exercise.model";

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

export function getState(): State {
  return _state;
}

export function set_displayed_state(course: Course | undefined, exercise: Exercise | undefined) {
  _state.displayedCourse = course;
  _state.displayedExercise = exercise;

  if (course) {
    // if an exercise is displayed and it was not due yet, set the displayedKey to enable the clone button
    if (exercise && (!exercise.dueDate || new Date(exercise.dueDate) >= new Date())) {
      vscode.commands.executeCommand("setContext", "scorpio.displayedKey", getProjectKey(course, exercise));
    }else{
      // if the exercise was due, disable the clone button
      vscode.commands.executeCommand("setContext", "scorpio.displayedKey", null);
    }

    // if either is displayed, show back button
    vscode.commands.executeCommand("setContext", "scorpio.displayBackButton", true);
  } else {
    // nothing is selected (in course selection) -> no back button
    vscode.commands.executeCommand("setContext", "scorpio.displayedKey", null);
    vscode.commands.executeCommand("setContext", "scorpio.displayBackButton", false);
  }

  onStateChange.fire(_state);
}

export function set_repo_state(course: Course, exercise: Exercise) {
  _state.repoCourse = course;
  _state.repoExercise = exercise;

  // if the exercise is not due yet, set the repoKey to enable the push button
  if (!exercise.dueDate || new Date(exercise.dueDate) >= new Date()) {
    vscode.commands.executeCommand("setContext", "scorpio.repoKey", [getProjectKey(course, exercise)]);
  }

  if (!_state.displayedCourse || !_state.displayedExercise) {
    // this methode will fire the onStateChange event
    set_displayed_state(course, exercise);
  } else {
    onStateChange.fire(_state);
  }
}

export function clear_repo_state() {
  _state.repoCourse = undefined;
  _state.repoExercise = undefined;

  vscode.commands.executeCommand("setContext", "scorpio.repoKey", null);
  onStateChange.fire(_state);
}

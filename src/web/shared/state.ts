import * as vscode from "vscode";
import { Course } from "../course/course.model";
import { Exercise } from "../exercise/exercise.model";

export interface State {
  displayedCourse?: Course;
  displayedExercise?: Exercise;
  repoCourse?: Course;
  repoExercise?: Exercise;
}

export const onStateChange: vscode.EventEmitter<State> =
  new vscode.EventEmitter<State>();

export var state: State = {
  displayedCourse: undefined,
  displayedExercise: undefined,
  repoCourse: undefined,
  repoExercise: undefined,
};
export const set_state = (changes: State) => {
  // if nothing is displayed at the moment, display the repo course and exercise
  if (!state.displayedCourse && changes.repoCourse) {
    changes.displayedCourse = changes.repoCourse;
  }

  if (!state.displayedExercise && changes.repoExercise) {
    changes.displayedExercise = changes.repoExercise;
  }

  state.repoCourse = changes.repoCourse ?? state.repoCourse;
  state.repoExercise = changes.repoExercise ?? state.repoExercise;

  state.displayedCourse = changes.displayedCourse ?? state.displayedCourse;
  state.displayedExercise =
    changes.displayedExercise ?? state.displayedExercise;

  onStateChange.fire(changes);
};

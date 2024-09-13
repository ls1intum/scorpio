import * as vscode from "vscode";
import { Course } from "../course/course.model";
import { Exercise } from "../exercise/exercise.model";

export interface State {
  displayedCourse: Course | undefined;
  displayedExercise: Exercise | undefined;
  repoCourse: Course | undefined;
  repoExercise: Exercise | undefined;
}

export const onStateChange: vscode.EventEmitter<State> =
  new vscode.EventEmitter<State>();

export var state: State = {
  displayedCourse: undefined,
  displayedExercise: undefined,
  repoCourse: undefined,
  repoExercise: undefined,
};

/// set the state - only changes the states value if it is not undefined
export const set_state = (changes: State) => {
  // if nothing is displayed at the moment, display the repo course and exercise
  if (
    !state.displayedCourse &&
    changes.repoCourse &&
    !state.displayedExercise &&
    changes.repoExercise
  ) {
    changes.displayedCourse = changes.repoCourse;
    changes.displayedExercise = changes.repoExercise;
  }

  state.repoCourse = changes.repoCourse;
  state.repoExercise = changes.repoExercise;

  state.displayedCourse = changes.displayedCourse;
  state.displayedExercise = changes.displayedExercise;

  onStateChange.fire(changes);
};

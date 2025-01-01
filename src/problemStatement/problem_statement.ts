import * as vscode from "vscode";
import { set_state, getState } from "../shared/state";

export async function sync_problem_statement_with_workspace() {
  const state = getState();
  if (!state.repoCourse || !state.repoExercise) {
    await vscode.commands.executeCommand("scorpio.workspace.detectRepo");
  }
  if(!state.repoCourse || !state.repoExercise) {
    return;
  }

  set_state({
    displayedCourse: state.repoCourse,
    displayedExercise: state.repoExercise,
    repoCourse: state.repoCourse,
    repoExercise: state.repoExercise,
  });
}

import * as vscode from "vscode";
import { set_displayed_state, state } from "../shared/state";

export async function sync_problem_statement_with_workspace() {
  if (!state.repoCourse || !state.repoExercise) {
    await vscode.commands.executeCommand("scorpio.workspace.detectRepo");
  }
  if(!state.repoCourse || !state.repoExercise) {
    return;
  }

  set_displayed_state(state.repoCourse, state.repoExercise);
}

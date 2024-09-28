import * as vscode from "vscode";
import { gitAPI, initGitExtension } from "../shared/repository";

export async function cloneTheia(cloneUrl: URL) {
  // Access the git extension
  if (!gitAPI) {
    initGitExtension();
  }

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage("No workspace folder available");
    return;
  }

  const destinationPath = workspaceFolders[0].uri.fsPath;

  // Clone the repository
  await vscode.commands.executeCommand(
    "git.clone",
    cloneUrl.toString(),
    destinationPath
  );

  vscode.workspace.updateWorkspaceFolders(
    0,
    null,
    { uri: vscode.Uri.file(destinationPath) }
  );
}

import * as vscode from "vscode";
import { gitAPI, initGitExtension } from "../shared/repository";

export async function cloneTheia(cloneUrl: URL) {
  // Access the git extension
  if (!gitAPI) {
    initGitExtension();
  }

  // Check if a workspace is available in which the exercise can be cloned
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

  // Update the workspace folder to include the cloned repository
  vscode.workspace.updateWorkspaceFolders(
    0,
    null,
    { uri: vscode.Uri.file(destinationPath) }
  );
}

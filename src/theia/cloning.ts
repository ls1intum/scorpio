import * as vscode from "vscode";
import simpleGit from "simple-git";
import * as path from 'path';

export async function cloneTheia(cloneUrl: URL) {
  // Check if a workspace is available in which the exercise can be cloned
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage("No workspace folder available");
    return;
  }

  const destinationPath = workspaceFolders[0].uri.fsPath;

  // Create a subdirectory for the cloned repository
  const repoName = path.basename(cloneUrl.pathname, '.git'); // Use repository name as subdirectory name
  const clonePath = path.join(destinationPath, repoName);

  // Clone the repository
  const git = simpleGit(destinationPath);
  await git.clone(cloneUrl.toString(), clonePath);
}

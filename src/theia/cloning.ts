import * as vscode from "vscode";
import simpleGit from "simple-git";
import * as path from "path";
import { theiaGitUserMail, theiaGitUserName } from "./theia";

export async function cloneTheia(cloneUrl: URL) {
  // Check if a workspace is available in which the exercise can be cloned
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage("No workspace folder available");
    return;
  }

  const destinationPath = workspaceFolders[0].uri.fsPath;

  // Create a subdirectory for the cloned repository
  const repoName = path.basename(cloneUrl.pathname, ".git"); // Use repository name as subdirectory name
  const clonePath = path.join(destinationPath, repoName);

  // Clone the repository
  const git = simpleGit(destinationPath);
  await git.addConfig("user.name", theiaGitUserName!);
  await git.addConfig("user.email", theiaGitUserMail!);

  try {
    await git.clone(cloneUrl.toString(), clonePath);
  } catch (e: any) {
    vscode.window.showErrorMessage(`Error cloning repository: ${e.message}`);
  }
}

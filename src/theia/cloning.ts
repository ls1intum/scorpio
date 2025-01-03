import * as vscode from "vscode";
import simpleGit, { GitConfigScope } from "simple-git";
import * as path from "path";
import { theiaEnv } from "./theia";
import { getLevel1Subfolders } from "../utils/filetree";

export async function cloneTheia(cloneUrl: URL) {
  // Check if a workspace is available in which the exercise can be cloned
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    console.error("No workspace folder available to clone repository");
    return;
  }

  const destinationPath = workspaceFolders[0].uri.fsPath;

  // Create a subdirectory for the cloned repository
  const repoName = path.basename(cloneUrl.pathname, ".git"); // Use repository name as subdirectory name
  const clonePath = path.join(destinationPath, repoName);

  // check if repo already exists
  const subfolders = await getLevel1Subfolders(vscode.Uri.file(destinationPath));
  if (subfolders.some((folder) => folder.fsPath === clonePath)) {
    console.log("Repository already cloned");
    return;
  }

  // Clone the repository
  const git = simpleGit(destinationPath);

  try {
    await git.clone(cloneUrl.toString(), clonePath);
  } catch (e: any) {
    console.error(`Error cloning repository: ${e.message}`);
  }
  try {
    await git.addConfig("user.name", theiaEnv?.GIT_USER!, undefined, GitConfigScope.global);
    await git.addConfig("user.email", theiaEnv?.GIT_MAIL!, undefined, GitConfigScope.global);
  } catch (e: any) {
    console.error(`Error setting git config: ${e.message}`);
  }
}

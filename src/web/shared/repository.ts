import * as vscode from "vscode";
import { API as GitAPI, GitExtension } from "../git"; // Path where you saved git.d.ts
import { settings } from "../config";

let gitAPI: GitAPI;

export function initGitExtension() {
  if (
    vscode.env.uiKind !== vscode.UIKind.Desktop ||
    vscode.env.appHost !== "desktop"
  ) {
    throw new Error("Running in a web environment. Git features are disabled.");
  }

  const gitExtension =
    vscode.extensions.getExtension<GitExtension>("vscode.git");
  if (!gitExtension) {
    throw new Error("Git extension not found");
  }
  gitAPI = gitExtension.exports.getAPI(1);
}

export async function cloneRepository(repoUrl: string, username: string) {
  // Access the git extension
  if (!gitAPI) {
    initGitExtension();
  }

  // Open a dialog to select the folder where the repo will be cloned
  const selectedFolder = await vscode.window.showOpenDialog({
    canSelectFolders: true,
    openLabel: "Select folder to clone into",
    defaultUri: vscode.Uri.file(settings.default_repo_path ?? ""),
  });

  if (!selectedFolder || selectedFolder.length === 0) {
    throw new Error("No folder selected");
  }

  // Clone the repository
  let cloneUrl = addCredentialsToHTTPUrl(repoUrl, username);

  await vscode.commands.executeCommand(
    "git.clone",
    cloneUrl,
    selectedFolder[0].fsPath.toString()
  );
  //await gitAPI.clone(cloneUrl, { location: selectedFolder[0] });
}

function addCredentialsToHTTPUrl(url: string, username: string) {
  const credentials = `://${username}@`;
  if (!url.includes("@")) {
    // the url has the format https://vcs-server.com
    return url.replace("://", credentials);
  } else {
    // the url has the format https://username@vcs-server.com -> replace ://username@
    return url.replace(/:\/\/.*@/, credentials);
  }
}

export async function submitCurrentWorkspace() {
  // Access the git extension
  if (!gitAPI) {
    initGitExtension();
  }

  const repo = gitAPI.repositories[0];
  if (!repo) {
    throw new Error("No repository found");
  }

  if(!await repo.diff()){
    throw new Error("No changes to commit");
  }

  await repo.add([]);
  const commitMessage = await vscode.window.showInputBox({
    placeHolder: "Enter commit message",
    prompt: "Enter commit message",
    value: "Submit workspace from artemis plugin", // Set your default text here
  });
  if (!commitMessage) {
    throw new Error("Commit process cancelled");
  }
  await repo.commit(commitMessage);
  await repo.push();
}

export function getExerciseIdAndCourseIdFromRepository(): {
  courseId: number;
  exerciseId: number;
} {
  // Implement your logic here
  throw new Error("Not implemented");
}

import * as vscode from "vscode";
import { API as GitAPI, GitExtension } from "../git"; // Path where you saved git.d.ts
import { settings } from "../config";
import {
  fetch_latest_participation,
  start_exercise,
} from "../participation/participation_api";
import { AUTH_ID } from "../authentication/authentication_provider";
import { state } from "./state";

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

export async function cloneRepository() {
  if (!state.exercise) {
    throw new Error("No exercise selected");
  }

  // Access the git extension
  if (!gitAPI) {
    initGitExtension();
  }

  const session = await vscode.authentication.getSession(AUTH_ID, [], {
    createIfNone: true,
  });

  if (!session) {
    throw new Error("Please sign in");
  }

  let participation;
  try {
    participation = await fetch_latest_participation(
      session.accessToken,
      state.exercise.id
    );
  } catch (e) {
    participation = await start_exercise(
      session.accessToken,
      state.exercise.id
    );
  }

  // Open a dialog to select the folder where the repo will be cloned
  const selectedFolder = await vscode.window.showOpenDialog({
    canSelectFolders: true,
    openLabel: "Select folder to clone into",
    defaultUri: vscode.Uri.parse(settings.default_repo_path ?? ""),
  });

  if (!selectedFolder || selectedFolder.length === 0) {
    throw new Error("No folder selected");
  }

  // Clone the repository
  let cloneUrl = addCredentialsToHTTPUrl(
    participation.repositoryUri,
    participation.participantIdentifier
  );
  
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

export function getExerciseIdAndCourseIdFromRepository(): {
  courseId: number;
  exerciseId: number;
} {
  // Implement your logic here
  throw new Error("Not implemented");
}

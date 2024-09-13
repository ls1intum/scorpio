import * as vscode from "vscode";
import { API as GitAPI, GitExtension } from "../git"; // Path where you saved git.d.ts
import { settings } from "../config";
import { AUTH_ID } from "../authentication/authentication_provider";
import { Course } from "../course/course.model";
import { Exercise } from "../exercise/exercise.model";
import { fetch_course_exercise_projectKey } from "../exercise/exercise.api";
import { set_state } from "./state";

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

  if (!(await repo.diff())) {
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

export async function detectRepoCourseAndExercsie(){
  const projectKey: string = await getProjectKeyFromRepos();

  const token = (
    await vscode.authentication.getSession(AUTH_ID, [], {
      createIfNone: true,
    })
  ).accessToken;

  const course_exercise: { course: Course; exercise: Exercise } =
    await fetch_course_exercise_projectKey(token, projectKey);

  set_state({
    repoCourse: course_exercise.course,
    repoExercise: course_exercise.exercise,
  });
}

async function getProjectKeyFromRepos(): Promise<string> {
  if (!gitAPI) {
    initGitExtension();
  }

  if (!settings.base_url) {
    throw new Error("Base URL is not set");
  }

  for (const repo of gitAPI.repositories) {
    for (const remote of repo.state.remotes) {
      if (remote.fetchUrl) {
        // check that artemis is really the repo host
        if (new URL(remote.fetchUrl).host !== new URL(settings.base_url!).host) {
          continue;
        }
        return getProjectKeyFromRepoUrl(remote.fetchUrl);
      }
    }
  }
  
  throw new Error("No Artemis repository URL found");
}

function getProjectKeyFromRepoUrl(repoUrl: string): string {
  // extract projectKey {protocol}://{username}@{host}:{port}/git/{PROJECT_KEY}/{project_key}-{username}.git
  const projectKeyMatch = repoUrl.match(
    /^[a-zA-Z]+:\/\/[^@]+@[^:]+:[0-9]+\/git\/([^\/]+)\/[^\/]+-[^\/]+\.git$/
  );
  if (!projectKeyMatch) {
    throw new Error(
      "Invalid artemis repository URL does not contain project key"
    );
  }

  return projectKeyMatch[1];
}

import * as vscode from "vscode";
import { settings } from "./settings";
import { NotAuthenticatedError } from "../authentication/not_authenticated.error";
import { AUTH_ID } from "../authentication/authentication_provider";
import { Course } from "@shared/models/course.model";
import { Exercise } from "@shared/models/exercise.model";
import { set_state, state } from "./state";
import simpleGit, { RemoteWithRefs, SimpleGit } from "simple-git";
import * as path from "path";
import { retrieveVcsAccessToken } from "../authentication/authentication_api";
import { getLevel1SubfoldersOfWorkspace } from "../utils/filetree";
import { get_course_exercise_by_projectKey } from "../exercise/exercise";

var gitRepo: SimpleGit | undefined;

export async function cloneRepository(repoUrl: string, username: string) {
  // Open a dialog to select the folder where the repo will be cloned
  const selectedFolder = await vscode.window.showOpenDialog({
    canSelectFolders: true,
    openLabel: "Select folder to clone into",
    defaultUri: vscode.Uri.file(settings.default_repo_path ?? ""),
  });

  if (!selectedFolder || selectedFolder.length === 0) {
    throw new Error("No folder selected");
  }

  const session = await vscode.authentication.getSession(AUTH_ID, [], {
    createIfNone: false,
  });
  if (!session) {
    throw new NotAuthenticatedError();
  }

  const vcsToken = await retrieveVcsAccessToken(
    session.accessToken,
    state.displayedExercise?.studentParticipations![0].id!
  );
  // Clone the repository
  const cloneUrlString = addVcsTokenToUrl(repoUrl, username, vcsToken);
  const cloneUrl = new URL(cloneUrlString);

  const destinationPath = selectedFolder[0].fsPath;
  const repoName = path.basename(cloneUrl.pathname, ".git"); // Use repository name as subdirectory name
  const clonePath = path.join(destinationPath, repoName);

  const gitForClone = simpleGit(destinationPath);

  await gitForClone.clone(cloneUrl.toString(), clonePath);

  // Prompt the user to open the cloned folder in a new workspace
  const openIn = await vscode.window.showInformationMessage(
    `Would you like to open the cloned repository?`,
    { modal: true },
    "Open",
    "Open in New Window",
    "Cancel"
  );

  if (openIn === "Open") {
    vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(clonePath));
  } else if (openIn === "Open in New Window") {
    vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(clonePath), true);
  }
}

function addVcsTokenToUrl(url: string, username: string, vsctoken: string): string {
  const credentials = `://${username}:${vsctoken}@`;
  if (!url.includes("@")) {
    // the url has the format https://vcs-server.com
    return url.replace("://", credentials);
  } else {
    // the url has the format https://username@vcs-server.com -> replace ://username@
    return url.replace(/:\/\/.*@/, credentials);
  }
}

export async function submitCurrentWorkspace() {
  if (!gitRepo) {
    throw new Error("No repository in workspace");
  }

  const diff = await gitRepo.diff();
  if (!diff || diff.length == 0) {
    throw new Error("No changes to commit");
  }

  const confirm = await vscode.window.showWarningMessage(
    `Are you sure you want to submit your workspace \n`,
    { modal: true },
    "Confirm"
  );

  if (confirm !== "Confirm") {
    throw new Error("Commit process cancelled");
  }
  await gitRepo.add(".");
  await gitRepo.commit("Submit workspace from artemis plugin");
  await gitRepo.push();
}

export async function detectRepoCourseAndExercise(): Promise<string | undefined> {
  if (gitRepo) {
    console.log("Repo already detected");
    return undefined;
  }

  const session = await vscode.authentication.getSession(AUTH_ID, [], {
    createIfNone: false,
  });
  if (!session) {
    throw new NotAuthenticatedError();
  }

  const foundRepoAndRemote = await getArtemisRepo(session.account.id);
  if (!foundRepoAndRemote) {
    gitRepo = undefined;
    set_state({
      repoCourse: undefined,
      repoExercise: undefined,
      displayedCourse: state.displayedCourse,
      displayedExercise: state.displayedExercise,
    });

    console.log("No Artemis repository found");
    return undefined;
  }

  const projectKey = getProjectKeyFromRepoUrl(foundRepoAndRemote.remote.refs.fetch!);

  const course_exercise: { course: Course; exercise: Exercise } = await get_course_exercise_by_projectKey(
    projectKey
  );

  gitRepo = foundRepoAndRemote.repo;
  set_state({
    repoCourse: course_exercise.course,
    repoExercise: course_exercise.exercise,
    displayedCourse: state.displayedCourse,
    displayedExercise: state.displayedExercise,
  });

  return projectKey;
}

async function getArtemisRepo(
  username: string
): Promise<{ repo: SimpleGit; remote: RemoteWithRefs } | undefined> {
  if (!settings.base_url) {
    throw new Error("Base URL is not set");
  }

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    console.log("No workspace folder available to detect repository");
    return undefined;
  }

  // Get all level 1 subfolders of the workspace
  const level1SubfoldersPath = await getLevel1SubfoldersOfWorkspace(workspaceFolders);

  for (const folderPath of level1SubfoldersPath) {
    const git: SimpleGit = simpleGit(folderPath.fsPath);
    try {
      const isRepo = await git.checkIsRepo();
      if (isRepo) {
        const remotes = await git.getRemotes(true);
        for (const remote of remotes) {
          const url = new URL(remote.refs.fetch!);
          if (url.hostname == new URL(settings.base_url).hostname && url.username == username) {
            return { repo: git, remote: remote };
          }
        }
      }
    } catch (error: any) {
      console.error(`Error checking if folder is a repository: ${error.message}`);
    }
  }

  return undefined;
}

function getProjectKeyFromRepoUrl(repoUrl: string): string {
  // extract projectKey {protocol}://{username}@{host}:{port}/git/{PROJECT_KEY}/{project_key}-{username}.git
  const parts = repoUrl.split("/");
  if (parts.length < 5) {
    throw new Error("Invalid artemis repository URL does not contain project key");
  }

  const projectKey = parts[4];
  return projectKey;
}

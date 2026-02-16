import * as vscode from "vscode";
import { settings } from "./settings";
import { NotAuthenticatedError } from "../authentication/not_authenticated.error";
import { AUTH_ID } from "../authentication/authentication_provider";
import { Course } from "@shared/models/course.model";
import { Exercise, getProjectKey } from "@shared/models/exercise.model";
import { clearRepoState, setRepoState, getState } from "./state";
import simpleGit, { RemoteWithRefs, SimpleGit } from "simple-git";
import { getLevel1SubfoldersOfWorkspace } from "../utils/filetree";
import { getCourseExerciseByRepoUrl } from "../exercise/exercise";
import { getProjectKeyFromRepoUrl } from "@shared/models/participation.model";

var gitRepo: SimpleGit | undefined;

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
    "Confirm",
  );

  if (confirm !== "Confirm") {
    throw new Error("Commit process cancelled");
  }
  await gitRepo.add(".");
  await gitRepo.commit("Submit workspace from artemis plugin");
  await gitRepo.push();

  vscode.window.showInformationMessage("Workspace submitted successfully");
}

export async function detectRepoCourseAndExercise() {
  const session = await vscode.authentication.getSession(AUTH_ID, [], {
    createIfNone: false,
  });
  if (!session) {
    throw new NotAuthenticatedError();
  }

  const foundRepoAndRemote = await getArtemisRepo();
  if (!foundRepoAndRemote) {
    gitRepo = undefined;
    clearRepoState();

    console.log("No Artemis repository found");
    return;
  }

  const repoUrl = foundRepoAndRemote.remote.refs.fetch!;
  if (
    getProjectKeyFromRepoUrl(repoUrl) ===
    getProjectKey(getState().repoCourse, getState().repoExercise)
  ) {
    console.log("Repo already detected");
    gitRepo = foundRepoAndRemote.repo;
    return;
  }

  const course_exercise: { course: Course; exercise: Exercise } =
    await getCourseExerciseByRepoUrl(repoUrl);

  gitRepo = foundRepoAndRemote.repo;
  setRepoState(course_exercise.course, course_exercise.exercise);
}

async function getArtemisRepo(): Promise<{ repo: SimpleGit; remote: RemoteWithRefs } | undefined> {
  if (!settings.base_url) {
    throw new Error("Base URL is not set");
  }

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    console.log("No workspace folder available to detect repository");
    return undefined;
  }

  // Check if the workspace is a git repository
  for (const folder of workspaceFolders) {
    var foundRepo = await checkIfArtemisRepo(folder.uri.fsPath, settings.base_url);
    if (foundRepo) {
      return foundRepo;
    }
  }

  // Get all level 1 subfolders of the workspace
  const level1SubfoldersPath = await getLevel1SubfoldersOfWorkspace(workspaceFolders);

  // Check each level 1 subfolder for a git repository
  for (const folderPath of level1SubfoldersPath) {
    var foundRepo = await checkIfArtemisRepo(folderPath.fsPath, settings.base_url);
    if (foundRepo) {
      return foundRepo;
    }
  }

  return undefined;
}

async function checkIfArtemisRepo(
  workDirectory: string,
  artemisUrl: string,
): Promise<{ repo: SimpleGit; remote: RemoteWithRefs } | undefined> {
  const git: SimpleGit = simpleGit(workDirectory);
  try {
    const isRepo = await git.checkIsRepo();
    if (isRepo) {
      const remotes = await git.getRemotes(true);
      for (const remote of remotes) {
        const url = new URL(remote.refs.fetch!);
        if (url.hostname == new URL(artemisUrl).hostname) {
          return { repo: git, remote: remote };
        }
      }
    }
  } catch (error: any) {
    console.error(`Error checking if folder is a repository: ${error.message}`);
  }

  return undefined;
}

import * as vscode from "vscode";
import { settings } from "./settings";
import { NotAuthenticatedError } from "../authentication/not_authenticated.error";
import { AUTH_ID } from "../authentication/authentication_provider";
import { Course } from "@shared/models/course.model";
import { Exercise, getProjectKey } from "@shared/models/exercise.model";
import { clear_repo_state, set_repo_state, state } from "./state";
import simpleGit, { RemoteWithRefs, SimpleGit } from "simple-git";
import { getLevel1SubfoldersOfWorkspace } from "../utils/filetree";
import { get_course_exercise_by_projectKey } from "../exercise/exercise";
import { getProjectKeyFromRepoUrl } from "../utils/cloning.utils";

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
    "Confirm"
  );

  if (confirm !== "Confirm") {
    throw new Error("Commit process cancelled");
  }
  await gitRepo.add(".");
  await gitRepo.commit("Submit workspace from artemis plugin");
  await gitRepo.push();
}

export async function detectRepoCourseAndExercise() {
  const session = await vscode.authentication.getSession(AUTH_ID, [], {
    createIfNone: false,
  });
  if (!session) {
    throw new NotAuthenticatedError();
  }

  const foundRepoAndRemote = await getArtemisRepo(session.account.id);
  if (!foundRepoAndRemote) {
    gitRepo = undefined;
    clear_repo_state();

    console.log("No Artemis repository found");
    return;
  }

  const projectKey = getProjectKeyFromRepoUrl(foundRepoAndRemote.remote.refs.fetch!);
  if(projectKey === getProjectKey(state.repoCourse, state.repoExercise)) {
    console.log("Repo already detected");
    gitRepo = foundRepoAndRemote.repo;
    return;
  }

  const course_exercise: { course: Course; exercise: Exercise } = await get_course_exercise_by_projectKey(
    projectKey
  );

  gitRepo = foundRepoAndRemote.repo;
  set_repo_state(course_exercise.course, course_exercise.exercise);

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



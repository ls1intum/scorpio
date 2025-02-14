import * as vscode from "vscode";
import { settings } from "./settings";
import { NotAuthenticatedError } from "../authentication/not_authenticated.error";
import { AUTH_ID } from "../authentication/authentication_provider";
import { Course } from "@shared/models/course.model";
import { Exercise, getProjectKey } from "@shared/models/exercise.model";
import { clear_repo_state, set_repo_state, getState, set_displayed_state } from "./state";
import simpleGit, { RemoteWithRefs, SimpleGit } from "simple-git";
import { getLevel1SubfoldersOfWorkspace } from "../utils/filetree";
import { get_course_exercise_by_repoUrl } from "../exercise/exercise";
import { getProjectKeyFromRepoUrl } from "@shared/models/participation.model";
import { pollNewResults } from "../utils/polling";

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

  // if repo and display exercise equal means that we pushed in the currently displayed exercise
  // therefore we need to poll for new results
  (async () => {
    if (getState().displayedExercise?.id === getState().repoExercise?.id) {
      // sleep shortly to make sure that the server has the new commit
      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      await sleep(1000);
      const repoUrl = getState().displayedExercise?.studentParticipations?.at(0)?.repositoryUri;
      if (!repoUrl) {
        return;
      }
      const { course, exercise } = await get_course_exercise_by_repoUrl(repoUrl);
      if(exercise.studentParticipations?.at(0)?.submissions?.at(0)?.results){
        exercise.studentParticipations![0].submissions![0].results = [];
      }
      console.log("First fetch");
      console.log(exercise);
      set_displayed_state(course, exercise);

      // if the result is already loaded we dont need to poll
      if(exercise.studentParticipations?.at(0)?.submissions?.at(0)?.results?.at(0)) {
        return;
      }

      setTimeout(pollNewResults, 20000);
    }
  })();
  vscode.window.showInformationMessage("Workspace submitted successfully");
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

  const repoUrl = foundRepoAndRemote.remote.refs.fetch!;
  if (getProjectKeyFromRepoUrl(repoUrl) === getProjectKey(getState().repoCourse, getState().repoExercise)) {
    console.log("Repo already detected");
    gitRepo = foundRepoAndRemote.repo;
    return;
  }

  const course_exercise: { course: Course; exercise: Exercise } = await get_course_exercise_by_repoUrl(
    repoUrl
  );

  gitRepo = foundRepoAndRemote.repo;
  set_repo_state(course_exercise.course, course_exercise.exercise);
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
          if (url.hostname == new URL(settings.base_url).hostname) {
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

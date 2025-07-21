import * as vscode from "vscode";
import { getState } from "../shared/state";
import { AUTH_ID } from "../authentication/authentication_provider";
import { Course } from "@shared/models/course.model";
import { Exercise, getScoreString } from "@shared/models/exercise.model";
import { fetch_participation_by_repo_name, fetch_result_details, start_exercise } from "../participation/participation.api";
import { NotAuthenticatedError } from "../authentication/not_authenticated.error";
import { fetch_exercise_by_id, fetch_exercise_details_by_id } from "./exercise.api";
import { cloneUserRepo } from "../participation/cloning.service";
import { getLatestResult } from "@shared/models/participation.model";

export async function build_exercise_options(course: Course): Promise<Exercise> {
  const exercises = course.exercises;
  if (!exercises) {
    throw new Error("No exercises found in the course");
  }

  const now = new Date();
  const exerciseOptionsNoDueDate = exercises
    .filter((exercise) => !exercise.dueDate)
    .map((exercise) => ({
      kind: vscode.QuickPickItemKind.Default,
      label: exercise.title!,
      description: getScoreString(exercise),
      detail: "No due date",
      exercise: exercise,
    }));

  const exerciseOptionsPastDueDate = exercises
    .filter((exercise) => exercise.dueDate && exercise.dueDate < now)
    .map((exercise) => ({
      kind: vscode.QuickPickItemKind.Default,
      label: exercise.title!,
      description: getScoreString(exercise),
      detail: `Due on ${exercise.dueDate!.toLocaleString()}`,
      exercise: exercise,
    }))
    .sort((a, b) => b.exercise.dueDate!.getTime() - a.exercise.dueDate!.getTime());

  const exerciseOptionsDue = exercises
    .filter((exercise) => exercise.dueDate && exercise.dueDate >= now)
    .map((exercise) => ({
      kind: vscode.QuickPickItemKind.Default,
      label: exercise.title!,
      description: getScoreString(exercise),
      detail: `Due on ${exercise.dueDate!.toLocaleString()}`,
      exercise: exercise,
    }))
    .sort((a, b) => a.exercise.dueDate!.getTime() - b.exercise.dueDate!.getTime());

  const selectedExercise = await vscode.window.showQuickPick(
    [
      {
        kind: vscode.QuickPickItemKind.Separator,
        label: "Due coming up",
        exercise: undefined,
      },
      ...exerciseOptionsDue,
      {
        kind: vscode.QuickPickItemKind.Separator,
        label: "Past due date",
        exercise: undefined,
      },
      ...exerciseOptionsPastDueDate,
      {
        kind: vscode.QuickPickItemKind.Separator,
        label: "No due date",
        exercise: undefined,
      },
      ...exerciseOptionsNoDueDate,
    ],
    {
      placeHolder: "Select an exercise",
    }
  );
  if (!selectedExercise || !selectedExercise.exercise) {
    throw new Error("No exercise was selected");
  }

  return selectedExercise.exercise;
}

export async function cloneCurrentExercise() {
  const displayedExercise = getState().displayedExercise;
  if (!displayedExercise) {
    throw new Error("No exercise selected");
  }

  let participation = displayedExercise.studentParticipations?.at(0);
  if (!participation) {
    if (displayedExercise.dueDate! < new Date()) {
      throw new Error("Exercise is past due date and cannot be started");
    }
    const session = await vscode.authentication.getSession(AUTH_ID, [], {
      createIfNone: false,
    });
    if (!session) {
      throw new NotAuthenticatedError();
    }

    participation = await start_exercise(session.accessToken, displayedExercise.id!);
  }
  displayedExercise.studentParticipations = [participation];

  await cloneUserRepo(participation.repositoryUri!, participation.participantIdentifier!);
}

export async function get_problem_statement_details(exercise: Exercise) {
  // check if exercise has an active participation
  let course: Course;

  const studentParticipation = exercise.studentParticipations?.at(0);
  if (studentParticipation) {
    // if so query the details by repoUrl of the latest participation
    ({ course: course, exercise: exercise } = await get_course_exercise_by_repoUrl(
      studentParticipation.repositoryUri!
    ));
  } else {
    // if not query the details (mainly the problem statement) by the exercise id
    ({ course, exercise } = await get_course_exercise_by_exercise_id(exercise.id!));
  }

  return { course: course, exercise: exercise };
}

/**
 *
 * @param repoUrl the repository url of the exercise
 * @returns the course plus the exercise with the participation of the repoURL and all submissions, results and feedbacks
 */
export async function get_course_exercise_by_repoUrl(
  repoUrl: string
): Promise<{ course: Course; exercise: Exercise }> {
  const session = await vscode.authentication.getSession(AUTH_ID, [], {
    createIfNone: false,
  });

  if (!session) {
    throw new NotAuthenticatedError();
  }

  const repoName = repoUrl.split("/").pop()!.replace(".git", "");

  let participation = await fetch_participation_by_repo_name(session.accessToken, repoName);
  const participationId = participation.id!;
  const exerciseId = participation.exercise?.id!;

  // fetch the exercise details to get the submissions and results
  const exercise = await fetch_exercise_details_by_id(session.accessToken, exerciseId);
  const course = exercise.course!;

  // fetch the result details to get the feedbacks and test cases
  participation = exercise.studentParticipations?.find((p) => p.id === participationId)!;
  const latestResult = getLatestResult(participation);
  if (!participation || !latestResult) {
    return { course: course, exercise: exercise };
  }  

  const feedbacks = await fetch_result_details(session.accessToken, participationId, latestResult.id!);

  // assign feedbacks to the result
  latestResult.feedbacks = feedbacks;

  // assign test cases to the exercise as they are exercise specific
  exercise.testCases = feedbacks.map((feedback) => feedback.testCase).filter((testCase) => testCase !== undefined);
  
  return { course: course, exercise: exercise };
}

async function get_course_exercise_by_exercise_id(exerciseId: number) {
  const session = await vscode.authentication.getSession(AUTH_ID, [], {
    createIfNone: false,
  });

  if (!session) {
    throw new NotAuthenticatedError();
  }

  const { course: course, exercise: exercise } = await fetch_exercise_by_id(session.accessToken, exerciseId);

  return { course: course, exercise: exercise };
}

import * as vscode from "vscode";
import {
  fetch_exercise_by_exerciseId,
  fetch_programming_exercises_by_courseId,
} from "./exercise.api";
import { state } from "../shared/state";
import { AUTH_ID } from "../authentication/authentication_provider";
import { Course } from "../course/course.model";
import { Exercise } from "./exercise.model";
import {
  fetch_latest_participation,
  start_exercise,
} from "../participation/participation.api";
import { Participation } from "../participation/participation.model";
import { cloneRepository } from "../shared/repository";
import { NotAuthenticatedError } from "../authentication/not_authenticated.error";

export async function fetch_exercise_by_id(
  exerciseId: number
): Promise<Exercise> {
  const session = await vscode.authentication.getSession(AUTH_ID, [], {
    createIfNone: false,
  });
  if (!session) {
    throw new NotAuthenticatedError();
  }

  return await fetch_exercise_by_exerciseId(session.accessToken, exerciseId);
}

function _getScoreString(exercise: Exercise): string {
  const score = exercise.studentParticipations
    ?.at(0)
    ?.results?.filter((result) => result.rated)
    .sort((a, b) => b.completionDate.getTime() - a.completionDate.getTime())
    .at(0)?.score;
  return score ? `${score} %` : "No graded result";
}

export async function build_exercise_options(
  course: Course
): Promise<Exercise> {
  const exercises = course.exercises;
  if (!exercises) {
    throw new Error("No exercises found in the course");
  }

  const now = new Date();
  const exerciseOptionsNoDueDate = exercises
    .filter((exercise) => !exercise.dueDate)
    .map((exercise) => ({
      kind: vscode.QuickPickItemKind.Default,
      label: exercise.title,
      description: _getScoreString(exercise),
      detail: "No due date",
      exercise: exercise,
    }));

  const exerciseOptionsPastDueDate = exercises
    .filter((exercise) => exercise.dueDate && exercise.dueDate < now)
    .map((exercise) => ({
      kind: vscode.QuickPickItemKind.Default,
      label: exercise.title,
      description: _getScoreString(exercise),
      detail: `Due on ${exercise.dueDate!.toLocaleString()}`,
      exercise: exercise,
    }))
    .sort(
      (a, b) => b.exercise.dueDate!.getTime() - a.exercise.dueDate!.getTime()
    );

  const exerciseOptionsDue = exercises
    .filter((exercise) => exercise.dueDate && exercise.dueDate >= now)
    .map((exercise) => ({
      kind: vscode.QuickPickItemKind.Default,
      label: exercise.title,
      description: _getScoreString(exercise),
      detail: `Due on ${exercise.dueDate!.toLocaleString()}`,
      exercise: exercise,
    }))
    .sort(
      (a, b) => a.exercise.dueDate!.getTime() - b.exercise.dueDate!.getTime()
    );

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
  const displayedExercise = state.displayedExercise;
  if (!displayedExercise) {
    throw new Error("No exercise selected");
  }

  const session = await vscode.authentication.getSession(AUTH_ID, [], {
    createIfNone: false,
  });

  if (!session) {
    throw new NotAuthenticatedError();
  }

  let participation: Participation;
  try {
    participation = await fetch_latest_participation(
      session.accessToken,
      displayedExercise.id
    );
  } catch (e) {
    participation = await start_exercise(
      session.accessToken,
      displayedExercise.id
    );
  }

  await cloneRepository(
    participation.repositoryUri,
    participation.participantIdentifier
  );
}

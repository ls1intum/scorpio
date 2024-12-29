import * as vscode from "vscode";
import { state } from "../shared/state";
import { AUTH_ID } from "../authentication/authentication_provider";
import { Course } from "@shared/models/course.model";
import { Exercise } from "@shared/models/exercise.model";
import {
  fetch_feedback,
  fetch_latest_participation,
  start_exercise,
} from "../participation/participation.api";
import { StudentParticipation } from "@shared/models/participation.model";
import { cloneRepository } from "../shared/repository";
import { NotAuthenticatedError } from "../authentication/not_authenticated.error";
import { Result } from "@shared/models/result.model";
import { fetch_course_exercise_projectKey } from "./exercise.api";

function _getScoreString(exercise: Exercise): string {
  const score = exercise.studentParticipations
    ?.at(0)
    ?.results?.filter((result: Result) => result.rated)
    .sort((a: Result, b: Result) => b.completionDate!.getTime() - a.completionDate!.getTime())
    .at(0)?.score;
  return score ? `${score} %` : "No graded result";
}

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
      description: _getScoreString(exercise),
      detail: "No due date",
      exercise: exercise,
    }));

  const exerciseOptionsPastDueDate = exercises
    .filter((exercise) => exercise.dueDate && exercise.dueDate < now)
    .map((exercise) => ({
      kind: vscode.QuickPickItemKind.Default,
      label: exercise.title!,
      description: _getScoreString(exercise),
      detail: `Due on ${exercise.dueDate!.toLocaleString()}`,
      exercise: exercise,
    }))
    .sort((a, b) => b.exercise.dueDate!.getTime() - a.exercise.dueDate!.getTime());

  const exerciseOptionsDue = exercises
    .filter((exercise) => exercise.dueDate && exercise.dueDate >= now)
    .map((exercise) => ({
      kind: vscode.QuickPickItemKind.Default,
      label: exercise.title!,
      description: _getScoreString(exercise),
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

  let participation: StudentParticipation;
  try {
    participation = await fetch_latest_participation(session.accessToken, displayedExercise.id!);
  } catch (e) {
    if (displayedExercise.dueDate! < new Date()) {
      throw new Error("Exercise is past due date and cannot be started");
    }
    participation = await start_exercise(session.accessToken, displayedExercise.id!);
  }

  await cloneRepository(participation.repositoryUri!, participation.participantIdentifier!);
}

export async function get_course_exercise_by_projectKey(
  projectKey: string
): Promise<{ course: Course; exercise: Exercise }> {
  const session = await vscode.authentication.getSession(AUTH_ID, [], {
    createIfNone: false,
  });

  if (!session) {
    throw new NotAuthenticatedError();
  }

  const { course: course, exercise: exercise } = await fetch_course_exercise_projectKey(
    session.accessToken,
    projectKey
  );

  return { course: course, exercise: exercise };
}

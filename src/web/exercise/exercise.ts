import * as vscode from "vscode";
import { fetch_exercise_by_exerciseId, fetch_programming_exercises_by_courseId } from "./exercise.api";
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

export async function fetch_exercise_by_id(exerciseId: number): Promise<Exercise> {
  const session = await vscode.authentication.getSession(AUTH_ID, [], {
    createIfNone: true,
  });
  if (!session) {
    throw new Error(`Please sign in`);
  }

  return await fetch_exercise_by_exerciseId(session.accessToken, exerciseId);
}

export async function build_exercise_options(
  course: Course
): Promise<Exercise> {
  const session = await vscode.authentication.getSession(AUTH_ID, [], {
    createIfNone: true,
  });

  if (!session) {
    throw new Error(`Please sign in`);
  }
  const exercises = await fetch_programming_exercises_by_courseId(session.accessToken, course.id);

  const exerciseOptions = exercises.map((exercise) => ({
    label: exercise.title, // Adjust based on your data structure
    description: "", // Adjust based on your data structure
    exercise: exercise, // Use a unique identifier
  }));
  const selectedExercise = await vscode.window.showQuickPick(exerciseOptions, {
    placeHolder: "Select an item",
  });
  if (!selectedExercise) {
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
    createIfNone: true,
  });

  if (!session) {
    throw new Error("Please sign in");
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

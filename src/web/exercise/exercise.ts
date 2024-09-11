import * as vscode from "vscode";
import { fetch_exercise } from "./exercise_api";
import { CourseOption } from "../course/course";
import { set_state, state } from "../shared/state";
import { AUTH_ID } from "../authentication/authentication_provider";
import { Course } from "../course/course_model";
import { Exercise } from "./exercise_model";
import {
  fetch_latest_participation,
  start_exercise,
} from "../participation/participation_api";
import { Participation } from "../participation/participation_model";
import { cloneRepository } from "../shared/repository";

export async function build_exercise_options(
  course: Course
): Promise<Exercise> {
  const session = await vscode.authentication.getSession(AUTH_ID, [], {
    createIfNone: true,
  });

  if (!session) {
    throw new Error(`Please sign in`);
  }
  const exercises = await fetch_exercise(session.accessToken, course.id);

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
  if (!state.exercise) {
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
      state.exercise.id
    );
  } catch (e) {
    participation = await start_exercise(
      session.accessToken,
      state.exercise.id
    );
  }

  await cloneRepository(
    participation.repositoryUri,
    participation.participantIdentifier
  );
}

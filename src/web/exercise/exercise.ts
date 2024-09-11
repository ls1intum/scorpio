import * as vscode from "vscode";
import { fetch_exercise } from "./exercise_api";
import { CourseOption } from "../course/course";
import { set_state } from "../shared/state";
import { AUTH_ID } from "../authentication/authentication_provider";
import { Course } from "../course/course_model";
import { Exercise } from "./exercise_model";

export async function build_exercise_options(course: Course) : Promise<Exercise>{
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

export function clone_repo() {
  vscode.window.showInformationMessage("Cloning repo");
}

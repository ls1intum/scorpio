import * as vscode from "vscode";
import { fetch_all_courses, fetch_course_by_courseId } from "./course.api";
import { Course, TotalScores } from "@shared/models/course.model";
import { AUTH_ID } from "../authentication/authentication_provider";
import { NotAuthenticatedError } from "../authentication/not_authenticated.error";

export type CourseOption = {
  label: string;
  description: string;
  detail: string;
  course: Course;
};

export async function fetch_course_by_id(courseId: number): Promise<Course> {
  const session = await vscode.authentication.getSession(AUTH_ID, [], {
    createIfNone: false,
  });
  if (!session) {
    throw new NotAuthenticatedError();
  }

  return fetch_course_by_courseId(session.accessToken, courseId);
}

export async function build_course_options(): Promise<Course> {
  const session = await vscode.authentication.getSession(AUTH_ID, [], {
    createIfNone: false,
  });

  if (!session) {
    throw new NotAuthenticatedError();
  }
  const coursesWithScore: { course: Course; totalScores: TotalScores }[] =
    await fetch_all_courses(session.accessToken);

  const courseOptions: CourseOption[] = coursesWithScore
    .map((courseWithScore) => ({
      label: courseWithScore.course.title,
      detail: (() => {
        const nextExercise = courseWithScore.course?.exercises
          ?.filter(
            (exercise) =>
              exercise.dueDate && exercise.dueDate > new Date()
          )
          .sort((a, b) => (a.dueDate! > b.dueDate! ? 1 : -1))
          .at(0);
        return nextExercise
          ? `Next exercise: ${nextExercise.title} due on ${
              nextExercise.dueDate!.toLocaleString()}`
          : "No upcoming exercise";
      })(),
      description: `${courseWithScore.totalScores.studentScores.absoluteScore}/${courseWithScore.totalScores.reachablePoints} Points`,
      course: courseWithScore.course,
    }));

  const selectedCourse = await vscode.window.showQuickPick(courseOptions, {
    placeHolder: "Select a course",
  });
  if (!selectedCourse) {
    throw new Error("No course was selected");
  }

  return selectedCourse.course;
}

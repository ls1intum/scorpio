import * as vscode from "vscode";
import { fetchAllCourses } from "../artemis/course.client";
import { Course } from "@shared/models/course.model";
import { AUTH_ID } from "../authentication/authentication_provider";
import { NotAuthenticatedError } from "../authentication/not_authenticated.error";

export type CourseOption = {
  label: string;
  description: string;
  detail: string;
  course: Course;
};

export async function buildCourseOptions(): Promise<Course> {
  const session = await vscode.authentication.getSession(AUTH_ID, [], {
    createIfNone: false,
  });

  if (!session) {
    throw new NotAuthenticatedError();
  }
  const courses: Course[] = await fetchAllCourses(session.accessToken);

  const courseOptions: CourseOption[] = courses.map((course) => ({
    label: course.title!,
    detail: (() => {
      const nextExercise = course.exercises
        ?.filter((exercise) => exercise.dueDate && exercise.dueDate > new Date())
        .sort((a, b) => (a.dueDate! > b.dueDate! ? 1 : -1))
        .at(0);
      return nextExercise
        ? `Next exercise: ${nextExercise.title} due on ${nextExercise.dueDate!.toLocaleString()}`
        : "No upcoming exercise";
    })(),
    description: `${course.absoluteScore}/${course.maxPoints} Points`,
    course: course,
  }));

  const selectedCourse = await vscode.window.showQuickPick(courseOptions, {
    placeHolder: "Select a course",
  });
  if (!selectedCourse) {
    throw new Error("No course was selected");
  }

  return selectedCourse.course;
}

import * as vscode from "vscode";
import { fetch_all_courses, fetch_course_by_courseId } from "./course.api";
import { Course } from "./course.model";
import { AUTH_ID } from "../authentication/authentication_provider";
import { NotAuthenticatedError } from "../authentication/not_authenticated.error";

export type CourseOption = {
  label: string;
  description: string;
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
  const courses: Course[] = await fetch_all_courses(session.accessToken);

  const courseOptions: CourseOption[] = courses.map((course) => ({
    label: course.title, // Adjust based on your data structure
    description: course.description, // Adjust based on your data structure
    course: course, // Use a unique identifier
  }));

  const selectedCourse = await vscode.window.showQuickPick(courseOptions, {
    placeHolder: "Select an item",
  });
  if (!selectedCourse) {
    throw new Error("No course was selected");
  }

  return selectedCourse.course;
}

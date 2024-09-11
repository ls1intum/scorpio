import * as vscode from "vscode";
import { fetch_courses } from "./course_api";
import { Course } from "./course_model";
import { AUTH_ID } from "../authentication/authentication_provider";

export type CourseOption = {
  label: string;
  description: string;
  course: Course;
};

export async function build_course_options(): Promise<Course> {
  const session = await vscode.authentication.getSession(AUTH_ID, [], {
    createIfNone: true,
  });

  if (!session) {
    throw new Error(`Please sign in`);
  }
  const courses: Course[] = await fetch_courses(session.accessToken);

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

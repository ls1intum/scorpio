import * as vscode from 'vscode';
import { fetch_courses } from "./course_api";
import { Course } from './course_model';
import { AUTH_ID } from '../authentication/authentication_provider';

export type CourseOption = {
    label: string;
    description: string;
    course: Course;
};

export async function build_course_options() {
    let courses;
    try {
        const session = await vscode.authentication.getSession(AUTH_ID, [], { createIfNone: false });
			
        if (!session) {
            throw new Error(`Please sign in`);
        }
        courses = await fetch_courses(session.accessToken);
    } catch (e) {
        vscode.window.showErrorMessage(`error: ${e}`);
        return;
    }

    const courseOptions: CourseOption[] = courses.map(course => ({
        label: course.title, // Adjust based on your data structure
        description: course.description, // Adjust based on your data structure
        course: course, // Use a unique identifier
    }));

    return courseOptions;
}
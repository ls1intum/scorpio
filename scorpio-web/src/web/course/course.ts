import * as vscode from 'vscode';
import { fetch_courses } from "./course_api";
import { Course } from './course_model';

export type CourseOption = {
    label: string;
    description: string;
    course: Course;
};

export async function build_course_options() {
    let courses;
    try {
        courses = await fetch_courses();
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
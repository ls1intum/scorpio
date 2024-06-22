import * as vscode from 'vscode';
import { Course } from './course/course_model';
import { Exercise } from './exercise/exercise_model';

export const settings_base_url: string | undefined = vscode.workspace.getConfiguration('scorpio').get('apiBaseUrl');
export const settings_client_url: string | undefined = vscode.workspace.getConfiguration('scorpio').get('clientBaseUrl');
export const settings_user: string | undefined = vscode.workspace.getConfiguration('scorpio').get('userData.username');
export const settings_password: string | undefined = vscode.workspace.getConfiguration('scorpio').get('userData.password');

export var current_course: Course | undefined = undefined;
export const set_current_course = (course: Course) => {
    current_course = course;
}
export var current_exercise: Exercise | undefined = undefined;
export const set_current_exercise = (exercise: Exercise) => {
    current_exercise = exercise;
}
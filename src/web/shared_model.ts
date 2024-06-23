import * as vscode from 'vscode';
import { Course } from './course/course_model';
import { Exercise } from './exercise/exercise_model';

export interface Current {
    course: Course | undefined;
    exercise: Exercise | undefined;
    onCurrentChange: vscode.EventEmitter<void>
}
export var current: Current = {
    course: undefined,
    exercise: undefined,
    onCurrentChange: new vscode.EventEmitter<void>()
}
export const set_current = (course: Course, exercise: Exercise) => {
    current.course = course;
    current.exercise = exercise;
    current.onCurrentChange.fire();
}
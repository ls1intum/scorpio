import * as vscode from 'vscode';
import { Course } from '../course/course_model';
import { Exercise } from '../exercise/exercise_model';

export interface State {
    course: Course | undefined;
    exercise: Exercise | undefined;
    onStateChange: vscode.EventEmitter<void>
}
export var state: State = {
    course: undefined,
    exercise: undefined,
    onStateChange: new vscode.EventEmitter<void>()
}
export const set_state = (course: Course, exercise: Exercise) => {
    state.course = course;
    state.exercise = exercise;
    state.onStateChange.fire();
}
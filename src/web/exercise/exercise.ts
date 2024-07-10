import * as vscode from 'vscode';
import { fetch_exercise } from './exercise_api';
import { CourseOption } from '../course/course';
import { set_current } from '../shared_model';
import { AUTH_ID } from '../authentication/authentication_provider';

export async function build_exercise_options(courseOptions: CourseOption[] | undefined) {
    if (!courseOptions) {
        return;
    }

    const selectedCourse = await vscode.window.showQuickPick(courseOptions, {
        placeHolder: 'Select an item',
    });
    if (!selectedCourse) {
        vscode.window.showErrorMessage('No course was selected');
        return;
    }

    let exercises;
    try {
        const session = await vscode.authentication.getSession(AUTH_ID, [], { createIfNone: true });
			
        if (!session) {
            throw new Error(`Please sign in`);
        }
        exercises = await fetch_exercise(session.accessToken, selectedCourse.course.id);
    } catch (e) {
        vscode.window.showErrorMessage(`error: ${e}`);
        return;
    }
    const exerciseOptions = exercises.map(exercise => ({
        label: exercise.title, // Adjust based on your data structure
        description: "", // Adjust based on your data structure
        exercise: exercise, // Use a unique identifier
    }));
    const selectedExercise = await vscode.window.showQuickPick(exerciseOptions, {
        placeHolder: 'Select an item',
    });
    if (!selectedExercise) {
        vscode.window.showErrorMessage('No exercise was selected');
        return;
    }

    // set current course here so that if an error occurs before the previous exercise and course are still set
    set_current(selectedCourse.course, selectedExercise.exercise);
}
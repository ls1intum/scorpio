import * as vscode from 'vscode';
import { fetch_exercise } from './exercise_api';
import { CourseOption } from '../course/course';
import { set_current } from '../shared_model';

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
        exercises = await fetch_exercise(selectedCourse.course.id);
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
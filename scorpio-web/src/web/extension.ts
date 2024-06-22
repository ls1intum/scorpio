// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { authenticateCookieCmd, authenticateTokenCmd} from './authentication/authentication';
import { fetch_courses } from './course/course_api';
import { fetch_exercise } from './exercise/exercise_api';
import { getTest } from './test_api';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "scorpio-web" is now active!');

	context.subscriptions.push(
		vscode.commands.registerCommand('scorpio.test', async () => {
			vscode.window.showInformationMessage('Start API test');
			try{
				console.log(`start test`);
				const testBody = await getTest();
				console.log(`Test return: ${testBody}`);
			}catch(e){
				vscode.window.showErrorMessage(`error: ${e}`);
				return;
			}
	}));

	// command to authenticate the user with the Artemis server
	context.subscriptions.push(
		vscode.commands.registerCommand('scorpio.authenticateCookie', async () => authenticateCookieCmd()));

	// command to authenticate the user with the Artemis server
	context.subscriptions.push(
		vscode.commands.registerCommand('scorpio.authenticateToken', async () => authenticateTokenCmd()));

	// command to select a course and exercise
	context.subscriptions.push(
		vscode.commands.registerCommand('scorpio.selectExercise', async () => {
			let courses;
			try{
				courses = await fetch_courses();
			}catch(e){
				vscode.window.showErrorMessage(`error: ${e}`);
				return;
			}

			const courseOptions = courses.map(course => ({
				label: course.title, // Adjust based on your data structure
				description: course.description, // Adjust based on your data structure
				itemId: course.id, // Use a unique identifier
			}));
			const selectedCourse = await vscode.window.showQuickPick(courseOptions, {
				placeHolder: 'Select an item',
			});
			if (!selectedCourse) {
				vscode.window.showErrorMessage('Course is required');
				return;
			}

			let exercises;
			try{
				exercises = await fetch_exercise(selectedCourse.itemId);
			}catch(e){
				vscode.window.showErrorMessage(`error: ${e}`);
				return;
			}
			const exerciseOptions = exercises.map(exercise => ({
				label: exercise.title, // Adjust based on your data structure
				description: "", // Adjust based on your data structure
				itemId: exercise.id, // Use a unique identifier
			}));
			const selectedExercise = await vscode.window.showQuickPick(exerciseOptions, {
				placeHolder: 'Select an item',
			});
			if (!selectedCourse) {
				vscode.window.showErrorMessage('Course is required');
				return;
			}
	}));
}

// This method is called when your extension is deactivated
export function deactivate() {}

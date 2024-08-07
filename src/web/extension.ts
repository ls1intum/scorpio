// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { build_course_options } from './course/course';
import { build_exercise_options } from './exercise/exercise';
import { SidebarProvider } from './sidebarProvider';
import { ArtemisAuthenticationProvider } from './authentication/authentication_provider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "scorpio" is now active!');

	context.subscriptions.push(
		new ArtemisAuthenticationProvider(context.secrets)
	);

	// register sidebar for problem statement
	const sidebarProvider = new SidebarProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider("artemis-sidebar", sidebarProvider)
	);

	// command to select a course and exercise
	context.subscriptions.push(
		vscode.commands.registerCommand('scorpio.selectExercise', async () => {
			const courseOptions = await build_course_options();

			await build_exercise_options(courseOptions);
		}));
}

// This method is called when your extension is deactivated
export function deactivate() { }

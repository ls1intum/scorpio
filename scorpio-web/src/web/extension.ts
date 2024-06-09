// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { authenticate } from './authentication';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "scorpio-web" is now active!');

	context.subscriptions.push(
		vscode.commands.registerCommand('scorpio.authenticate', async () => {
			vscode.window.showInformationMessage('Start Authentication');
			const username = await vscode.window.showInputBox({ prompt: 'Enter Username' });
			const password = await vscode.window.showInputBox({ prompt: 'Enter Password', password: true });
			if (!username || !password) {
				vscode.window.showErrorMessage('Username and Password are required');
				return;
			}
			authenticate(username, password);
			authenticate("artemis_admin", "artemis_admin");
	}));

	context.subscriptions.push(
		vscode.commands.registerCommand('scorpio.selectCourse', async () => {
			vscode.window.showInformationMessage('NOT IMPLEMENTED');
	}));
}

// This method is called when your extension is deactivated
export function deactivate() {}

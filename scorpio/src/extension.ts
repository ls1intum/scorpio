// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ArtemisPanel } from './artemisPanel';
import { SidebarProvider } from './sidebarProvider';
import { authenticate } from './authentication';

// npm run compile

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "scorpio" is now active!');

	const sidebarProvider = new SidebarProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider("artemis-sidebar", sidebarProvider)
	);
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = 

	context.subscriptions.push(vscode.commands.registerCommand('scorpio.openWebview', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Opening Artemis');
		// Create and show a new webview
		ArtemisPanel.createOrShow(context.extensionUri);
	}));

	context.subscriptions.push(
		vscode.commands.registerCommand('scorpio.authenticate', () => {
			vscode.window.showInformationMessage('Start Authentication');
			authenticate("artemis_admin", "artemis_admin");
	}));
}

// This method is called when your extension is deactivated
export function deactivate() {}

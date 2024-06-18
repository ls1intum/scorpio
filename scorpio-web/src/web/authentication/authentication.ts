import * as vscode from 'vscode';
import { testuser, testpassword } from '../config';
import { authenticateCookie, authenticateToken } from './authentication_api';

export var token:string;

export async function authenticateCookieCmd(){
		vscode.window.showInformationMessage('Start Cookie Authentication');
		const username = await vscode.window.showInputBox({ prompt: 'Enter Username' });
		const password = await vscode.window.showInputBox({ prompt: 'Enter Password', password: true });
		if (!username || !password) {
			// vscode.window.showErrorMessage('Username and Password are required');

			vscode.window.showWarningMessage('falling back to test credentials');
			console.log(`authenticate with ${testuser}, ${testpassword}`);// TODO: remove this line
			authenticateCookie(testuser, testpassword); // TODO: remove this line
			return;
		}

		try{
			console.log(`authenticate with ${username}, ${password}`);
			authenticateCookie(username, password);
		}catch(e){
			vscode.window.showErrorMessage(`error: ${e}`);
			return;
		}
}

export async function authenticateTokenCmd(){
		vscode.window.showInformationMessage('Start Token Authentication');
		const username = await vscode.window.showInputBox({ prompt: 'Enter Username' });
		const password = await vscode.window.showInputBox({ prompt: 'Enter Password', password: true });
		if (!username || !password) {
			// vscode.window.showErrorMessage('Username and Password are required');

			vscode.window.showWarningMessage('falling back to test credentials');
			console.log(`authenticate with ${testuser}, ${testpassword}`);// TODO: remove this line
			token = await authenticateToken(testuser, testpassword); // TODO: remove this line
			return;
		}

		try{
			console.log(`authenticate with ${username}, ${password}`);// TODO: remove this line
			token = await authenticateToken(username, password);
		}catch(e){
			vscode.window.showErrorMessage(`error: ${e}`);
			return;
		}
}
import * as vscode from 'vscode';
import { settings} from '../config';
import { authenticateToken } from './authentication_api';

export var token:string;

export async function authenticateTokenCmd(){
		vscode.window.showInformationMessage('Start Token Authentication');
		const username = await vscode.window.showInputBox({ value: settings.user, prompt: 'Enter Username'});
		const password = await vscode.window.showInputBox({ value: settings.password, prompt: 'Enter Password', password: true });


		try{
			console.log(`authenticate with ${username}, ${password}`);// TODO: remove this line
			token = await authenticateToken(username, password);
		}catch(e){
			console.error(`error: ${e}`);
			vscode.window.showErrorMessage(`error: ${e}`);
			return;
		}
}
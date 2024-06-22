import * as vscode from 'vscode';

export const settings_base_url: string | undefined= vscode.workspace.getConfiguration('scorpio').get('apiBaseUrl');
export const settings_user: string | undefined = vscode.workspace.getConfiguration('scorpio').get('userData.username');
export const settings_password: string | undefined = vscode.workspace.getConfiguration('scorpio').get('userData.password');
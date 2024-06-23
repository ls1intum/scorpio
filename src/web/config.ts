import * as vscode from 'vscode';

type Settings = {
    base_url: string | undefined,
    client_url: string | undefined,
    user: string | undefined,
    password: string | undefined

}
export const settings: Settings = {
    base_url: vscode.workspace.getConfiguration('scorpio').get('apiBaseUrl'),
    client_url: vscode.workspace.getConfiguration('scorpio').get('clientBaseUrl'),
    user: vscode.workspace.getConfiguration('scorpio').get('userData.username'),
    password: vscode.workspace.getConfiguration('scorpio').get('userData.password')
}


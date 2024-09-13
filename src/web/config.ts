import * as vscode from 'vscode';

type Settings = {
    base_url: string | undefined,
    client_url: string | undefined,
    default_repo_path: string | undefined,
    user: string | undefined,
    password: string | undefined
}

export const settings: Settings = {
    base_url: vscode.workspace.getConfiguration('scorpio').get('artemis.apiBaseUrl'),
    client_url: vscode.workspace.getConfiguration('scorpio').get('artemis.clientBaseUrl'),
    default_repo_path: vscode.workspace.getConfiguration('scorpio').get('defaults.repoPath'),
    user: vscode.workspace.getConfiguration('scorpio').get('credentials.username'),
    password: vscode.workspace.getConfiguration('scorpio').get('credentials.password')
}


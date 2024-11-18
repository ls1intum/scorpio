import * as vscode from "vscode";
import { cloneTheia } from "./cloning";
import * as dotenv from "dotenv";
import * as path from "path";
import { AUTH_ID } from "../authentication/authentication_provider";
import { exit } from "process";

// const envFilePath = path.resolve(__dirname, "../.env");
// dotenv.config({ path: envFilePath });

export const theiaEnv: boolean = process.env.THEIA == "true";
export const theiaArtemisToken = process.env.ARTEMIS_TOKEN;
export const theiaArtemisUrl = process.env.ARTEMIS_URL;
export const theiaGitCloneUrl = process.env.GIT_URI ? new URL(process.env.GIT_URI) : undefined;
export const theiaGitUserName = process.env.GIT_USER;
export const theiaGitUserMail = process.env.GIT_MAIL;

export async function initTheia(context: vscode.ExtensionContext) {
  let envVariables = 'Env variables:\n';
  context.environmentVariableCollection.forEach((variable, name) => {
    envVariables += `${name}: ${variable}\n`;
  });
  vscode.window.showInformationMessage(envVariables);

  if (!theiaEnv) {
    return;
  }

  vscode.window.showInformationMessage("Theia environment detected");
  if (!theiaArtemisToken || !theiaArtemisUrl || !theiaGitCloneUrl || !theiaGitUserName || !theiaGitUserMail) {
    vscode.window.showErrorMessage(
      "The Theia environment variables are not configured correctly. Quitting extension."
    );
    exit(1);
  }

  vscode.commands.executeCommand("setContext", "scorpio.theia", true);

  // make authentication
  if (
    await vscode.authentication.getSession(AUTH_ID, [], {
      createIfNone: true,
    })
  ) {
    vscode.commands.executeCommand("setContext", "scorpio.authenticated", true);
  } else {
    vscode.window.showErrorMessage("User could not be authenticated with token in environment");
  }

  // clone repository
  cloneTheia(theiaGitCloneUrl!);

  // login should trigger workspace detection
}

import * as vscode from "vscode";
import { cloneTheia } from "./cloning";
import * as dotenv from 'dotenv';
import * as path from 'path';
import { AUTH_ID } from "../authentication/authentication_provider";
import { exit } from "process";


const envFilePath = path.resolve(__dirname, '../.env');
dotenv.config({path: envFilePath}); 
export const theiaEnv: boolean = process.env.THEIA == "true";
export const tokenEnv = process.env.ARTEMIS_TOKEN;
export const cloneUrlEnv = process.env.ARTEMIS_CLONE_URL ? new URL(process.env.ARTEMIS_CLONE_URL) : undefined;

export async function initTheia() {
  if (!theiaEnv) {
    return;
  }

  vscode.window.showInformationMessage("Theia environment detected");
  if (!tokenEnv) {
    vscode.window.showErrorMessage("No token in environment for theia usecase");
  }
  if (!cloneUrlEnv) {
    vscode.window.showErrorMessage(
      "No clone url in environment for theia usecase"
    );
  }

  vscode.commands.executeCommand("setContext", "scorpio.theia", true);

  // make authentication
  if (
    await vscode.authentication.getSession(AUTH_ID, [], {
      createIfNone: true,
    })
  ) {
    vscode.commands.executeCommand(
      "setContext",
      "scorpio.authenticated",
      true
    );
  }else {
    vscode.window.showErrorMessage("User could not be authenticated with token in environment");
  }

  // clone repository
  cloneTheia(cloneUrlEnv!);

  // login should trigger workspace detection
}

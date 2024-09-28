import * as vscode from "vscode";
import { exit } from "process";
import { cloneTheia } from "./cloning";
import { ArtemisAuthenticationProvider } from "../authentication/authentication_provider";
import * as dotenv from 'dotenv';
import * as path from 'path';


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
  vscode.commands.executeCommand("setContext", "scorpio.theia", true);

  // make authentication
  if (!tokenEnv) {
    vscode.window.showErrorMessage("No token in environment for theia usecase");
    exit(1);
  }
  if (!cloneUrlEnv) {
    vscode.window.showErrorMessage(
      "No clone url in environment for theia usecase"
    );
    exit(1);
  }

  // clone repository
  cloneTheia(cloneUrlEnv);

  // login should trigger workspace detection
}

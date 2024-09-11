// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { build_course_options } from "./course/course";
import { build_exercise_options, cloneCurrentExercise } from "./exercise/exercise";
import { SidebarProvider } from "./sidebar/sidebarProvider";
import {
  ArtemisAuthenticationProvider,
  AUTH_ID,
} from "./authentication/authentication_provider";
import { set_state } from "./shared/state";
import { cloneRepository } from "./shared/repository";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "scorpio" is now active!');

  var authenticationProvider = new ArtemisAuthenticationProvider(
    context.secrets
  );

  context.subscriptions.push(authenticationProvider);

  // command to login
  context.subscriptions.push(
    vscode.commands.registerCommand("scorpio.login", async () => {
      vscode.authentication.getSession(AUTH_ID, [], {
        createIfNone: true,
      });

      vscode.window.showInformationMessage("You are logged in now");
    })
  );

  // command to logout
  context.subscriptions.push(
    vscode.commands.registerCommand("scorpio.logout", async () => {
      authenticationProvider.removeSession();
      vscode.window.showInformationMessage("You have been logged out");
    })
  );

  // command to select a course and exercise
  context.subscriptions.push(
    vscode.commands.registerCommand("scorpio.selectExercise", async () => {
      try {
        const course = await build_course_options();

        const exercise = await build_exercise_options(course);

        set_state(course, exercise);
      } catch (e) {
        vscode.window.showErrorMessage(`${e}`);
        return;
      }
    })
  );

  // command to clone repository
  context.subscriptions.push(
    vscode.commands.registerCommand("scorpio.currentExercise.clone", async () => {
      cloneCurrentExercise()
        .then(() => {
          vscode.window.showInformationMessage(
            `Repository cloned successfully.`
          );
        })
        .catch((e) => {
          vscode.window.showErrorMessage(
            `Failed to clone repository: ${(e as Error).message}`
          );
        });
    })
  );

  // register sidebar for problem statement
  const sidebarProvider = new SidebarProvider(
    context.extensionUri,
    authenticationProvider
  );
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "artemis-sidebar",
      sidebarProvider
    )
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}

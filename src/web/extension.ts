// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { build_course_options } from "./course/course";
import { build_exercise_options } from "./exercise/exercise";
import { SidebarProvider } from "./sidebar/sidebarProvider";
import {
  ArtemisAuthenticationProvider,
  AUTH_ID,
} from "./authentication/authentication_provider";

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
      vscode.authentication
        .getSession(AUTH_ID, [], {
          createIfNone: false,
        })
        .then((session) => {
          if (session) {
            vscode.window.showInformationMessage("You are already logged in");
          } else {
            vscode.authentication.getSession(AUTH_ID, [], {
              createIfNone: true,
            });
          }
        });
    })
  );

  // command to logout
  context.subscriptions.push(
    vscode.commands.registerCommand("scorpio.logout", async () => {
      authenticationProvider.removeSession();
      vscode.window.showInformationMessage("You have been logged out");
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

  // command to select a course and exercise
  context.subscriptions.push(
    vscode.commands.registerCommand("scorpio.selectExercise", async () => {
      const courseOptions = await build_course_options();

      await build_exercise_options(courseOptions);
    })
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}

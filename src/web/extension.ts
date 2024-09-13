// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { build_course_options } from "./course/course";
import {
  build_exercise_options,
  cloneCurrentExercise,
} from "./exercise/exercise";
import { SidebarProvider } from "./sidebar/sidebarProvider";
import {
  ArtemisAuthenticationProvider,
  AUTH_ID,
} from "./authentication/authentication_provider";
import { set_state, state } from "./shared/state";
import {
  detectRepoCourseAndExercise,
  submitCurrentWorkspace,
} from "./shared/repository";
import { sync_problem_statement_with_workspace } from "./problemStatement/problem_statement";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "scorpio" is now active!');

  const authenticationProvider = initAuthentication(context);

  const sidebar = initSidebar(context, authenticationProvider);

  registerCommands(context, authenticationProvider, sidebar);

  (async () => {
    // TODO make wait until everything else is initialized
    await new Promise((resolve) => setTimeout(resolve, 2500));
    detectRepoCourseAndExercise()
      .then(() => {
        vscode.commands.executeCommand(
          "setContext",
          "scorpio.repoDetected",
          true
        );
      })
      .catch((e) => {
        set_state({
          repoCourse: undefined,
          repoExercise: undefined,
          displayedCourse: state.displayedCourse,
          displayedExercise: state.displayedExercise,
        });
        vscode.commands.executeCommand(
          "setContext",
          "scorpio.repoDetected",
          false
        );

        console.warn(e);
        vscode.window.showWarningMessage(`${e}`);
      });
  })();
}

function initAuthentication(
  context: vscode.ExtensionContext
): ArtemisAuthenticationProvider {
  var authenticationProvider = new ArtemisAuthenticationProvider(
    context.secrets
  );

  context.subscriptions.push(authenticationProvider);

  return authenticationProvider;
}

function initSidebar(
  context: vscode.ExtensionContext,
  authenticationProvider: ArtemisAuthenticationProvider
): SidebarProvider {
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

  return sidebarProvider;
}

function registerCommands(
  context: vscode.ExtensionContext,
  authenticationProvider: ArtemisAuthenticationProvider,
  sidebar: SidebarProvider
) {
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
    vscode.commands.registerCommand("scorpio.displayExercise", async () => {
      try {
        const course = await build_course_options();

        const exercise = await build_exercise_options(course);

        set_state({
          displayedCourse: course,
          displayedExercise: exercise,
          repoCourse: state.repoCourse,
          repoExercise: state.repoExercise,
        });
      } catch (e) {
        console.error(e);
        vscode.window.showErrorMessage(`${e}`);
        return;
      }
    })
  );

  // command to clone repository
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "scorpio.displayedExercise.clone",
      async () => {
        cloneCurrentExercise()
          .then(() => {
            vscode.window.showInformationMessage(
              `Repository cloned successfully.`
            );
          })
          .catch((e) => {
            console.error(e);
            vscode.window.showErrorMessage(
              `Failed to clone repository: ${(e as Error).message}`
            );
          });
      }
    )
  );

  // command to submit workspace
  context.subscriptions.push(
    vscode.commands.registerCommand("scorpio.workspace.submit", async () => {
      submitCurrentWorkspace()
        .then(() => {
          vscode.window.showInformationMessage(
            `Workspace submitted successfully.`
          );
        })
        .catch((e) => {
          console.error(e);
          vscode.window.showErrorMessage(
            `Failed to submit workspace: ${(e as Error).message}`
          );
        });
    })
  );

  // command to sync problem statement with workspace
  context.subscriptions.push(
    vscode.commands.registerCommand("scorpio.workspace.sync", async () => {
      sync_problem_statement_with_workspace()
        .then(() => {
          vscode.window.showInformationMessage(
            `Workspace synced successfully.`
          );
        })
        .catch((e) => {
          console.error(e);
          vscode.window.showErrorMessage(
            `Failed to sync workspace: ${(e as Error).message}`
          );
        });
    })
  );

  // command to refresh sidebar
  context.subscriptions.push(
    vscode.commands.registerCommand("scorpio.sidebar.refresh", () => {
      sidebar.resolveWebviewView(sidebar._view!);
      vscode.window.showInformationMessage("Refreshed Artemis Sidebar");
    })
  );
}

function listenToEvents() {
  // listen to workspace changes to display problem statement
  vscode.workspace.onDidChangeWorkspaceFolders((event) => {
    if (event.added.length === 0) {
      console.warn("No workspace added");
    }

    detectRepoCourseAndExercise()
      .then(() => {
        vscode.commands.executeCommand(
          "setContext",
          "scorpio.repoDetected",
          true
        );
      })
      .catch((e) => {
        console.warn(e);
      });
  });
}

// This method is called when your extension is deactivated
export function deactivate() {}

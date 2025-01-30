// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { build_course_options } from "./course/course";
import { build_exercise_options, cloneCurrentExercise } from "./exercise/exercise";
import { SidebarProvider } from "./sidebar/sidebarProvider";
import { ArtemisAuthenticationProvider, AUTH_ID } from "./authentication/authentication_provider";
import { clear_repo_state, set_displayed_state, state } from "./shared/state";
import { sync_problem_statement_with_workspace } from "./problemStatement/problem_statement";
import { NotAuthenticatedError } from "./authentication/not_authenticated.error";
import { initTheia, theiaEnv } from "./theia/theia";
import { initSettings } from "./shared/settings";
import { detectRepoCourseAndExercise, submitCurrentWorkspace } from "./shared/repository.service";

export var authenticationProvider: ArtemisAuthenticationProvider;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "scorpio" is now active!');

  initTheia();

  initSettings();

  initAuthentication(context);

  const sidebar = initSidebar(context);

  registerCommands(context, sidebar);

  listenToEvents();

  if (!theiaEnv.GIT_URI) {
    vscode.commands.executeCommand("scorpio.workspace.detectRepo");
  }
}

function initAuthentication(context: vscode.ExtensionContext) {
  authenticationProvider = new ArtemisAuthenticationProvider(context.secrets);

  context.subscriptions.push(authenticationProvider);

  // check if user is already authenticated
  // is needed for the login button to be displayed on the profile button
  (async () => {
    let session: vscode.AuthenticationSession | undefined;
    session = await vscode.authentication.getSession(AUTH_ID, [], {
      createIfNone: theiaEnv.ARTEMIS_TOKEN !== undefined,
    });

    vscode.commands.executeCommand("setContext", "scorpio.authenticated", session !== undefined);
  })();

  authenticationProvider.onAuthSessionsChange.event(({ added, removed, changed }) => {
    if (added && added.length > 0) {
      vscode.commands.executeCommand("setContext", "scorpio.authenticated", true);
      vscode.commands.executeCommand("scorpio.workspace.detectRepo");
      return;
    }

    if (removed && removed.length > 0) {
      vscode.commands.executeCommand("setContext", "scorpio.authenticated", false);

      clear_repo_state();
      set_displayed_state(undefined, undefined);
      return;
    }
  });
}

function initSidebar(context: vscode.ExtensionContext): SidebarProvider {
  // register sidebar for problem statement
  const sidebarProvider = new SidebarProvider(
    context.extensionUri,
    authenticationProvider.onAuthSessionsChange
  );
  context.subscriptions.push(vscode.window.registerWebviewViewProvider("artemis-sidebar", sidebarProvider));

  return sidebarProvider;
}

function registerCommands(context: vscode.ExtensionContext, sidebar: SidebarProvider) {
  context.subscriptions.push(
    vscode.commands.registerCommand("scorpio.restart", () => {
      deactivate();
      activate(context);
    })
  );

  // command to login
  context.subscriptions.push(
    vscode.commands.registerCommand("scorpio.login", async () => {
      try {
        const token = await vscode.authentication.getSession(AUTH_ID, [], {
          createIfNone: true,
        });
        if (!token) {
          vscode.window.showErrorMessage("Login failed");
          return;
        }
      } catch (e) {
        _errorMessage(e, LogLevel.ERROR, "Failed to login");
      }
    })
  );

  // command to logout
  context.subscriptions.push(
    vscode.commands.registerCommand("scorpio.logout", async () => {
      vscode.window
        .showWarningMessage("Sign out from Artemis - Scorpio", { modal: true }, "Sign out")
        .then((value) => {
          if (value === "Sign out") {
            authenticationProvider.removeSession();
            vscode.authentication.getSession(AUTH_ID, [], {
              createIfNone: false,
            });
          }
        });
    })
  );

  // command to select a course and exercise
  context.subscriptions.push(
    vscode.commands.registerCommand("scorpio.displayExercise", async () => {
      try {
        const course = await build_course_options();

        const exercise = await build_exercise_options(course);

        set_displayed_state(course, exercise);
      } catch (e) {
        _errorMessage(e, LogLevel.ERROR, "Failed to display Exercise");
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("scorpio.displayedExercise.back", () => {
      if (state.displayedExercise) {
        // only remove exercise to get into exercise selection
        set_displayed_state(state.displayedCourse, undefined);
      } else {
        // remove course to get into course selection
        set_displayed_state(undefined, undefined);
      }
    })
  );

  // command to clone repository
  context.subscriptions.push(
    vscode.commands.registerCommand("scorpio.displayedExercise.clone", async () => {
      cloneCurrentExercise().catch((e) => {
        _errorMessage(e, LogLevel.ERROR, "Failed to clone repository");
      });
    })
  );

  // command to submit workspace
  context.subscriptions.push(
    vscode.commands.registerCommand("scorpio.workspace.submit", async () => {
      submitCurrentWorkspace().catch((e) => {
        _errorMessage(e, LogLevel.ERROR, "Failed to submit workspace");
      });
    })
  );

  // command to detect repo in workspace
  context.subscriptions.push(
    vscode.commands.registerCommand("scorpio.workspace.detectRepo", async () => {
      detectRepoCourseAndExercise()
        .catch((e) => {
          _errorMessage(e, LogLevel.ERROR, "Failed to detect repo");
        });
    })
  );

  // command to sync problem statement with workspace
  context.subscriptions.push(
    vscode.commands.registerCommand("scorpio.workspace.sync", async () => {
      sync_problem_statement_with_workspace().catch((e) => {
        _errorMessage(e, LogLevel.ERROR, "Failed to sync workspace");
      });
    })
  );

  // command to refresh sidebar
  context.subscriptions.push(
    vscode.commands.registerCommand("scorpio.sidebar.refresh", () => {
      sidebar.resolveWebviewView(sidebar._view!);
    })
  );
}

function listenToEvents() {
  // listen to workspace changes to display problem statement
  vscode.workspace.onDidChangeWorkspaceFolders((event) => {
    vscode.commands.executeCommand("scorpio.workspace.detectRepo");
  });
}

enum LogLevel {
  INFO = "info",
  ERROR = "error",
  WARN = "warn",
}
function _errorMessage(e: any, logLevel: LogLevel = LogLevel.ERROR, messagePrefix: string = "") {
  switch (logLevel) {
    case LogLevel.INFO:
      console.info(e);
      if (e instanceof NotAuthenticatedError) {
        vscode.window.showInformationMessage(`${messagePrefix}: ${e.message}`, "Login").then((value) => {
          if (value === "Login") {
            vscode.commands.executeCommand("scorpio.login");
          }
        });
        return;
      }
      if (e instanceof Error) {
        vscode.window.showInformationMessage(`${messagePrefix}: ${e.message}`);
        return;
      }

      vscode.window.showInformationMessage(`${messagePrefix}: ${e}`);
      break;
    case LogLevel.ERROR:
      console.error(e);
      if (e instanceof NotAuthenticatedError) {
        vscode.window.showErrorMessage(`${messagePrefix}: ${e.message}`, "Login").then((value) => {
          if (value === "Login") {
            vscode.commands.executeCommand("scorpio.login");
          }
        });
        return;
      }
      if (e instanceof Error) {
        vscode.window.showErrorMessage(`${messagePrefix}: ${e.message}`);
        return;
      }

      vscode.window.showErrorMessage(`${messagePrefix}: ${e}`);
      break;
    case LogLevel.WARN:
      console.warn(e);
      if (e instanceof NotAuthenticatedError) {
        vscode.window.showWarningMessage(`${messagePrefix}: ${e.message}`, "Login").then((value) => {
          if (value === "Login") {
            vscode.commands.executeCommand("scorpio.login");
          }
        });
        return;
      }
      if (e instanceof Error) {
        vscode.window.showWarningMessage(`${messagePrefix}: ${e.message}`);
        return;
      }

      vscode.window.showWarningMessage(`${messagePrefix}: ${e}`);
      break;
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import "./utils/fetch.interceptor";
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
import { NotAuthenticatedError } from "./authentication/not_authenticated.error";
import { initTheia, theiaEnv } from "./theia/theia";
import { initSettings } from "./shared/settings";

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

  (async () => {
    // TODO make wait until everything else is initialized
    await new Promise((resolve) => setTimeout(resolve, 2500));
    vscode.commands.executeCommand("scorpio.workspace.detectRepo");
  })();
}

function initAuthentication(
  context: vscode.ExtensionContext
) {
  authenticationProvider = new ArtemisAuthenticationProvider(
    context.secrets
  );

  context.subscriptions.push(authenticationProvider);

  // check if user is already authenticated
  // is needed for the login button to be displayed on the profile button
  (async () => {
    if (
      await vscode.authentication.getSession(AUTH_ID, [], {
        createIfNone: theiaEnv != null,
      })
    ) {
      vscode.commands.executeCommand(
        "setContext",
        "scorpio.authenticated",
        true
      );
    }
  })();

  authenticationProvider.onAuthSessionsChange.event(
    ({ added, removed, changed }) => {
      if (added && added.length > 0) {
        vscode.commands.executeCommand(
          "setContext",
          "scorpio.authenticated",
          true
        );
        vscode.commands.executeCommand("scorpio.workspace.detectRepo");
        return;
      }

      if (removed && removed.length > 0) {
        vscode.commands.executeCommand(
          "setContext",
          "scorpio.authenticated",
          false
        );
        set_state({
          displayedCourse: undefined,
          displayedExercise: undefined,
          repoCourse: undefined,
          repoExercise: undefined,
        });
        return;
      }
    }
  );
}

function initSidebar(
  context: vscode.ExtensionContext,
): SidebarProvider {
  // register sidebar for problem statement
  const sidebarProvider = new SidebarProvider(
    context.extensionUri,
    authenticationProvider.onAuthSessionsChange
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
  sidebar: SidebarProvider
) {
  context.subscriptions.push(
    vscode.commands.registerCommand("scorpio.restart", () => {
      deactivate();
      activate(context);
    })
  )

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

        vscode.window.showInformationMessage("You are logged in now");
      } catch (e) {
        _errorMessage(e, LogLevel.ERROR, "Failed to login");
      }
    })
  );

  // command to logout
  context.subscriptions.push(
    vscode.commands.registerCommand("scorpio.logout", async () => {
      vscode.window
        .showWarningMessage(
          "Sign out from Artemis - Scorpio",
          { modal: true },
          "Sign out"
        )
        .then((value) => {
          if (value === "Sign out") {
            authenticationProvider.removeSession();
            vscode.window.showInformationMessage("You have been logged out");
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

        set_state({
          displayedCourse: course,
          displayedExercise: exercise,
          repoCourse: state.repoCourse,
          repoExercise: state.repoExercise,
        });
      } catch (e) {
        _errorMessage(e, LogLevel.ERROR, "Failed to display Exercise");
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("scorpio.displayedExercise.back",  () => {
      if(state.displayedExercise){
        // only remove exercise to get into exercise selection
        set_state({
          displayedCourse: state.displayedCourse,
          displayedExercise: undefined,
          repoCourse: state.repoCourse,
          repoExercise: state.repoExercise,
        });
      } else {
        set_state({
          displayedCourse: undefined,
          displayedExercise: undefined,
          repoCourse: state.repoCourse,
          repoExercise: state.repoExercise,
        });
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
            _errorMessage(e, LogLevel.ERROR, "Failed to clone repository");
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
          _errorMessage(e, LogLevel.WARN, "Failed to submit workspace");
        });
    })
  );

  // command to detect repo in workspace
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "scorpio.workspace.detectRepo",
      async () => {
        detectRepoCourseAndExercise()
          .then((projectKey: string | undefined) => {
            if (!projectKey) {
              return;
            }

            vscode.window.showInformationMessage(`Repo detected successfully.`);
          })
          .catch((e) => {
            _errorMessage(e, LogLevel.ERROR, "Failed to detect repo");
          });
      }
    )
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
          _errorMessage(e, LogLevel.ERROR, "Failed to sync workspace");
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
    vscode.commands.executeCommand("scorpio.workspace.detectRepo");
  });
}

enum LogLevel {
  INFO = "info",
  ERROR = "error",
  WARN = "warn",
}
function _errorMessage(
  e: any,
  logLevel: LogLevel = LogLevel.ERROR,
  messagePrefix: string = ""
) {
  switch (logLevel) {
    case LogLevel.INFO:
      console.info(e);
      if (e instanceof NotAuthenticatedError) {
        vscode.window
          .showInformationMessage(`${messagePrefix}: ${e.message}`, "Login")
          .then((value) => {
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
        vscode.window
          .showErrorMessage(`${messagePrefix}: ${e.message}`, "Login")
          .then((value) => {
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
        vscode.window
          .showWarningMessage(`${messagePrefix}: ${e.message}`, "Login")
          .then((value) => {
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

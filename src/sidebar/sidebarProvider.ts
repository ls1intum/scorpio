import * as vscode from "vscode";
import { onStateChange, set_state, State, state } from "../shared/state";
import { AUTH_ID } from "../authentication/authentication_provider";
import { settings } from "../shared/settings";
import { Course } from "@shared/models/course.model";
import { getUri } from "./getUri";
import { getNonce } from "./getNonce";
import { fetch_all_courses } from "../course/course.api";
import {
  fetch_programming_exercises_by_courseId,
} from "../exercise/exercise.api";
import { CommandFromExtension, CommandFromWebview } from "@shared/webview-commands";
import { get_course_exercise_by_projectKey } from "../exercise/exercise";
import { fetch_uml } from "../problemStatement/uml.api";

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  htmlContent?: string;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly onAuthSessionsChange: vscode.EventEmitter<vscode.AuthenticationProviderAuthenticationSessionsChangeEvent>
  ) {
    onStateChange.event((e: State) => {
      this.displayExercise();
    });

    onAuthSessionsChange.event(async ({ added, removed, changed }) => {
      if (added && added.length > 0) {
        this.login(added[0]);
        return;
      }
      if (removed && removed.length > 0) {
        this.logout();
        return;
      }
    });

    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("scorpio.?")) {
        this.easterEgg();
      }
    });
  }

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,
      localResourceRoots: [
        // vscode.Uri.joinPath(this._extensionUri, "out"),
        vscode.Uri.joinPath(this._extensionUri, "dist"),
        vscode.Uri.joinPath(this._extensionUri, "webview/build"),
      ],
    };

    this.initHTML();

    webviewView.onDidChangeVisibility((e) => {
      this.initState();
    });

    this.initState();

    webviewView.webview.onDidReceiveMessage(async (data) => {
      const pathParts = data.command.split("/");
      switch (pathParts[0]) {
        case CommandFromWebview.INFO: {
          if (!data.text) {
            return;
          }
          vscode.window.showInformationMessage(`Sidebar: ${data.text}`);
          break;
        }
        case CommandFromWebview.ERROR: {
          if (!data.text) {
            return;
          }
          console.error(data.text);
          vscode.window.showErrorMessage(`Sidebar: ${data.text}`);
          break;
        }
        case CommandFromWebview.LOGIN: {
          vscode.commands.executeCommand("scorpio.login");
          break;
        }
        case CommandFromWebview.GET_COURSE_OPTIONS: {
          const session = await vscode.authentication.getSession(AUTH_ID, [], {
            createIfNone: false,
          });
          if (!session) {
            return;
          }
          const courses: Course[] = await fetch_all_courses(
            session.accessToken
          );
          this._view?.webview.postMessage({
            command: CommandFromExtension.SEND_COURSE_OPTIONS,
            text: JSON.stringify(courses),
          });
          break;
        }
        case CommandFromWebview.GET_EXERCISE_OPTIONS: {
          const session = await vscode.authentication.getSession(AUTH_ID, [], {
            createIfNone: false,
          });
          if (!session) {
            return;
          }
          const exercises = await fetch_programming_exercises_by_courseId(
            session.accessToken,
            state.displayedCourse!.id!
          );
          this._view?.webview.postMessage({
            command: CommandFromExtension.SEND_EXERCISE_OPTIONS,
            text: JSON.stringify(exercises),
          });
          break;
        }
        case CommandFromWebview.GET_EXERCISE_DETAILS: {
          const { course: course, exercise: exercise } = await get_course_exercise_by_projectKey(
            state.displayedCourse!.shortName! + state.displayedExercise!.shortName!
          );
          set_state({
            displayedCourse: course,
            displayedExercise: exercise,
            repoCourse: state.repoCourse,
            repoExercise: state.repoExercise,
          });
          break;
        }
        case CommandFromWebview.GET_UML: {
          if (!data.text) {
            return;
          }

          const session = await vscode.authentication.getSession(AUTH_ID, [], {
            createIfNone: false,
          });
          if (!session) {
            return;
          }
          const plantUml = await fetch_uml(session.accessToken, data.text);
          this._view?.webview.postMessage({
            command: CommandFromExtension.SEND_UML + "/" + pathParts[1],
            text: plantUml,
          });
          break;
        }
        case CommandFromWebview.CLONE_REPOSITORY: {
          vscode.commands.executeCommand("scorpio.displayedExercise.clone");
          break;
        }
        case CommandFromWebview.SUBMIT: {
          vscode.commands.executeCommand("scorpio.workspace.submit");
          break;
        }
        case CommandFromWebview.SET_COURSE_AND_EXERCISE: {
          if (!data.text) {
            return;
          }
          const { course, exercise } = JSON.parse(data.text);
          set_state({
            displayedCourse: course,
            displayedExercise: exercise,
            repoCourse: state.repoCourse,
            repoExercise: state.repoExercise,
          });
          break;
        }
      }
    });
  }

  private initHTML() {
    if (!this._view) {
      return;
    }

    // The CSS file from the Angular build output
    const stylesUri = getUri(this._view.webview, this._extensionUri, ["webview", "build", "browser", "styles.css"]);
    // The JS files from the Angular build output
    const polyfillsUri = getUri(this._view.webview, this._extensionUri, ["webview", "build", "browser", "polyfills.js"]);
    const scriptUri = getUri(this._view.webview, this._extensionUri, ["webview", "build", "browser", "main.js"]);

    const nonce = getNonce();

    this._view.webview.html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${this._view.webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; font-src ${this._view.webview.cspSource};">
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>Hello World</title>
        </head>
        <body>
          <app-root></app-root>
          <script type="module" nonce="${nonce}" src="${polyfillsUri}"></script>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
  }

  private async initState() {
    const session = await vscode.authentication.getSession(AUTH_ID, [], {
      createIfNone: false,
    });
    if (session) {
      this.login(session);
      this.displayExercise();
    }

    this.easterEgg();
  }

  private login(session: vscode.AuthenticationSession) {
    this._view?.webview.postMessage({
      command: CommandFromExtension.SHOW_COURSE_SELECTION,
    });
  }

  private logout() {
    this._view?.webview.postMessage({
      command: CommandFromExtension.SHOW_LOGIN,
    });
  }

  private displayExercise() {
    const repoKey =
      state.repoCourse && state.repoExercise
        ? state.repoCourse.shortName!.toUpperCase() + state.repoExercise.shortName!.toUpperCase()
        : undefined;
    const course = state.displayedCourse;
    const exercise = state.displayedExercise;

    if (!course && !exercise) {
      this._view?.webview.postMessage({
        command: CommandFromExtension.SHOW_COURSE_SELECTION,
      });
      return;
    }

    if (course && !exercise) {
      this._view?.webview.postMessage({
        command: CommandFromExtension.SHOW_EXERCISE_SELECTION,
        text: JSON.stringify({
          course: course,
        }),
      });
      return;
    }

    if (course && exercise) {
      this._view?.webview.postMessage({
        command: CommandFromExtension.SHOW_PROBLEM_STATEMENT,
        text: JSON.stringify({
          course: course,
          exercise: exercise,
          repoKey: repoKey,
        }),
      });
      return;
    }
  }

  private easterEgg() {
    this._view?.webview.postMessage({
      command: CommandFromExtension.EASTER_EGG,
      text: `${settings.easter_egg}`,
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;

    this.initState();
  }
}

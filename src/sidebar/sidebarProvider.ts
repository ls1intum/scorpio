import * as vscode from "vscode";
import * as fs from "fs";
import { onStateChange, set_state, state } from "../shared/state";
import { ArtemisAuthenticationProvider, AUTH_ID } from "../authentication/authentication_provider";
import { settings } from "../shared/config";
import { Exercise } from "../exercise/exercise.model";
import { Course } from "../course/course.model";
import { getUri } from "./getUri";
import { getNonce } from "./getNonce";

enum IncomingCommands {
  INFO = "info",
  ERROR = "error",
  LOGIN = "login",
  CLONE_REPOSITORY = "cloneRepository",
  SUBMIT = "submit",
  SET_EXERCISE = "setExercise",
}

enum OutgoingCommands {
  SEND_ACCESS_TOKEN = "sendAccessToken",
  LOGOUT = "logout",
  SET_EXERCISE = "setExercise",
  EASTER_EGG = "easterEgg",
}

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  htmlContent?: string;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly onAuthSessionsChange: vscode.EventEmitter<vscode.AuthenticationProviderAuthenticationSessionsChangeEvent>
  ) {
    onStateChange.event((e) => {
      const repoKey =
        e.repoCourse && e.repoExercise
          ? e.repoCourse.shortName.toUpperCase() + e.repoExercise.shortName.toUpperCase()
          : undefined;
      this.displayExercise(e.displayedCourse, e.displayedExercise, repoKey);
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
      localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, "dist"), vscode.Uri.joinPath(this._extensionUri, "webview/build")],
    };

    this.initHTML();

    webviewView.onDidChangeVisibility((e) => {
      this.initState();
    });

    this.initState();

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.command) {
        case IncomingCommands.INFO: {
          if (!data.text) {
            return;
          }
          vscode.window.showInformationMessage(`Sidebar: ${data.text}`);
          break;
        }
        case IncomingCommands.ERROR: {
          if (!data.text) {
            return;
          }
          console.error(data.text);
          vscode.window.showErrorMessage(`Sidebar: ${data.text}`);
          break;
        }
        case IncomingCommands.LOGIN: {
          vscode.commands.executeCommand("scorpio.login");
          break;
        }
        case IncomingCommands.CLONE_REPOSITORY: {
          vscode.commands.executeCommand("scorpio.displayedExercise.clone");
          break;
        }
        case IncomingCommands.SUBMIT: {
          vscode.commands.executeCommand("scorpio.workspace.submit");
          break;
        }
        case IncomingCommands.SET_EXERCISE: {
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
    const stylesUri = getUri(this._view.webview, this._extensionUri, ["webview", "build", "styles.css"]);
    // The JS files from the Angular build output
    const runtimeUri = getUri(this._view.webview, this._extensionUri, ["webview", "build", "runtime.js"]);
    const polyfillsUri = getUri(this._view.webview, this._extensionUri, ["webview", "build", "polyfills.js"]);
    const scriptUri = getUri(this._view.webview, this._extensionUri, ["webview", "build", "main.js"]);

    const nonce = getNonce();

    this._view.webview.html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${this._view.webview.cspSource}; script-src 'nonce-${nonce}';">
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>Hello World</title>
        </head>
        <body>
          <app-root></app-root>
          <script type="module" nonce="${nonce}" src="${runtimeUri}"></script>
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
    }

    const repoKey =
      state.repoCourse && state.repoExercise
        ? state.repoCourse.shortName.toUpperCase() + state.repoExercise.shortName.toUpperCase()
        : undefined;
    this.displayExercise(state.displayedCourse, state.displayedExercise, repoKey);

    this.easterEgg();
  }

  private login(session: vscode.AuthenticationSession) {
    this._view?.webview.postMessage({
      command: OutgoingCommands.SEND_ACCESS_TOKEN,
      text: `${session.accessToken}`,
    });
  }

  private logout() {
    this._view?.webview.postMessage({
      command: OutgoingCommands.LOGOUT,
    });
  }

  private displayExercise(
    course: Course | undefined,
    exercise: Exercise | undefined,
    repoKey: string | undefined
  ) {
    this._view?.webview.postMessage({
      command: OutgoingCommands.SET_EXERCISE,
      text: JSON.stringify({
        course: course,
        exercise: exercise,
        repoKey: repoKey,
      }),
    });
  }

  private easterEgg() {
    this._view?.webview.postMessage({
      command: OutgoingCommands.EASTER_EGG,
      text: `${settings.easter_egg}`,
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;

    this.initState();
  }
}

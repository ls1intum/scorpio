import * as vscode from "vscode";
import { onStateChange, set_state, state } from "../shared/state";
import {
  ArtemisAuthenticationProvider,
  AUTH_ID,
} from "../authentication/authentication_provider";
import artemisHTML from "./artemis.html";
import artemisJS from "!raw-loader!./artemis.js";
import { settings } from "../shared/config";
import { Exercise } from "../exercise/exercise.model";
import { Course } from "../course/course.model";

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
          ? e.repoCourse.shortName.toUpperCase() +
            e.repoExercise.shortName.toUpperCase()
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
  }

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
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

    this.htmlContent = artemisHTML;
    const styleVSCodeUri = this._view.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );

    // import JS File
    const script = artemisJS;
    this.htmlContent = this.htmlContent!.replace("${script}", script);
    this.htmlContent = this.htmlContent!.replace(
      /\$\{base_url\}/g,
      settings.base_url!
    );
    this.htmlContent = this.htmlContent!.replace(
      /\$\{client_url\}/g,
      settings.client_url!
    );
    this.htmlContent = this.htmlContent!.replace(
      "${styleVSCodeUri}",
      styleVSCodeUri.toString()
    );

    this._view.webview.html = this.htmlContent;
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
        ? state.repoCourse.shortName.toUpperCase() +
          state.repoExercise.shortName.toUpperCase()
        : undefined;
    this.displayExercise(
      state.displayedCourse,
      state.displayedExercise,
      repoKey
    );
  }

  private async login(session: vscode.AuthenticationSession) {
    this._view?.webview.postMessage({
      command: OutgoingCommands.SEND_ACCESS_TOKEN,
      text: `${session.accessToken}`,
    });
  }

  private async logout() {
    this._view?.webview.postMessage({
      command: OutgoingCommands.LOGOUT,
    });
  }

  private async displayExercise(
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

  public revive(panel: vscode.WebviewView) {
    this._view = panel;

    this.initState();
  }
}

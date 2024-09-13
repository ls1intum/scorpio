import * as vscode from "vscode";
import { onStateChange, state } from "../shared/state";
import { ArtemisAuthenticationProvider } from "../authentication/authentication_provider";
import artemisHTML from "./artemis.html";
import artemisJS from "!raw-loader!./artemis.js";
import { cloneCurrentExercise } from "../exercise/exercise";

enum IncomingCommands {
  INFO = "info",
  ERROR = "error",
  CLONE_REPOSITORY = "cloneRepository",
  SUBMIT = "submit",
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
    private readonly authenticationProvider: ArtemisAuthenticationProvider
  ) {
    onStateChange.event((e) => {
      if (e.displayedCourse && e.displayedExercise) {
        const showSubmitButton =
          e.displayedCourse.id == e.repoCourse?.id &&
          e.displayedExercise.id == e.repoExercise?.id;
        this.setExercise(
          e.displayedCourse.id,
          e.displayedExercise.id,
          showSubmitButton
        );
      }
    });

    authenticationProvider.onAuthSessionsChange.event(
      async ({ added, removed, changed }) => {
        if (added && added.length > 0) {
          await this.login(added[0]);
        } else if (removed && removed.length > 0) {
          await this.logout();
        }
      }
    );
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
        case IncomingCommands.CLONE_REPOSITORY: {
          vscode.commands.executeCommand("scorpio.displayedExercise.clone");
          break;
        }
        case IncomingCommands.SUBMIT: {
          vscode.commands.executeCommand("scorpio.workspace.submit");
          break;
        }
      }
    });
  }

  private initHTML() {
    this.htmlContent = artemisHTML;

    // import JS File
    const scriptUri = artemisJS;
    this.htmlContent = this.htmlContent!.replace("scriptUri", scriptUri);

    if (this._view) {
      this._view.webview.html = this.htmlContent;
    }
  }

  private initState() {
    this.authenticationProvider.getSessions().then((sessions) => {
      if (sessions.length > 0) {
        this.login(sessions[0]);
      }
    });

    if (state.displayedCourse && state.displayedExercise) {
      const showSubmitButton =
        state.displayedCourse.id == state.repoCourse?.id &&
        state.displayedExercise.id == state.repoExercise?.id;
      this.setExercise(
        state.displayedCourse.id,
        state.displayedExercise.id,
        showSubmitButton
      );
    }
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

  private async setExercise(
    courseId: number,
    exerciseId: number,
    showSubmitButton: boolean
  ) {
    this._view?.webview.postMessage({
      command: OutgoingCommands.SET_EXERCISE,
      text: `{"courseId": ${courseId}, "exerciseId": ${exerciseId}, "showSubmitButton": ${showSubmitButton}}`,
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;

    this.initState();
  }
}

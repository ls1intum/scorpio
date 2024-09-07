import * as vscode from "vscode";
import { current } from "../shared_model";
import { ArtemisAuthenticationProvider } from "../authentication/authentication_provider";
import artemisHTML from "./artemis.html";
import artemisJS from "!raw-loader!./artemis.js"

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  htmlContent?: string;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly authenticationProvider: ArtemisAuthenticationProvider
  ) {
    current.onCurrentChange.event(() => {
      this.setExercise(current.course!.id, current.exercise!.id);
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

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.command) {
        case "info": {
          if (!data.text) {
            return;
          }
          vscode.window.showInformationMessage(data.text);
          break;
        }
        case "error": {
          if (!data.text) {
            return;
          }
          console.error(data.text);
          vscode.window.showErrorMessage(data.text);
          break;
        }
      }
    });

    this.authenticationProvider.getSessions().then((sessions) => {
      if (sessions.length > 0) {
        this.login(sessions[0]);
      }
    });
  }

  private initHTML() {
    this.htmlContent = artemisHTML;

    // import JS File
    const scriptUri = artemisJS;
    this.htmlContent = this.htmlContent.replace("scriptUri", scriptUri);

    if (this._view) {
      this._view.webview.html = this.htmlContent;
    }
  }

  private async login(session: vscode.AuthenticationSession) {
    this._view?.webview.postMessage({
      command: "sendAccessToken",
      text: `${session.accessToken}`,
    });
  }

  private async logout() {
    this._view?.webview.postMessage({
      command: "logout",
    });
  }

  private async setExercise(courseId: number, exerciseId: number) {
    this._view?.webview.postMessage({
      command: "setExercise",
      text: `{"courseId": ${courseId}, "exerciseId": ${exerciseId}}`,
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }
}

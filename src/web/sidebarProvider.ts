import * as vscode from "vscode";
import { settings } from "./config";
import { current } from "./shared_model";

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) { 
    current.onCurrentChange.event(() => {
      this.updateWebviewContent();
    })
  }

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    console.log("resolveWebviewView");
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    this.updateWebviewContent();

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "onInfo": {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case "onError": {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
      }
    });
  }

  private updateWebviewContent(){
    if (!this._view) {
      return;
    }

    // TODO if current_course is undefined, show a message to select a course and exercise
    if (!current.course || !current.exercise) {
      vscode.window.showErrorMessage("Please select a course and exercise");
      return;
    }

    this._view.webview.html = this._getHtmlForWebview(this._view.webview);
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );

    const problemStatementUrl = `${settings.client_url}/courses/${current.course?.id}/exercises/${current.exercise?.id}`

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Angular App</title>
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
        <style>
        html, body {
          height: 100%;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
        iframe {
          width: 100%;
          height: 93%;
          border: none;
          margin: 5px;
          display: block;
        }
        </style>
			</head>
      <body>
      <h1> Artemis </h1>
      <iframe src="${problemStatementUrl}" sandbox="allow-scripts allow-same-origin allow-forms"></iframe>      
			</body>
			</html>`;
  }
}
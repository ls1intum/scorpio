import { Component } from "@angular/core";
import { CommandFromWebview } from "@shared/webview-commands";
import { vscode } from "src/app/vscode";

@Component({
  selector: "submit-button",
  imports: [],
  templateUrl: "./submit-button.component.html",
  styleUrl: "./submit-button.component.css",
})
export class SubmitButton {
  constructor() {}

  protected onClick() {
    vscode.postMessage({
      command: CommandFromWebview.SUBMIT,
    });
  }
}

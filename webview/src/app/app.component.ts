import { Component, OnInit } from "@angular/core";
import { provideVSCodeDesignSystem, vsCodeButton } from "@vscode/webview-ui-toolkit";
import { vscode } from "./vscode";

provideVSCodeDesignSystem().register(vsCodeButton());

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  title = "Angular App";

  ngOnInit() {
    // Listen for messages from the extension
    window.addEventListener("message", (event) => {
      const message = event.data;
      if (message.command === "updateTitle") {
        this.title = message.text;
      }
    });
  }

  sendMessage() {
    vscode.postMessage({ command: "info", text: "clicked button in webview" });
  }
}

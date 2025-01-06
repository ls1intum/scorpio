import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { vscode } from "../vscode";
import { CommonModule } from "@angular/common";
import { CommandFromWebview } from "@shared/webview-commands";

@Component({
  selector: "login",
  templateUrl: "./login.view.html",
  styleUrls: ["./login.view.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginView {
  requestLogin() {
    vscode.postMessage({ command: CommandFromWebview.LOGIN, text: undefined });
  }
}

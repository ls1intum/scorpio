import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { vscode } from "../vscode";
import { CommonModule } from "@angular/common";

enum OutgoingCommands {
  LOGIN = "login",
}

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
    console.log("Pressed login");
    vscode.postMessage({ command: OutgoingCommands.LOGIN, text: undefined });
  }
}

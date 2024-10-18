import { ChangeDetectionStrategy, Component } from "@angular/core";
import { vscode } from "../vscode";

enum OutgoingCommands {
  LOGIN = "login",
}

@Component({
  selector: "login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  requestLogin() {
    console.log("Pressed login");
    vscode.postMessage({ command: OutgoingCommands.LOGIN, text: undefined });
  }
}

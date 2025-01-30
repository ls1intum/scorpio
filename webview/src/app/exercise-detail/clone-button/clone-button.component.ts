import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { Exercise } from "@shared/models/exercise.model";
import { CommandFromWebview } from "@shared/webview-commands";
import { vscode } from "src/app/vscode";

@Component({
  selector: "clone-button",
  templateUrl: "./clone-button.component.html",
  styleUrls: ["./clone-button.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
})
export class CloneButton {
  constructor() {}

  protected onClick() {
    vscode.postMessage({
      command: CommandFromWebview.CLONE_REPOSITORY,
    });
  }
}

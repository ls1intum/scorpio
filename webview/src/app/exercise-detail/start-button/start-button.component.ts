import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { Exercise } from "@shared/models/exercise.model";
import { CommandFromWebview } from "@shared/webview-commands";
import { vscode } from "src/app/vscode";

@Component({
  selector: "start-button",
  templateUrl: "./start-button.component.html",
  styleUrls: ["./start-button.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
})
export class StartButton {
  exercise = input.required<Exercise>();

  constructor() {}

  protected onClick() {
    vscode.postMessage({
      command: CommandFromWebview.CLONE_REPOSITORY,
    });
  }
}

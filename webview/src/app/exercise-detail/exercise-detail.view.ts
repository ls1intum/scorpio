import {
  ChangeDetectionStrategy,
  Component,
  input,
  Input,
  OnInit,
  signal,
  WritableSignal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProblemStatementComponent } from "./problem-statement/problem-statement.component";
import { Feedback } from "@shared/models/feedback.model";
import { CommandFromExtension, CommandFromWebview } from "@shared/webview-commands";
import { Participation } from "@shared/models/participation.model";
import { Result } from "@shared/models/result.model";
import { vscode } from "src/app/vscode";
import { Exercise } from "@shared/models/exercise.model";
import { Course } from "@shared/models/course.model";

@Component({
  selector: "exercise-detail",
  templateUrl: "./exercise-detail.view.html",
  styleUrls: ["./exercise-detail.view.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, ProblemStatementComponent],
})
export class ExerciseDetailView implements OnInit {
  course = input.required<Course>();

  @Input({ required: true })
  exercise!: WritableSignal<Exercise>;

  repoKey = input.required<string>();

  feedbackList: WritableSignal<Feedback[]> = signal([]);

  constructor() {}

  ngOnInit() {
    window.addEventListener("message", (event) => {
      const message = event.data; // The JSON data
      if (message.command === CommandFromExtension.SEND_FEEDBACK) {
        this.feedbackList.set(JSON.parse(message.text));
      }
    });

    // query exercise details for problem statement
    if (!this.exercise().problemStatement) {
      vscode.postMessage({
        command: CommandFromWebview.GET_EXERCISE_DETAILS,
        text: JSON.stringify({
          exerciseId: this.exercise().id,
        }),
      });
    }

    // query Feedback
    // participations and results should be passed from the parent component already
    if (this.exercise().studentParticipations) {
      const part: Participation = this.exercise().studentParticipations![0];
      // get latest result
      const result: Result | undefined = part.results?.[part.results.length - 1];
      if (result) {
        vscode.postMessage({
          command: CommandFromWebview.GET_FEEDBACK,
          text: JSON.stringify({
            participationId: this.exercise().studentParticipations![0].id,
            resultId: result.id,
          }),
        });
      }
    }
  }
}

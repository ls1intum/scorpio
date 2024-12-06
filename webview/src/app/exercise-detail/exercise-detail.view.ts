import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
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
import { ScoreButton } from "./score-button/score-button.component";

@Component({
  selector: "exercise-detail",
  templateUrl: "./exercise-detail.view.html",
  styleUrls: ["./exercise-detail.view.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, ScoreButton, ProblemStatementComponent],
})
export class ExerciseDetailView implements OnInit {
  course = input.required<Course>();

  exercise = input.required<Exercise>();

  repoKey = input.required<string>();

  latestResult = computed(() => {
    return this.exercise()
      .studentParticipations?.at(0)
      ?.results?.sort((a: Result, b: Result) => a.id - b.id)
      ?.at(0);
  });

  feedbackList = computed(() => {
    return this.latestResult()?.feedbacks ?? [];
  });

  constructor() {
    effect(() => console.log(this.exercise()));
  }

  ngOnInit() {
    // query exercise details for problem statement
    if (!this.exercise().problemStatement) {
      // this will set the displayed exercise so retrieval is not needed
      vscode.postMessage({
        command: CommandFromWebview.GET_EXERCISE_DETAILS,
        text: JSON.stringify({
          exerciseId: this.exercise().id,
        }),
      });
    }
  }
}

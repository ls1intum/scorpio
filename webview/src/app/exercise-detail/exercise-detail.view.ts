import { ChangeDetectionStrategy, Component, computed, effect, input, OnInit, Signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProblemStatementComponent } from "./problem-statement/problem-statement.component";
import { CommandFromWebview } from "@shared/webview-commands";
import { Result } from "@shared/models/result.model";
import { vscode } from "src/app/vscode";
import { Exercise } from "@shared/models/exercise.model";
import { Course } from "@shared/models/course.model";
import { StartButton } from "./start-button/start-button.component";
import { ExerciseOverview } from "./header-table/overview.component";

@Component({
  selector: "exercise-detail",
  templateUrl: "./exercise-detail.view.html",
  styleUrls: ["./exercise-detail.view.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, StartButton, ExerciseOverview, ProblemStatementComponent],
})
export class ExerciseDetailView implements OnInit {
  course = input.required<Course>();

  exercise = input.required<Exercise>();

  repoKey = input.required<string>();

  latestResult: Signal<Result | undefined> = computed(() =>
    this.exercise()
      .studentParticipations?.at(0)
      ?.results.reduce((latestResult, currentResult) => {
        return latestResult.id! > currentResult.id! ? latestResult : currentResult;
      })
  );

  now = computed(() => new Date());

  constructor() {}

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

import { ChangeDetectionStrategy, Component, computed, effect, input, OnInit, Signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProblemStatementComponent } from "./problem-statement/problem-statement.component";
import { CommandFromWebview } from "@shared/webview-commands";
import { Result } from "@shared/models/result.model";
import { vscode } from "src/app/vscode";
import { ProgrammingExercise } from "@shared/models/exercise.model";
import { Course } from "@shared/models/course.model";
import { CloneButton } from "./clone-button/clone-button.component";
import { ExerciseOverview } from "./header-table/overview.component";
import { getLatestResult } from "@shared/models/participation.model";
import { SubmitButton } from "./submit-button/submit-button.component";

@Component({
  selector: "exercise-detail",
  templateUrl: "./exercise-detail.view.html",
  styleUrls: ["./exercise-detail.view.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, CloneButton, SubmitButton, ExerciseOverview, ProblemStatementComponent],
})
export class ExerciseDetailView implements OnInit {
  course = input.required<Course>();

  exercise = input.required<ProgrammingExercise>();

  repoKey = input.required<string>();
  protected repoKeyEqualsDisplayed = computed(() => this.repoKey() === this.exercise().projectKey);

  now = computed(() => new Date());

  constructor() {}

  ngOnInit() {
    // query exercise details for problem statement
    // this will set the displayed exercise so retrieval is not needed
    vscode.postMessage({
      command: CommandFromWebview.GET_EXERCISE_DETAILS,
      text: JSON.stringify({
        exerciseId: this.exercise().id,
      }),
    });
  }
}

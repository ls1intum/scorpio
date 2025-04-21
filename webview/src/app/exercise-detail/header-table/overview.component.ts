import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { Exercise } from "@shared/models/exercise.model";
import { ScoreButton } from "../overall-score/score-button.component";
import { getLatestResultBySubmission, getLatestSubmission } from "@shared/models/participation.model";

@Component({
  selector: "overview",
  templateUrl: "./overview.component.html",
  styleUrls: ["./overview.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, ScoreButton],
})
export class ExerciseOverview {
  exercise = input.required<Exercise>();

  private latestSubmission = computed(() => getLatestSubmission(this.exercise().studentParticipations?.at(0)));
  
  protected latestResult = computed(() => getLatestResultBySubmission(this.latestSubmission()));
  protected loading = computed(() => !!this.latestSubmission() && !this.latestResult());

  constructor() {}
}

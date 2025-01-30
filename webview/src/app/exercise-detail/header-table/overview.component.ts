import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { Exercise } from "@shared/models/exercise.model";
import { ScoreButton } from "../overall-score/score-button.component";
import { getLatestResult } from "@shared/models/participation.model";

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

  protected latestResult = computed(() => getLatestResult(this.exercise().studentParticipations?.at(0)));

  constructor() {}
}

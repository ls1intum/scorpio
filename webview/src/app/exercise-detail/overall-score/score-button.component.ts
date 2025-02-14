import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { Result } from "@shared/models/result.model";
import { FeedbackListComponent } from "../test-result/feedback-list.component";

@Component({
  selector: "score-button",
  templateUrl: "./score-button.component.html",
  styleUrls: ["./score-button.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, FeedbackListComponent],
})
export class ScoreButton {
  loading = input.required<boolean>();
  result = input<Result>();

  maxPoints = input.required<number>();

  protected absoluteScore = computed(() => {
    return ((this.result()!.score! * this.maxPoints()) / 100).toFixed(1);
  });

  constructor() {}
}

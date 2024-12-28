import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { Result } from "@shared/models/result.model";
import { FeedbackListComponent } from "../test-result/feedback-list.component";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faX } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: "score-button",
  templateUrl: "./score-button.component.html",
  styleUrls: ["./score-button.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, FeedbackListComponent, FaIconComponent],
})
export class ScoreButton {
  result = input<Result>();

  maxPoints = input.required<number>();

  protected absoluteScore = computed(() => {
    return ((this.result()!.score!  * this.maxPoints()) / 100).toFixed(1);
  });

  protected faX = faX

  constructor() {}
}

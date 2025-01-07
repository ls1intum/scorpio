import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, input, output } from "@angular/core";
import { Feedback } from "@shared/models/feedback.model";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";

@Component({
  selector: "feedback-list",
  templateUrl: "./feedback-list.component.html",
  styleUrls: ["./feedback-list.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, FaIconComponent],
})
export class FeedbackListComponent {
  onClose = output<void>();
  feedbackList = input.required<Feedback[]>();

  protected failedFeedbackList = computed(() => this.feedbackList().filter((feedback) => !feedback.positive));
  protected passedFeedbackList = computed(() => this.feedbackList().filter((feedback) => feedback.positive));

  protected readonly faX = faX;

  constructor() {}

  closeDialog() {
    this.onClose.emit();
  }
}

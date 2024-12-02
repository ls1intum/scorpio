import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, input} from "@angular/core";
import { Feedback } from "@shared/models/feedback.model";

@Component({
  selector: "feedback-list",
  templateUrl: "./feedback-list.component.html",
  styleUrls: ["./feedback-list.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
})
export class FeedbackListComponent {
  feedbackList = input.required<Feedback[]>();

  protected failedFeedbackList = computed(() => this.feedbackList().filter((feedback) => !feedback.positive));
  protected passedFeedbackList = computed(() => this.feedbackList().filter((feedback) => feedback.positive));

  constructor() {}
}

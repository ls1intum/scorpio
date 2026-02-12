import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { Task } from "./task.model";
import { Feedback } from "@shared/models/feedback.model";
import { FeedbackListComponent } from "../../test-result/feedback-list.component";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import {
  faCircleCheck,
  faCircleQuestion,
  faCircleXmark,
} from "@fortawesome/free-regular-svg-icons";

@Component({
  selector: "task-button",
  templateUrl: "./task-button.component.html",
  styleUrls: ["./task-button.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, FeedbackListComponent, FaIconComponent],
})
export class TaskButton {
  task = input.required<Task>();
  feedbackList = input.required<Feedback[]>();
  loading = input.required<boolean>();

  protected positiveFeedback = computed(() =>
    this.feedbackList().filter((feedback) => feedback.positive),
  );
  protected TaskStatus = TaskStatus;
  protected status = computed(() => {
    if (this.feedbackList().length === 0) {
      return TaskStatus.NO_RESULT;
    }
    return this.positiveFeedback().length === this.feedbackList().length
      ? TaskStatus.SUCCESS
      : TaskStatus.FAIL;
  });

  protected readonly faCircleQuestion = faCircleQuestion;
  protected readonly faCircleCheck = faCircleCheck;
  protected readonly faCircleXmark = faCircleXmark;

  constructor() {}
}

enum TaskStatus {
  NO_RESULT = "NO_RESULT",
  SUCCESS = "SUCCESS",
  FAIL = "FAIL",
}

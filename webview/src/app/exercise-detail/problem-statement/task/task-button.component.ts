import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { Task } from "./task.model";
import { Feedback } from "@shared/models/feedback.model";
import { FeedbackListComponent } from "../../test-result/feedback-list.component";

@Component({
  selector: "task-button",
  templateUrl: "./task-button.component.html",
  styleUrls: ["./task-button.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, FeedbackListComponent],
})
export class TaskButton {
  task = input.required<Task>({ alias: "task" });
  feedbackList = input.required<Feedback[]>({ alias: "feedbackList" });

  private positiveFeedback = computed(() => this.feedbackList().filter((feedback) => feedback.positive));

  constructor() {}

  getPassedTests(): number {
    return this.positiveFeedback().length;
  }

  onClick() {
    console.log("TaskButton.onClick");
  }
}

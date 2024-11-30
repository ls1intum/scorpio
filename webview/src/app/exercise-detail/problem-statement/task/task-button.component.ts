import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, input, Input, OnInit } from "@angular/core";
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
export class TaskButton implements OnInit {
  task = input.required<Task>();
  feedbackList = input.required<Feedback[]>();

  constructor() {}

  ngOnInit() {
    console.log("TaskButton.ngOnInit");
  }
}

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, input, Input, OnInit } from "@angular/core";
import { FeedbackItem } from "./feedback-item.component";
import { Feedback } from "@shared/models/feedback.model";

@Component({
  selector: "feedback-list",
  templateUrl: "./feedback-list.component.html",
  styleUrls: ["./feedback-list.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, FeedbackItem],
})
export class FeedbackListComponent implements OnInit {
  feedbackList = input.required<Feedback[]>();

  @Input()
  OnClose: () => void = () => {};

  constructor() {}

  ngOnInit() {
    console.log("TestResult.ngOnInit");
  }
}

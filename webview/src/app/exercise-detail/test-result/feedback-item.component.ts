import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, input, Input, OnInit } from "@angular/core";
import { Feedback } from "@shared/models/feedback.model";

@Component({
  selector: "feedback-item",
  templateUrl: "./feedback-item.component.html",
  styleUrls: ["./feedback-item.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
})
export class FeedbackItem implements OnInit {
  feedback = input.required<Feedback>();

  constructor() {}

  ngOnInit() {
    
  }
}

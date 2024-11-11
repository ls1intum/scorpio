import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  signal,
  WritableSignal,
} from "@angular/core";
import { htmlForMarkdown } from "./markdown.converter";
import { CommonModule } from "@angular/common";

@Component({
  selector: "problem-statement",
  templateUrl: "./problem-statement.component.html",
  styleUrls: ["./problem-statement.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
})
export class ProblemStatementComponent implements OnInit {
  // accept exercise as input
  @Input()
  exercise: any;

  problemStatement: WritableSignal<any> = signal("");

  constructor() {}

  ngOnInit() {
    console.log("ProblemStatement.ngOnInit");
    console.log(this.exercise);
    const html = htmlForMarkdown(this.exercise.problemStatement);
    console.log(html);
    this.problemStatement.set(html);
  }
}

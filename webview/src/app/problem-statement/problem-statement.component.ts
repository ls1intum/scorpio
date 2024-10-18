import { ChangeDetectionStrategy, Component, Input, OnInit, signal, WritableSignal } from "@angular/core";
import { vscode } from "../vscode";
import { ActivatedRoute } from "@angular/router";
import { StateService } from "../state.service";

@Component({
  selector: "problem-statement",
  templateUrl: "./problem-statement.component.html",
  styleUrls: ["./problem-statement.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProblemStatementComponent implements OnInit {
  course: WritableSignal<any> = signal(undefined);

  exercise: WritableSignal<any> = signal(undefined);

  repoKey: WritableSignal<string | undefined> = signal(undefined);

  constructor(private stateService: StateService) {}

  ngOnInit() {
    this.stateService.viewState$.subscribe(({ course: course, exercise: exercise, repoKey: repoKey }) => {
      this.course.set(course);
      this.exercise.set(exercise);
      this.repoKey.set(repoKey);
    });
  }
}

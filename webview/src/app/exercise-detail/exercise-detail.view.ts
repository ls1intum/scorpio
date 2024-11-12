import { ChangeDetectionStrategy, Component, Input, OnInit, signal, WritableSignal } from "@angular/core";
import { StateService } from "../state.service";
import { CommonModule } from "@angular/common";
import { ProblemStatementComponent } from "./problem-statement/problem-statement.component";

@Component({
  selector: "exercise-detail",
  templateUrl: "./exercise-detail.view.html",
  styleUrls: ["./exercise-detail.view.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, ProblemStatementComponent],
})
export class ExerciseDetailView implements OnInit {
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

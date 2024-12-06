import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { Exercise } from "@shared/models/exercise.model";
import { Result } from "@shared/models/result.model";

@Component({
  selector: "header-table",
  templateUrl: "./header-table.component.html",
  styleUrls: ["./header-table.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
})
export class HeaderTable {
  exercise = input.required<Exercise>();

  protected latestResult = computed(() => {
    return this.exercise()
      .studentParticipations?.at(0)
      ?.results?.sort((a: Result, b: Result) => a.id - b.id)
      ?.at(0);
  });

  protected absoluteScore = computed(() => {
    return ((this.latestResult()!.score * this.exercise().maxPoints) / 100).toFixed(1);
  });

  constructor() {}

  protected isComponent(content: any): boolean {
    return typeof content === "function";
  }
}

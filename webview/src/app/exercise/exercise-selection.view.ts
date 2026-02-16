import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  Input,
  OnInit,
  signal,
  WritableSignal,
} from "@angular/core";
import { vscode } from "../vscode";
import { StateService, ViewState } from "../state.service";
import { CommonModule } from "@angular/common";
import { Course } from "@shared/models/course.model";
import { Exercise } from "@shared/models/exercise.model";
import { CommandFromExtension, CommandFromWebview } from "@shared/webview-commands";
import * as bootstrap from "bootstrap";
import { getLatestResult } from "@shared/models/participation.model";

@Component({
  selector: "exercise-selection",
  templateUrl: "./exercise-selection.view.html",
  styleUrls: ["./exercise-selection.view.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ExerciseSelectionView implements OnInit, AfterViewInit {
  @Input()
  course!: Course;

  private exercises: WritableSignal<Exercise[]> = signal([]);

  exercisesDue = computed(() =>
    this.exercises()
      .filter((exercise) => exercise.dueDate && exercise.dueDate >= new Date())
      .sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime()),
  );

  exercisesPastDueDate = computed(() =>
    this.exercises().filter((exercise) => exercise.dueDate && exercise.dueDate < new Date()),
  );

  exercisesNoDueDate = computed(() => this.exercises().filter((exercise) => !exercise.dueDate));

  constructor() {}

  ngOnInit() {
    // query courses from API
    window.addEventListener("message", (event) => {
      const message = event.data; // The JSON data
      if (message.command === CommandFromExtension.SEND_EXERCISE_OPTIONS) {
        const exercises = JSON.parse(message.text);
        // for some reason, the dueDate is not correctly deserialized
        exercises.map((exercise: Exercise) => {
          exercise.dueDate = exercise.dueDate ? new Date(exercise.dueDate) : undefined;
          return exercise;
        });
        this.exercises.set(exercises);
      }
    });
    vscode.postMessage({ command: CommandFromWebview.GET_EXERCISE_OPTIONS, text: undefined });
  }

  ngAfterViewInit(): void {
    // Initialize all tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  clickExercise(exercise: Exercise) {
    vscode.postMessage({
      command: CommandFromWebview.SET_COURSE_AND_EXERCISE,
      text: JSON.stringify({ course: this.course, exercise: exercise }),
    });

    // view change is triggered by editor
  }

  getScore(exercise: Exercise): number | undefined {
    return getLatestResult(exercise.studentParticipations?.at(0))?.score;
  }
}

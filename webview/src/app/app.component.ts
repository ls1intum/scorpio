import { Component, OnInit, signal, WritableSignal } from "@angular/core";
import { provideVSCodeDesignSystem, vsCodeButton } from "@vscode/webview-ui-toolkit";
import { StateService, ViewState } from "./state.service";
import { BrowserModule } from "@angular/platform-browser";
import { LoginView } from "./login/login.view";
import { CourseSelectionView } from "./course/course-selection.view";
import { ExerciseSelectionView } from "./exercise/exercise-selection.view";
import { ExerciseDetailView } from "./exercise-detail/exercise-detail.view";
import { Course } from "@shared/models/course.model";
import { Exercise } from "@shared/models/exercise.model";

provideVSCodeDesignSystem().register(vsCodeButton());

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  standalone: true,
  imports: [BrowserModule, LoginView, CourseSelectionView, ExerciseSelectionView, ExerciseDetailView],
})
export class AppComponent implements OnInit {
  protected ViewState = ViewState;
  protected signal = signal;
  
  viewState: WritableSignal<ViewState> = signal(ViewState.LOGIN);
  course: WritableSignal<Course | undefined> = signal(undefined);
  exercise: WritableSignal<Exercise | undefined> = signal(undefined);
  repoKey: WritableSignal<string | undefined> = signal(undefined);

  constructor(private stateService: StateService) {}

  ngOnInit() {
    this.stateService.viewState$.subscribe(
      ({ viewState: viewState, course: course, exercise: exercise, repoKey: repoKey }) => {
        this.viewState.set(viewState);
        this.course.set(course);
        this.exercise.set(exercise);
        this.repoKey.set(repoKey);
      }
    );
  }
}

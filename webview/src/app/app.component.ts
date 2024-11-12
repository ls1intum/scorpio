import { Component, OnInit } from "@angular/core";
import { provideVSCodeDesignSystem, vsCodeButton } from "@vscode/webview-ui-toolkit";
import { StateService, ViewState } from "./state.service";
import { BrowserModule } from "@angular/platform-browser";
import { LoginView } from "./login/login.view";
import { CourseSelectionView } from "./course/course-selection.view";
import { ExerciseSelectionView } from "./exercise/exercise-selection.view";
import { ExerciseDetailView } from "./exercise-detail/exercise-detail.view";

provideVSCodeDesignSystem().register(vsCodeButton());

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  standalone: true,
  imports: [BrowserModule, LoginView, CourseSelectionView, ExerciseSelectionView, ExerciseDetailView],
})
export class AppComponent implements OnInit {
  ViewState = ViewState;
  viewState = ViewState.LOGIN;

  constructor(private stateService: StateService) {}

  ngOnInit() {
    this.stateService.viewState$.subscribe(({viewState: viewState}) => {
      this.viewState = viewState;
    });
  }
}

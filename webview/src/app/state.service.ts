import { Injectable } from "@angular/core";
import { CommandFromExtension } from "@shared/webview-commands";
import { BehaviorSubject } from "rxjs";

export enum ViewState {
  LOGIN = "login",
  COURSE_SELECTION = "course-selection",
  EXERCISE_SELECTION = "exercise-selection",
  PROBLEM_STATEMENT = "exercise-detail",
}

export interface State {
  viewState: ViewState;
  course: any;
  exercise: any;
  repoKey: string | undefined;
}

@Injectable({
  providedIn: "root",
})
export class StateService {
  // Holds the current view state
  private viewStateSubject = new BehaviorSubject<State>({
    viewState: ViewState.LOGIN,
    course: undefined,
    exercise: undefined,
    repoKey: undefined,
  });
  public viewState$ = this.viewStateSubject.asObservable();

  constructor() {
    window.addEventListener("message", (event) => {
      const message = event.data; // The JSON data
      switch (message.command) {
        case CommandFromExtension.SHOW_LOGIN:
          this.changeState({
            viewState: ViewState.LOGIN,
            course: undefined,
            exercise: undefined,
            repoKey: undefined,
          });
          break;
        case CommandFromExtension.SHOW_COURSE_SELECTION:
          this.changeState({
            viewState: ViewState.COURSE_SELECTION,
            course: undefined,
            exercise: undefined,
            repoKey: undefined,
          });
          break;
        case CommandFromExtension.SHOW_EXERCISE_SELECTION:
          const {course: courseData} = JSON.parse(message.text);
          this.changeState({
            viewState: ViewState.EXERCISE_SELECTION,
            course: courseData,
            exercise: undefined,
            repoKey: undefined,
          });
          break;
        case CommandFromExtension.SHOW_PROBLEM_STATEMENT:
          const { course: course, exercise: exercise, repoKey: repoKey } = JSON.parse(message.text);
          this.changeState({
            viewState: ViewState.PROBLEM_STATEMENT,
            course: course,
            exercise: exercise,
            repoKey: repoKey,
          });
          break;
        case CommandFromExtension.EASTER_EGG:
          break;
      }
    });
  }

  // Method to change the view state based on the message
  changeState(state: State) {
    this.viewStateSubject.next(state);
  }
}

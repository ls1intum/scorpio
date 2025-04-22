import { Injectable } from "@angular/core";
import { Course } from "@shared/models/course.model";
import { ProgrammingExercise } from "@shared/models/exercise.model";
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
  course: Course | undefined;
  exercise: ProgrammingExercise | undefined;
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
  // Holds the pet visibility state
  public petVisibleSubject = new BehaviorSubject<boolean>(false);
  public petVisibleObservable = this.petVisibleSubject.asObservable();

  constructor() {
    window.addEventListener("message", (event) => {
      const message = event.data; // The JSON data
      switch (message.command) {
        case CommandFromExtension.SEND_LOGIN_STATE:
          const loggedIn = message.text;
          this.changeState({
            viewState: loggedIn ? ViewState.COURSE_SELECTION : ViewState.LOGIN,
            course: undefined,
            exercise: undefined,
            repoKey: undefined,
          });
          break;
        case CommandFromExtension.SEND_COURSE_EXERCISE_REPOKEY:
          const { course: course, exercise: exercise, repoKey: repoKey } = JSON.parse(message.text);
          if (!course) {
            this.changeState({
              viewState: ViewState.COURSE_SELECTION,
              course: undefined,
              exercise: undefined,
              repoKey: undefined,
            });
            break;
          }

          if (!exercise) {
            this.changeState({
              viewState: ViewState.EXERCISE_SELECTION,
              course: course,
              exercise: undefined,
              repoKey: undefined,
            });
            break;
          }
          exercise.dueDate = exercise.dueDate ? new Date(exercise.dueDate) : exercise.dueDate;
          this.changeState({
            viewState: ViewState.PROBLEM_STATEMENT,
            course: course,
            exercise: exercise,
            repoKey: repoKey,
          });
          break;
        case CommandFromExtension.EASTER_EGG:
          this.petVisibleSubject.next(message.text === "true");
          break;
      }
    });
  }

  // Method to change the view state based on the message
  changeState(state: State) {
    this.viewStateSubject.next(state);
  }
}

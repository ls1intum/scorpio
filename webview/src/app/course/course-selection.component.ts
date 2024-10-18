import { ChangeDetectionStrategy, Component, Input, OnInit, signal, WritableSignal } from "@angular/core";
import { vscode } from "../vscode";
import { Router } from "@angular/router";
import { StateService, ViewState } from "../state.service";

enum OutgoingCommands {
  GET_COURSE_OPTIONS = "getCourseOptions",
  SET_COURSE_AND_EXERCISE = "setCourseAndExercise",
}

enum IncomingCommands {
  SEND_COURSE_OPTIONS = "sendCourseOptions",
}

@Component({
  selector: "course-selection",
  templateUrl: "./course-selection.component.html",
  styleUrls: ["./course-selection.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseSelectionComponent implements OnInit {
  coursesWithScore: WritableSignal<[any] | undefined> = signal(undefined);

  constructor(private stateService: StateService) {}

  ngOnInit() {
    // query courses from API
    window.addEventListener("message", (event) => {
      const message = event.data; // The JSON data
      if (message.command === IncomingCommands.SEND_COURSE_OPTIONS) {
        this.coursesWithScore.set(JSON.parse(message.text));
        console.log(this.coursesWithScore);
      }
    });
    vscode.postMessage({ command: OutgoingCommands.GET_COURSE_OPTIONS, text: undefined });
  }

  clickCourse(course: any) {
    vscode.postMessage({
      command: OutgoingCommands.SET_COURSE_AND_EXERCISE,
      text: JSON.stringify({ course: course, exercise: undefined }),
    });

    // course is set by the changed state in the editor
    this.stateService.changeState({
      viewState: ViewState.EXERCISE_SELECTION,
      course: course,
      exercise: undefined,
      repoKey: undefined,
    });
  }
}

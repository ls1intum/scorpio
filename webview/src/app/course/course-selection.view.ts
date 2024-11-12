import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit, signal, WritableSignal } from "@angular/core";
import { vscode } from "../vscode";
import { StateService, ViewState } from "../state.service";
import { CommonModule } from "@angular/common";

enum OutgoingCommands {
  GET_COURSE_OPTIONS = "getCourseOptions",
  SET_COURSE_AND_EXERCISE = "setCourseAndExercise",
}

enum IncomingCommands {
  SEND_COURSE_OPTIONS = "sendCourseOptions",
}

@Component({
  selector: "course-selection",
  templateUrl: "./course-selection.view.html",
  styleUrls: ["./course-selection.view.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CourseSelectionView implements OnInit {
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

    // view change is triggered by editor
  }
}

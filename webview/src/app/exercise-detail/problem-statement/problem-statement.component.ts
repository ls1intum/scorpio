import {
  ChangeDetectionStrategy,
  Component,
  computed,
  OnChanges,
  input,
  Signal,
  ViewChild,
  ElementRef,
  inject,
  Renderer2,
  ViewContainerRef,
  SimpleChanges,
} from "@angular/core";
import { htmlForMarkdown } from "./markdown.converter";
import { CommonModule } from "@angular/common";
import { Task, TaskArray } from "./task/task.model";
import { TaskButton } from "./task/task-button.component";
import { Feedback } from "@shared/models/feedback.model";
import { Exercise } from "@shared/models/exercise.model";

const taskRegex =
  /\[task]\[([^[\]]+)]\(((?:[^(),]+(?:\([^()]*\)[^(),]*)?(?:,[^(),]+(?:\([^()]*\)[^(),]*)?)*)?)\)/g;
const testSplitRegex = /,(?![^(]*?\))/;
const testIdRegex = /<testid>(\d+)<\/testid>/;
const escapeStringForUseInRegex = (text: string) => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
const taskDivElement = (exerciseId: number, taskId: number) => `pe-${exerciseId}-task-${taskId}`;

@Component({
  selector: "problem-statement",
  templateUrl: "./problem-statement.component.html",
  styleUrls: ["./problem-statement.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, TaskButton],
})
export class ProblemStatementComponent implements OnChanges {
  // accept exercise as input
  exercise = input.required<Exercise>();

  feedbackList = input.required<Feedback[]>();

  problemStatement: Signal<string> = computed(() => this.renderMarkdown(this.exercise().problemStatement));

  public tasks: TaskArray = [];
  private taskIndex = 0;

  @ViewChild("problemContainer", { static: false }) problemContainer!: ElementRef;
  private renderer = inject(Renderer2);
  private viewContainerRef = inject(ViewContainerRef);

  constructor() {}

  public ngOnChanges(changes: SimpleChanges) {
    if (changes["feedbackList"]) {
      this.tasks = [];
      this.taskIndex = 0;
      this.problemStatement = computed(() => this.renderMarkdown(this.exercise().problemStatement));
    }
  }

  renderMarkdown(problemStatement: string | undefined): string {
    if (!problemStatement) {
      return "";
    }

    let html = htmlForMarkdown(problemStatement);
    html = this.prepareTasks(html);
    setTimeout(() => {
      this.injectTasksIntoDocument();
    }, 1);

    return html;
  }

  prepareTasks(problemStatementHtml: string) {
    const tasks = Array.from(problemStatementHtml.matchAll(taskRegex));
    if (!tasks) {
      return problemStatementHtml;
    }

    this.tasks = tasks
      // check that all groups (full match, name, tests) are present
      .filter((testMatch) => testMatch?.length === 3)
      .map((testMatch: RegExpMatchArray | null) => {
        const nextIndex = this.taskIndex;
        this.taskIndex++;
        return {
          id: nextIndex,
          completeString: testMatch![0],
          taskName: testMatch![1],
          testIds: testMatch![2]
            .split(testSplitRegex)
            .map((testCaseString) => testCaseString.trim())
            .map((testCaseString) => parseInt(testIdRegex.exec(testCaseString)![1])),
        };
      });

    return this.tasks.reduce(
      (acc: string, { completeString: task, id }): string =>
        // Insert anchor divs into the text so that injectable elements can be inserted into them.
        // Without class="d-flex" the injected components height would be 0.
        // Added zero-width space as content so the div actually consumes a line to prevent a <ol> display bug in Safari
        acc.replace(
          new RegExp(escapeStringForUseInRegex(task), "g"),
          `<div class="${taskDivElement(this.exercise().id, id)} d-flex">&#8203;</div>`
        ),
      problemStatementHtml
    );
  }

  private injectTasksIntoDocument = () => {
    this.renderer.setProperty(this.problemContainer.nativeElement, "innerHTML", this.problemStatement());

    this.tasks.forEach((task) => {
      const taskHtmlContainers = document.getElementsByClassName(taskDivElement(this.exercise().id, task.id));

      for (let i = 0; i < taskHtmlContainers.length; i++) {
        const taskHtmlContainer = taskHtmlContainers[i];
        this.createTaskComponent(taskHtmlContainer, task);
      }
    });
  };

  private createTaskComponent(taskHtmlContainer: Element, task: Task) {
    const componentRef = this.viewContainerRef.createComponent(TaskButton);

    componentRef.setInput("task", task);
    // TODO only insert feedback related to tasks tests
    const matchedFeedback = this.feedbackList().filter((feedback: Feedback) =>
      task.testIds.includes(feedback.testCase.id)
    );
    componentRef.setInput("feedbackList", matchedFeedback);

    this.renderer.appendChild(taskHtmlContainer, componentRef.location.nativeElement);
  }
}

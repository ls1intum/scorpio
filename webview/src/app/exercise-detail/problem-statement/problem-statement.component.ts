import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  Signal,
  ViewChild,
  ElementRef,
  inject,
  Renderer2,
  ViewContainerRef,
  OnDestroy,
  effect,
} from "@angular/core";
import hljs from 'highlight.js';
import { htmlForMarkdown } from "./markdown-util/markdown.converter";
import { CommonModule } from "@angular/common";
import { Task, TaskArray } from "./task/task.model";
import { TaskButton } from "./task/task-button.component";
import { Feedback } from "@shared/models/feedback.model";
import { Exercise } from "@shared/models/exercise.model";
import { PluginSimple } from "markdown-it";
import { escapeStringForUseInRegex } from "./regex.util";
import { ProgrammingExercisePlantUmlExtensionWrapper } from "./markdown-util/plant-uml.plugin";
import { merge, Subscription } from "rxjs";
import { ProgrammingExerciseInstructionService } from "./programming-exercise.service";
import { ProgrammingExerciseTaskExtensionWrapper, taskRegex } from "./markdown-util/task.plugin";
import { getLatestResult, getLatestResultBySubmission, getLatestSubmission } from "@shared/models/participation.model";

const taskDivElement = (exerciseId: number, taskId: number) => `pe-${exerciseId}-task-${taskId}`;

@Component({
  selector: "problem-statement",
  templateUrl: "./problem-statement.component.html",
  styleUrls: ["./problem-statement.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
})
export class ProblemStatementComponent implements OnDestroy {
  // accept exercise as input
  exercise = input.required<Exercise>();

  latestSubmission = computed(() => getLatestSubmission(this.exercise().studentParticipations?.at(0)));
  latestResult = computed(() => getLatestResultBySubmission(this.latestSubmission()));
  loading = computed(() => !!this.latestSubmission() && !this.latestResult());

  problemStatement: Signal<string> = computed(() => this.renderMarkdown(this.exercise().problemStatement));

  public tasks: TaskArray = [];
  private taskIndex = 0;

  @ViewChild("problemContainer", { static: false }) problemContainer!: ElementRef;
  private renderer = inject(Renderer2);
  private viewContainerRef = inject(ViewContainerRef);

  private markdownExtensions: PluginSimple[];
  private injectableContentFoundSubscription: Subscription;
  private injectableContentForMarkdownCallbacks: Array<() => void> = [];

  constructor(
    private programmingExerciseInstructionService: ProgrammingExerciseInstructionService,
    private taskPlugin: ProgrammingExerciseTaskExtensionWrapper,
    private plantUmlPlugin: ProgrammingExercisePlantUmlExtensionWrapper
  ) {
    effect(() => {
      this.plantUmlPlugin.setLatestResult(this.latestResult());
    });

    this.markdownExtensions = [this.taskPlugin.getExtension(), this.plantUmlPlugin.getExtension()];

    this.injectableContentFoundSubscription = merge(
      plantUmlPlugin.subscribeForInjectableElementsFound()
    ).subscribe((injectableCallback) => {
      this.injectableContentForMarkdownCallbacks = [
        ...this.injectableContentForMarkdownCallbacks,
        injectableCallback,
      ];
    });
  }

  ngOnDestroy(): void {
    this.injectableContentFoundSubscription.unsubscribe();
  }

  renderMarkdown(problemStatement: string | undefined): string {
    if (!problemStatement) {
      return "";
    }

    let html = htmlForMarkdown(problemStatement, this.markdownExtensions);
    html = this.prepareTasks(html);
    setTimeout(() => {
      this.injectableContentForMarkdownCallbacks.forEach((callback) => {
        callback();
      });
      this.injectTasksIntoDocument();
      this.highlightCodeBlocks();
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
            ? this.programmingExerciseInstructionService.convertTestListToIds(testMatch![2], this.exercise().testCases)
            : [],
        };
      });

    return this.tasks.reduce(
      (acc: string, { completeString: task, id }): string =>
        // Insert anchor divs into the text so that injectable elements can be inserted into them.
        // Without class="d-flex" the injected components height would be 0.
        // Added zero-width space as content so the div actually consumes a line to prevent a <ol> display bug in Safari
        acc.replace(
          new RegExp(escapeStringForUseInRegex(task), "g"),
          `<div class="${taskDivElement(this.exercise().id!, id)} d-flex">&#8203;</div>`
        ),
      problemStatementHtml
    );
  }

  private injectTasksIntoDocument = () => {
    this.renderer.setProperty(this.problemContainer.nativeElement, "innerHTML", this.problemStatement());

    this.tasks.forEach((task) => {
      const taskHtmlContainers = document.getElementsByClassName(
        taskDivElement(this.exercise().id!, task.id)
      );

      for (let i = 0; i < taskHtmlContainers.length; i++) {
        const taskHtmlContainer = taskHtmlContainers[i];
        this.createTaskComponent(taskHtmlContainer, task);
      }
    });
  };

  private createTaskComponent(taskHtmlContainer: Element, task: Task) {
    const componentRef = this.viewContainerRef.createComponent(TaskButton);

    componentRef.setInput("task", task);
    const matchedFeedback = this.latestResult()?.feedbacks?.filter((feedback: Feedback) =>
      !feedback.testCaseId || task.testIds.includes(feedback.testCaseId)
    ) ?? [];
    componentRef.setInput("feedbackList", matchedFeedback ?? []);
    componentRef.setInput("loading", this.loading());

    this.renderer.appendChild(taskHtmlContainer, componentRef.location.nativeElement);
  }

  private highlightCodeBlocks() {
    const codeBlocks = this.problemContainer.nativeElement.querySelectorAll("pre code");
    codeBlocks.forEach((block: HTMLElement) => {
      hljs.highlightBlock(block);
    });
  }
}

import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import DOMPurify from "dompurify";
import { ArtemisTextReplacementPlugin } from "./artemis-text-replacement.plugin";
import { escapeStringForUseInRegex } from "../regex.util";
import { Result } from "@shared/models/result.model";
import { CommandFromExtension, CommandFromWebview } from "@shared/webview-commands";
import { vscode } from "src/app/vscode";
import { ProgrammingExerciseInstructionService, TestCaseState } from "../programming-exercise.service";

type umlIndexed = { id: number; plantUml: string };

@Injectable({ providedIn: "root" })
export class ProgrammingExercisePlantUmlExtensionWrapper extends ArtemisTextReplacementPlugin {
  private latestResult?: Result;
  private injectableElementsFoundSubject = new Subject<() => void>();

  // unique index, even if multiple plant uml diagrams are shown from different problem statements on the same page (in different tabs)
  private plantUmlIndex = 0;

  constructor(private programmingExerciseInstructionService: ProgrammingExerciseInstructionService) {
    super();
  }

  /**
   * Sets latest result according to parameter.
   * @param result - either a result or undefined.
   */
  public setLatestResult(result?: Result) {
    this.latestResult = result;
  }

  /**
   * Subscribes to injectableElementsFoundSubject.
   */
  subscribeForInjectableElementsFound() {
    return this.injectableElementsFoundSubject.asObservable();
  }

  /**
   * (green == implemented, red == not yet implemented, grey == unknown)

   * */
  private colorUML(uml: umlIndexed): umlIndexed {
    // This regex is the same as in the server: ProgrammingExerciseTaskService.java
    const testsColorRegex = /testsColor\((\s*[^()\s]+(\([^()]*\))?)\)/g;

    uml.plantUml = uml.plantUml.replace(testsColorRegex, (match: string, capture: string) => {
      const tests = this.programmingExerciseInstructionService.convertTestListToIds(capture, undefined);
      const { testCaseState } = this.programmingExerciseInstructionService.testStatusForTask(
        tests,
        this.latestResult
      );
      switch (testCaseState) {
        case TestCaseState.SUCCESS:
          return "green";
        case TestCaseState.FAIL:
          return "red";
        default:
          return "grey";
      }
    });
    return uml;
  }

  /**
   * For the stringified plantUml provided, render the plantUml on the server and inject it into the html.
   * @param plantUml a stringified version of one plantUml.
   * @param index the index of the plantUml in html
   */
  private loadAndInjectPlantUml(uml: umlIndexed) {
    // query courses from API
    window.addEventListener("message", (event) => {
      const message = event.data; // The JSON data
      const pathParts = message.command.split("/");
      if (
        pathParts[0] === CommandFromExtension.SEND_UML &&
        pathParts[1] === this.latestResult?.id?.toString() &&
        pathParts[2] === uml.id.toString()
      ) {
        const plantUmlHtmlContainer = document.getElementById(`plantUml-${this.latestResult?.id}-${uml.id}`);
        if (plantUmlHtmlContainer) {
          // We need to sanitize the received svg as it could contain malicious code in a script tag.
          plantUmlHtmlContainer.innerHTML = DOMPurify.sanitize(message.text);

          // make svg clickable
          const svgElement = plantUmlHtmlContainer.querySelector("svg");
          if (svgElement) {
            svgElement.style.cursor = "pointer";
            svgElement.addEventListener("click", () => {
              vscode.postMessage({
                command: `${CommandFromWebview.OPEN_UML}/${this.latestResult?.id}/${uml.id}`,
              });
            });
          }
        }
      }
    });

    vscode.postMessage({
      command: `${CommandFromWebview.GET_UML}/${this.latestResult?.id}/${uml.id}`,
      text: uml.plantUml,
    });
  }

  /**
   * The extension provides a custom rendering mechanism for embedded plantUml diagrams.
   * The mechanism works as follows:
   * 1) Find (multiple) embedded plantUml diagrams based on a regex (startuml, enduml).
   * 2) Replace the whole plantUml with a simple plantUml div container and a unique placeholder id
   * 3) Add colors for test results in the plantUml (red, green, grey)
   * 4) Send the plantUml content to the server for rendering a svg (the result will be cached for performance reasons)
   * 5) Inject the computed svg for the plantUml (from the server) into the plantUml div container based on the unique placeholder id (see step 2)
   */
  replaceText(text: string): string {
    const idPlaceholder = "%idPlaceholder%";
    // E.g. [task][Implement BubbleSort](testBubbleSort)
    const plantUmlRegex = /@startuml([^@]*)@enduml/g;
    // E.g. Implement BubbleSort, testBubbleSort
    const plantUmlContainer = `<div class="mb-4" id="plantUml-${this.latestResult?.id}-${idPlaceholder}"></div>`;

    // Replace test status markers.
    const plantUmls = text.match(plantUmlRegex) ?? [];
    // Assign unique ids to uml data structure at the beginning.
    const plantUmlsIndexed = plantUmls.map((plantUml) => {
      const nextIndex = this.plantUmlIndex;
      // increase the global unique index so that the next plantUml gets a unique global id
      this.plantUmlIndex++;
      return { id: nextIndex, plantUml };
    });
    // custom markdown to html rendering: replace the plantUml in the markdown with a simple <div></div> container with a unique id placeholder
    // with the global unique id so that we can find the plantUml later on, when it was rendered, and then inject the 'actual' inner html (actually a svg image)
    const replacedText = plantUmlsIndexed.reduce((acc: string, umlIndexed: umlIndexed): string => {
      return acc.replace(
        new RegExp(escapeStringForUseInRegex(umlIndexed.plantUml), "g"),
        plantUmlContainer.replace(idPlaceholder, umlIndexed.id.toString())
      );
    }, text);

    const coloredUmls = plantUmlsIndexed.map((plantUmlIndexed: umlIndexed) => this.colorUML(plantUmlIndexed));

    // send the adapted plantUml to the server for rendering and inject the result into the html DOM based on the unique plantUml id
    this.injectableElementsFoundSubject.next(() => {
      coloredUmls.forEach((plantUmlIndexed: umlIndexed) => {
        this.loadAndInjectPlantUml(plantUmlIndexed);
      });
    });

    return replacedText;
  }
}

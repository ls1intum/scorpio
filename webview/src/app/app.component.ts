import { Component, OnInit } from "@angular/core";
import { provideVSCodeDesignSystem, vsCodeButton } from "@vscode/webview-ui-toolkit";
import { StateService, ViewState } from "./state.service";

provideVSCodeDesignSystem().register(vsCodeButton());

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
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

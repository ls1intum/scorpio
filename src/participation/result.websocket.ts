import * as vscode from "vscode";
import { Result } from "@shared/models/result.model";
import { AUTH_ID } from "../authentication/authentication_provider";
import { getState, set_state } from "../shared/state";
import { GenericWebSocket } from "../shared/websocket";

const PERSONAL_PARTICIPATION_TOPIC = `/user/topic/newResults`;

/// Handles the WebSocket connection for the results of a personal participation.
export class ResultWebsocket {
  static #instance: ResultWebsocket;

  private resultWebsocket: GenericWebSocket<Result> | undefined;

  constructor() {
    // if already instantiated return the instance
    if (ResultWebsocket.#instance) {
      return ResultWebsocket.#instance;
    }

    // otherwise create instance
    ResultWebsocket.#instance = this;

    this.initWebsocket();
  }

  public static get instance(): ResultWebsocket {
    // instantiate the singleton if it is not already
    return new ResultWebsocket();
}

  private async initWebsocket() {
    const session = await vscode.authentication.getSession(AUTH_ID, [], {
      createIfNone: false,
    });

    if (!session) {
      console.error("Not authenticated");
      return;
    }

    this.resultWebsocket = new GenericWebSocket<Result>(session.accessToken, PERSONAL_PARTICIPATION_TOPIC);

    this.resultWebsocket.subscription.event((message) => {
      if ("error" in message) {
        console.error("Error in WebSocket", message.error);
        this.handleError(message.error);
        return;
      } else if ("data" in message) {
        console.log("New result", message.data);
        this.handleMessage(message.data);
        return;
      }
    });
  }

  private handleError(error: Error) {}

  private handleMessage(result: Result) {
    let state = getState();
    let exercise = state.displayedExercise;
    if (exercise?.id !== result.participation?.exercise?.id) {
      return;
    }

    exercise?.studentParticipations?.at(0)?.results.push(result);

    set_state({
      displayedCourse: state.displayedCourse,
      displayedExercise: exercise,
      repoCourse: state.repoCourse,
      repoExercise: state.repoExercise,
    });
  }
}

import { Result } from "@shared/models/result.model";
import { getState } from "../shared/state";
import { GenericWebSocket } from "../shared/websocket";

const PERSONAL_PARTICIPATION_TOPIC = `/user/topic/newResults`;

/// Handles the WebSocket connection for the results of a personal participation.
export class ResultWebsocket {
  constructor() {
    this.initWebsocket();
  }

  private async initWebsocket() {
    do {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.debug("Waiting for websocket connection...");
    } while (!GenericWebSocket.instance.connected);

    const subscription = GenericWebSocket.instance.subscribeToTopic<Result>(PERSONAL_PARTICIPATION_TOPIC);
    subscription.event((result) => {
      this.handleMessage(result);
    });
  }

  private handleMessage(result: Result) {
    const participationId = result.submission?.participation?.id;

    let displayedStudentParticipation = getState().displayedExercise?.studentParticipations?.find(
      (participation) => participation.id === participationId
    );   

    if (!displayedStudentParticipation) {
      return;
    }

    let submission = result.submission;
    submission!.participation = undefined;
    result.submission = undefined;
    submission!.results!.push(result);

    displayedStudentParticipation.submissions
      ? displayedStudentParticipation.submissions?.push(submission!)
      : (displayedStudentParticipation.submissions = [submission!]);
  }
}

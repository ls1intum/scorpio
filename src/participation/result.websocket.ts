import { Result } from "@shared/models/result.model";
import { getState, setDisplayedState } from "../shared/state";
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

    const state = getState();
    let displayedStudentParticipation = state.displayedExercise?.studentParticipations?.find(
      (participation) => participation.id === participationId
    );

    if (!displayedStudentParticipation) {
      console.debug("No displayed student participation found");
      return;
    }

    // flip submission result relationship
    let submission = result.submission;
    submission!.participation = undefined;

    result.submission = undefined;
    submission!.results = [result];

    // replace the submission with the same id otherwise push it
    if (!displayedStudentParticipation.submissions) {
      displayedStudentParticipation.submissions = [];
    }
    displayedStudentParticipation.submissions = displayedStudentParticipation.submissions?.filter(
      (submission) => submission.id !== result.submission?.id
    );
    displayedStudentParticipation.submissions?.push(submission!);

    // update displayed exercise to trigger re-render
    setDisplayedState(state.displayedCourse, state.displayedExercise);
  }
}

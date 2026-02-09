import { getState, setDisplayedState } from "../shared/state";
import { GenericWebSocket } from "../shared/websocket";
import { ProgrammingSubmission } from "@shared/models/submission.model";

const PERSONAL_PARTICIPATION_TOPIC = `/user/topic/newSubmissions`;

export class SubmissionWebsocket {
  constructor() {
    this.initWebsocket();
  }

  private async initWebsocket() {
    do {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.debug("Waiting for websocket connection...");
    } while (!GenericWebSocket.instance.connected);

    const subscription = GenericWebSocket.instance.subscribeToTopic<ProgrammingSubmission>(PERSONAL_PARTICIPATION_TOPIC);
    subscription.event((submission) => {
      this.handleMessage(submission);
    });
  }

  private handleMessage(submission: ProgrammingSubmission) {
    const participationId = submission.participation?.id;

    const state = getState();
    // check if displayed participation is the same as the one in the submission
    let displayedStudentParticipation = state.displayedExercise?.studentParticipations?.find(
      (participation) => participation.id === participationId
    );

    if (!displayedStudentParticipation) {
      console.debug("No displayed student participation found");
      return;
    }
    submission.participation = undefined;

    // replace the submission with the same id otherwise push it
    if(!displayedStudentParticipation.submissions) {
      displayedStudentParticipation.submissions = [];
    }
    displayedStudentParticipation.submissions = displayedStudentParticipation.submissions?.filter(
      (s) => s.id !== submission.id
    );
    displayedStudentParticipation.submissions?.push(submission!);

    // update displayed exercise to trigger re-render
    setDisplayedState(state.displayedCourse, state.displayedExercise);
  }
}

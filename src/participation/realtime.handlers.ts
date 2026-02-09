import { Result } from "@shared/models/result.model";
import { ProgrammingSubmission } from "@shared/models/submission.model";
import { getState, set_displayed_state } from "../shared/state";

export function handleSubmissionMessage(submission: ProgrammingSubmission) {
  const participationId = submission.participation?.id;
  if (!participationId) {
    return;
  }

  const state = getState();
  const displayedStudentParticipation = state.displayedExercise?.studentParticipations?.find(
    (participation) => participation.id === participationId
  );

  if (!displayedStudentParticipation) {
    return;
  }

  submission.participation = undefined;

  displayedStudentParticipation.submissions ??= [];

  displayedStudentParticipation.submissions = displayedStudentParticipation.submissions.filter(
    (currentSubmission) => currentSubmission.id !== submission.id
  );
  displayedStudentParticipation.submissions.push(submission);

  set_displayed_state(state.displayedCourse, state.displayedExercise);
}

export function handleResultMessage(result: Result) {
  const participationId = result.submission?.participation?.id;
  if (!participationId) {
    return;
  }

  const state = getState();
  const displayedStudentParticipation = state.displayedExercise?.studentParticipations?.find(
    (participation) => participation.id === participationId
  );

  if (!displayedStudentParticipation) {
    return;
  }

  const submission = result.submission;
  if (!submission?.id) {
    return;
  }

  submission.participation = undefined;

  result.submission = undefined;
  submission.results = [result];

  displayedStudentParticipation.submissions ??= [];

  displayedStudentParticipation.submissions = displayedStudentParticipation.submissions.filter(
    (currentSubmission) => currentSubmission.id !== submission.id
  );
  displayedStudentParticipation.submissions.push(submission);

  set_displayed_state(state.displayedCourse, state.displayedExercise);
}

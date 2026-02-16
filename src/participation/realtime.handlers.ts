import { Result } from "@shared/models/result.model";
import { ProgrammingSubmission } from "@shared/models/submission.model";
import { getLatestSubmission } from "@shared/models/participation.model";
import { getState, setDisplayedState } from "../shared/state";

export function handleSubmissionMessage(submission: ProgrammingSubmission) {
  const participationId = submission.participation?.id;
  if (!participationId) {
    return;
  }

  const state = getState();
  const displayedStudentParticipation = state.displayedExercise?.studentParticipations?.find(
    (participation) => participation.id === participationId,
  );

  if (!displayedStudentParticipation) {
    return;
  }

  const normalizedSubmission: ProgrammingSubmission = {
    ...submission,
    participation: undefined,
  };

  const currentLatestSubmission = getLatestSubmission(displayedStudentParticipation);
  if (
    currentLatestSubmission &&
    (currentLatestSubmission.id ?? -1) > (normalizedSubmission.id ?? -1)
  ) {
    return;
  }

  const existingResultsForSameSubmission =
    currentLatestSubmission?.id === normalizedSubmission.id
      ? currentLatestSubmission?.results
      : undefined;
  normalizedSubmission.results = getLatestResultArray(
    normalizedSubmission.results,
    existingResultsForSameSubmission,
  );
  displayedStudentParticipation.submissions = [normalizedSubmission];

  setDisplayedState(state.displayedCourse, state.displayedExercise);
}

export function handleResultMessage(result: Result) {
  const participationId = result.submission?.participation?.id;
  if (!participationId) {
    return;
  }

  const state = getState();
  const displayedStudentParticipation = state.displayedExercise?.studentParticipations?.find(
    (participation) => participation.id === participationId,
  );

  if (!displayedStudentParticipation) {
    return;
  }

  const submission = result.submission;
  if (!submission?.id) {
    return;
  }

  const currentLatestSubmission = getLatestSubmission(displayedStudentParticipation);
  if (currentLatestSubmission && (currentLatestSubmission.id ?? -1) > submission.id) {
    return;
  }

  const normalizedResult: Result = {
    ...result,
    submission: undefined,
  };

  const nextLatestSubmission: ProgrammingSubmission =
    currentLatestSubmission && currentLatestSubmission.id === submission.id
      ? {
          ...currentLatestSubmission,
          results: getLatestResultArray(currentLatestSubmission.results, [normalizedResult]),
        }
      : {
          ...submission,
          participation: undefined,
          results: [normalizedResult],
        };

  displayedStudentParticipation.submissions = [nextLatestSubmission];

  setDisplayedState(state.displayedCourse, state.displayedExercise);
}

function getLatestResultArray(...resultArrays: Array<Result[] | undefined>): Result[] {
  const allResults = resultArrays.flatMap((results) => results ?? []);
  const latest = getLatestById(allResults);
  return latest ? [latest] : [];
}

function getLatestById<T extends { id?: number }>(items: T[]): T | undefined {
  if (items.length === 0) {
    return undefined;
  }

  return items.reduce((latest, current) => {
    const latestId = latest.id ?? -1;
    const currentId = current.id ?? -1;
    return currentId > latestId ? current : latest;
  });
}

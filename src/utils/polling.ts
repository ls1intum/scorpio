import { get_course_exercise_by_repoUrl } from "../exercise/exercise";
import { getState, set_displayed_state } from "../shared/state";

export const POLLING_INTERVAL = 20000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function pollNewResults() {
  console.log("Polling for new results");
  const repoUrl = getState().displayedExercise?.studentParticipations?.at(0)?.repositoryUri;
  if (!repoUrl) {
    return;
  }

  const { course, exercise } = await get_course_exercise_by_repoUrl(repoUrl);
  console.log("Got new results");
  console.log(exercise);
  if (exercise.studentParticipations?.at(0)?.submissions?.at(0)?.results?.at(0)) {
    // got new result -> set new state and break polling
    set_displayed_state(course, exercise);
  } else {
    // no new result -> continue polling
    setTimeout(pollNewResults, POLLING_INTERVAL);
  }
}

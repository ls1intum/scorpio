import { set_state, state } from "../shared/state";

export async function sync_problem_statement_with_workspace() {
  set_state({
    displayedCourse: state.repoCourse,
    displayedExercise: state.repoExercise,
    repoCourse: state.repoCourse,
    repoExercise: state.repoExercise,
  });
}

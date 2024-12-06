export enum CommandFromWebview {
  INFO = "info",
  ERROR = "error",
  LOGIN = "login",
  GET_COURSE_OPTIONS = "getCourseOptions",
  GET_EXERCISE_OPTIONS = "getExerciseOptions",
  GET_EXERCISE_DETAILS = "getExerciseDetails",
  CLONE_REPOSITORY = "cloneRepository",
  SUBMIT = "submit",
  SET_COURSE_AND_EXERCISE = "setCourseAndExercise",
}

export enum CommandFromExtension {
  SHOW_LOGIN = "showLogin",
  SHOW_COURSE_SELECTION = "showCourseSelection",
  SHOW_EXERCISE_SELECTION = "showExerciseSelection",
  SHOW_PROBLEM_STATEMENT = "showProblemStatement",
  SEND_COURSE_OPTIONS = "sendCourseOptions",
  SEND_EXERCISE_OPTIONS = "sendExerciseOptions",
  SEND_COURSE_AND_EXERCISE = "sendCourseAndExercise",
  EASTER_EGG = "easterEgg",
}

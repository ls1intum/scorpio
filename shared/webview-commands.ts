export enum CommandFromWebview {
  INFO = "info",
  ERROR = "error",
  LOGIN = "login",
  GET_COURSE_OPTIONS = "getCourseOptions",
  GET_EXERCISE_OPTIONS = "getExerciseOptions",
  GET_EXERCISE_DETAILS = "getExerciseDetails",
  GET_UML = "getUml",
  OPEN_UML = "openUml",
  CLONE_REPOSITORY = "cloneRepository",
  SUBMIT = "submit",
  SET_COURSE_AND_EXERCISE = "setCourseAndExercise",
}

export enum CommandFromExtension {
  SEND_LOGIN_STATE = "showLogin",
  SEND_COURSE_EXERCISE_REPOKEY = "sendCourseAndExercise",
  SEND_COURSE_OPTIONS = "sendCourseOptions",
  SEND_EXERCISE_OPTIONS = "sendExerciseOptions",
  SEND_UML = "sendUml",
  EASTER_EGG = "easterEgg",
}

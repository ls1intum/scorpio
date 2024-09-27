const IncomingCommand = {
  sendAccessToken: "sendAccessToken",
  logout: "logout",
  setExercise: "setExercise",
};

const OutgoingCommand = {
  info: "info",
  error: "error",
  login: "login",
  cloneRepository: "cloneRepository",
  submit: "submit",
  setExercise: "setExercise",
};

const SectionsToDisplay = {
  login: "login",
  courseSelection: "courseSelection",
  exerciseSelection: "exerciseSelection",
  problemStatement: "problemStatement",
};

let course = undefined;
let exercise = undefined;
let repoKey = undefined;
let token = undefined;

// Store the original fetch function
const originalFetch = window.fetch;

// Custom fetch function to intercept and modify requests
window.fetch = async function (input, init) {
  init = init || {};
  init.headers = {
    ...init.headers, // Keep the original headers
    "X-ARTEMIS-CSRF": "Dennis ist schuld",
  };

  // Call the original fetch with the modified init object
  return originalFetch(input, init);
};

function postInfo(text) {
  vscode.postMessage({
    command: OutgoingCommand.info,
    text: text,
  });
}

function postError(text) {
  vscode.postMessage({
    command: OutgoingCommand.error,
    text: text,
  });
}

function showSection(section) {
  const sections = Object.values(SectionsToDisplay);
  for (const s of sections) {
    const element = document.getElementById(s);
    if (!element) {
      continue;
    }

    element.hidden = s !== section;
  }
}

function changeState() {
  if (!token) {
    showSection(SectionsToDisplay.login);
    return;
  }
  if (!course) {
    displayCourseOptions();
    showSection(SectionsToDisplay.courseSelection);
    return;
  }
  if (!exercise) {
    displayExerciseOptions();
    showSection(SectionsToDisplay.exerciseSelection);
    return;
  }

  displayProblemStatement();
  showSection(SectionsToDisplay.problemStatement);
}

function loginOut() {
  vscode.postMessage({
    command: OutgoingCommand.login,
  });
}

async function setCookie(_token) {
  console.log("before set", token);
  console.log("Setting cookie");
  try {
  await fetch(`\${base_url}/api/public/re-key`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${_token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      token = _token;
      postInfo("Login successful!");
      changeState();
    })
    .catch((error) => {
        if (error instanceof TypeError) {
          throw new Error(`Could not reach the server: ${error.message}`);
        }

      throw error;
    });
  } catch (error) {
    postError(`Login failed: ${error}`);
    return;
  }
}

async function deleteCookie() {
  try {
    await fetch(`\${base_url}/api/public/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }

        postInfo("Logout successful!");
        token = undefined;
        document.cookie = "";
        changeState();
      })
      .catch((error) => {
        if (error instanceof TypeError) {
          throw new Error(`Could not reach the server: ${error.message}`);
        }

        throw error;
      });
  } catch (error) {
    postError(`Logout failed: ${error}`);
    return;
  }
}

/** returns all courses that have at least one programming exercise with their total scores
 *  TODO combine with course.api.ts
 * @see course.model.ts
 * @returns Promise<{ course: Course; totalScores: TotalScores }[]>
 */
async function fetch_all_courses() {
  const url = `\${base_url}/api/courses/for-dashboard`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status} message: ${errorText}`
        );
      }

      const data = await response.json();
      return (
        data.courses
          ?.map((courseAndScore) => ({
            course: courseAndScore.course,
            totalScores: courseAndScore.totalScores,
          }))
          .map((courseWithScore) => {
            courseWithScore.course.exercises = courseWithScore.course.exercises
              ?.filter((exercise) => exercise.type == "programming")
              .map((exercise) => {
                exercise.dueDate = exercise.dueDate
                  ? new Date(exercise.dueDate)
                  : undefined;
                return exercise;
              });
            return courseWithScore;
          })
          .filter(
            (courseWithScore) =>
              courseWithScore.course.exercises &&
              courseWithScore.course.exercises.length > 0
          ) ?? []
      );
    })
    .catch((error) => {
      if (error instanceof TypeError) {
        throw new Error(`Could not reach the server: ${error.message}`);
      }

      throw error;
    });
}

function buildCourseItem(_courseWithScore, itemTemplate) {
  const item = itemTemplate.cloneNode(true);
  item.hidden = false;
  item.textContent = _courseWithScore.course.title;
  item.onclick = () => {
    course = _courseWithScore.course;
    changeState();
  };

  return item;
}

async function displayCourseOptions() {
  const coursesWithScores = await fetch_all_courses();
  const courseGrid = document.getElementById("courseGrid");
  courseGrid.innerHTML = "";
  const courseItemTemplate = document.getElementById("courseItem");
  coursesWithScores.forEach((courseWithScore) => {
    const item = buildCourseItem(courseWithScore, courseItemTemplate);
    courseGrid.appendChild(item);
  });
}

function buildExerciseItem(_exercise, itemTemplate) {
  const item = itemTemplate.cloneNode(true);
  item.textContent = _exercise.title;
  item.hidden = false;
  item.onclick = () => {
    // dont set exercise here, because postMessage will trigger a setExercise from plugin side

    vscode.postMessage({
      command: OutgoingCommand.setExercise,
      text: JSON.stringify({
        course: course,
        exercise: _exercise,
      }),
    });
  };

  return item;
}

function displayExerciseOptions() {
  const exerciseGrid = document.getElementById("exerciseGrid");
  exerciseGrid.innerHTML = "";
  const exerciseItemTemplate = document.getElementById("exerciseItem");
  course.exercises.forEach((exercise) => {
    const item = buildExerciseItem(exercise, exerciseItemTemplate);
    exerciseGrid.appendChild(item);
  });
}

async function fetchParticipation(_courseId, _exerciseId) {
  try {
    const response = await fetch(
      `\${base_url}/api/exercises/${_exerciseId}/participation`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    participation = await response.json();
    return participation;
  } catch (error) {
    if (error instanceof TypeError) {
      postError(`Could not reach the server: ${error.message}`);
    }

    postError(`Fetch participation failed: ${error}`);
    return undefined;
  }
}

function displayScore(_courseId, _exerciseId, participation) {
  if (!participation || !participation.results) {
    return false;
  }
  latestResult = participation.results.sort(
    (a, b) => new Date(b.completionDate) - new Date(a.completionDate)
  )[0];
  if (!latestResult) {
    return false;
  }

  document.getElementById(
    "scoreButton"
  ).textContent = `${latestResult.score} %`;
  document.getElementById(
    "scoreIframe"
  ).src = `\${client_url}/courses/${_courseId}/exercises/${_exerciseId}/participations/${participation.id}/results/${latestResult.id}/feedback`;
  document.getElementById("score").hidden = false;
  return true;
}

async function displayProblemStatement() {
  let url = `\${client_url}/courses/${course.id}/exercises/${exercise.id}/problem-statement`;

  const participation = await fetchParticipation(course.id, exercise.id);
  if (displayScore(course.id, exercise.id, participation)) {
    url += `/${participation.id}`;
  } else {
    document.getElementById("score").hidden = true;
  }

  document.getElementById("problemStatementIframe").src = url;

  const button = document.getElementById("cloneSubmitButton");
  if (
    course.shortName.toUpperCase() + exercise.shortName.toUpperCase() ===
    repoKey
  ) {
    button.textContent = "Submit";
    button.onclick = submit;
  } else {
    button.textContent = "Clone";
    button.onclick = cloneRepository;
  }
}

function cloneRepository() {
  vscode.postMessage({
    command: OutgoingCommand.cloneRepository,
  });
}

function submit() {
  vscode.postMessage({
    command: OutgoingCommand.submit,
  });
}

const vscode = acquireVsCodeApi();
changeState();

// Listen for messages from the extension
window.addEventListener("message", (event) => {
  const message = event.data; // The JSON data
  switch (message.command) {
    case IncomingCommand.sendAccessToken:
      setCookie(message.text);
      break;
    case IncomingCommand.logout:
      deleteCookie();
      break;
    case IncomingCommand.back:
      course = undefined;
      exercise = undefined;
      changeState();
      break;
    case IncomingCommand.setExercise:
      const messageText = message.text;
      try {
        const deserializedObject = JSON.parse(messageText);
        course = deserializedObject.course;
        exercise = deserializedObject.exercise;
        repoKey = deserializedObject.repoKey;
        changeState();
      } catch (error) {
        console.error("Failed to deserialize message text:", error);
        vscode.postMessage({
          command: OutgoingCommand.error,
          text: "Failed to deserialize message text: " + error,
        });
      }
      break;
  }
});

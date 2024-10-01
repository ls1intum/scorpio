const IncomingCommand = {
  sendAccessToken: "sendAccessToken",
  logout: "logout",
  setExercise: "setExercise",
  easterEgg: "easterEgg",
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

const pet = document.getElementById("pet");

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
    showSection(SectionsToDisplay.courseSelection);
    displayCourseOptions();
    return;
  }
  if (!exercise) {
    showSection(SectionsToDisplay.exerciseSelection);
    displayExerciseOptions();
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
        throw new Error(`HTTP error! status: ${response.status} message: ${errorText}`);
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
                exercise.dueDate = exercise.dueDate ? new Date(exercise.dueDate) : undefined;
                return exercise;
              });
            return courseWithScore;
          })
          .filter(
            (courseWithScore) =>
              courseWithScore.course.exercises && courseWithScore.course.exercises.length > 0
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
  item.style.display = "flex";
  item.querySelector("#courseTitle").textContent = _courseWithScore.course.title;
  item.querySelector(
    "#courseScore"
  ).textContent = `${_courseWithScore.totalScores.studentScores.absoluteScore}/${_courseWithScore.totalScores.reachablePoints} Points`;

  const nextExercise = _courseWithScore.course?.exercises
    ?.filter((exercise) => exercise.dueDate && exercise.dueDate > new Date())
    .sort((a, b) => (a.dueDate > b.dueDate ? 1 : -1))
    .at(0);

  item.querySelector("#nextExercise").textContent = nextExercise
    ? `Next exercise: ${nextExercise.title}`
    : "No upcoming exercise";
  item.querySelector("#nextExerciseDue").textContent = nextExercise
    ? `due on ${nextExercise.dueDate.toDateString()}`
    : "";

  item.hidden = false;

  item.onclick = () => {
    course = _courseWithScore.course;
    changeState();
  };

  return item;
}

async function displayCourseOptions() {
  const coursesWithScores = await fetch_all_courses();
  const courseGrid = document.getElementById("courseGrid");
  courseGrid.replaceChildren();
  const courseItemTemplate = document.getElementById("courseItem");
  courseItemTemplate.style.display = "none";

  coursesWithScores.forEach((courseWithScore) => {
    const item = buildCourseItem(courseWithScore, courseItemTemplate);
    courseGrid.appendChild(item);
  });
}

function buildExerciseItem(_exercise, itemTemplate) {
  const item = itemTemplate.cloneNode(true);
  item.style.display = "flex";

  item.querySelector("#exerciseTitle").textContent = _exercise.title;
  item.querySelector("#exerciseScore").textContent = (() => {
    const score = _exercise.studentParticipations
      ?.at(0)
      ?.results?.filter((result) => result.rated)
      .sort((a, b) => b.completionDate > a.completionDate)
      .at(0)?.score;
    return score ? `${score} %` : "No graded result";
  })();
  item.querySelector("#exerciseDue").textContent = _exercise.dueDate
    ? _exercise.dueDate.toLocaleString()
    : "";

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
  const upcomingDue = document.getElementById("upcomingDue");
  upcomingDue.replaceChildren();
  const pastDue = document.getElementById("pastDue");
  pastDue.replaceChildren();
  const noDue = document.getElementById("noDue");
  noDue.replaceChildren();

  const exerciseItemTemplate = document.getElementById("exerciseItem");
  exerciseItemTemplate.style.display = "none";

  course.exercises
    .sort((a, b) => (a.dueDate > b.dueDate ? 1 : -1))
    .forEach((exercise) => {
      const item = buildExerciseItem(exercise, exerciseItemTemplate);
      if (exercise.dueDate) {
        if (exercise.dueDate < new Date()) {
          pastDue.appendChild(item);
        } else {
          upcomingDue.appendChild(item);
        }
      } else {
        noDue.appendChild(item);
      }
    });
}

async function fetchParticipation(_courseId, _exerciseId) {
  try {
    const response = await fetch(`\${base_url}/api/exercises/${_exerciseId}/participation`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
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

  document.getElementById("scoreButton").textContent = `${latestResult.score} %`;
  document.getElementById(
    "scoreIframe"
  ).src = `\${client_url}/courses/${_courseId}/exercises/${_exerciseId}/participations/${participation.id}/results/${latestResult.id}/feedback`;
  document.getElementById("score").hidden = false;
  return true;
}

function displayExerciseDetails(participation) {
  const exerciseDetailsTable = document.getElementById("exerciseDetails");
  exerciseDetailsTable.replaceChildren();

  const pointRow = exerciseDetailsTable.insertRow();
  pointRow.insertCell().textContent = "Points";
  pointRow.insertCell().textContent = participation
    ? `${(
        ((participation?.results
          ?.sort((a, b) => new Date(b.completionDate) - new Date(a.completionDate))
          .at(0)?.score ?? 0) *
          exercise.maxPoints) /
        100
      ).toFixed(1)} / ${exercise.maxPoints}`
    : "No score";

  const submissionDueRow = exerciseDetailsTable.insertRow();
  submissionDueRow.insertCell().textContent = "Submission due";
  submissionDueRow.insertCell().textContent = exercise.dueDate
    ? exercise.dueDate.toLocaleString()
    : "No due date";

  const allowComplaintsRow = exerciseDetailsTable.insertRow();
  allowComplaintsRow.insertCell().textContent = "Complaint possible";
  allowComplaintsRow.insertCell().textContent = exercise.allowComplaintsForAutomaticAssessments
    ? "Yes"
    : "No";

  const difficultyRow = exerciseDetailsTable.insertRow();
  difficultyRow.insertCell().textContent = "Difficulty";
  difficultyRow.insertCell().textContent = exercise.difficulty;
}

async function displayProblemStatement() {
  let url = `\${client_url}/courses/${course.id}/exercises/${exercise.id}/problem-statement`;

  const participation = await fetchParticipation(course.id, exercise.id);
  if (participation) {
    url += `/${participation.id}`;
  }

  document.getElementById("score").hidden = !displayScore(course.id, exercise.id, participation);

  displayExerciseDetails(participation);

  document.getElementById("problemStatementIframe").src = url;

  const button = document.getElementById("cloneSubmitButton");
  if (course.shortName.toUpperCase() + exercise.shortName.toUpperCase() === repoKey) {
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
        if (
          deserializedObject.course === course &&
          deserializedObject.exercise === exercise &&
          deserializedObject.repoKey === repoKey
        ) {
          return;
        }
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
    case IncomingCommand.easterEgg:
      showPet(message.text === "true");
      break;
  }
});

let moveIntervalId;
let changeDirectionIntervalId;

function showPet(show) {
  if (show) {
    pet.hidden = false;
    moveIntervalId = setInterval(move, 20);
    changeDirectionIntervalId = setInterval(changeDirection, Math.random() * (3000 - 1000) + 1000);
    updateBoundaries();
    window.addEventListener("resize", updateBoundaries);
  } else {
    pet.hidden = true;
    clearInterval(moveIntervalId);
    clearInterval(changeDirectionIntervalId);
    window.removeEventListener("resize", updateBoundaries);
  }
}

const normal_speed = 3; // (pixels per frame)
let speed = normal_speed;
let posX = 0;
let posY = 0;
let clockwise = 1;
let edge = "bottom";

let leftMax = 0;
let rightMax = window.innerWidth - pet.width;
let topMax = window.innerHeight - pet.width + 8;
let bottomMax = 0;

function updateBoundaries() {
  leftMax = 0;
  rightMax = window.innerWidth - pet.width;
  topMax = window.innerHeight - pet.width + 8;
  bottomMax = 0;

  // making window smaller
  if (posX > rightMax) {
    posX = rightMax;
  }
  if (posY > topMax) {
    posY = topMax;
  }

  // making window bigger
  if (edge === "right") {
    pet.style.left = `${rightMax}px`;
    posX = rightMax;
  }
  if (edge === "top") {
    pet.style.bottom = `${topMax}px`;
    posY = topMax;
  }
}

function move() {
  if (speed === 0) {
    return;
  }
  switch (edge) {
    case "bottom":
      posX += speed * clockwise;
      if (posX > rightMax) {
        edge = "right";
        posX = rightMax;
        pet.style.transform = `rotate(-90deg) scaleX(${clockwise})`;
      } else if (posX < leftMax) {
        edge = "left";
        posX = leftMax;
        pet.style.transform = `rotate(90deg) scaleX(${clockwise})`;
      }
      break;
    case "right":
      posY += speed * clockwise;
      if (posY > topMax) {
        edge = "top";
        posY = topMax;
        pet.style.transform = `rotate(180deg) scaleX(${clockwise})`;
      } else if (posY < bottomMax) {
        edge = "bottom";
        posY = bottomMax;
        pet.style.transform = `rotate(0deg) scaleX(${clockwise})`;
      }
      break;
    case "top":
      posX -= speed * clockwise;
      if (posX < leftMax) {
        edge = "left";
        posX = leftMax;
        pet.style.transform = `rotate(90deg) scaleX(${clockwise})`;
      } else if (posX > rightMax) {
        edge = "right";
        posX = rightMax;
        pet.style.transform = `rotate(-90deg) scaleX(${clockwise})`;
      }
      break;
    case "left":
      posY -= speed * clockwise;
      if (posY < bottomMax) {
        edge = "bottom";
        posY = bottomMax;
        pet.style.transform = `rotate(0deg) scaleX(${clockwise})`;
      } else if (posY > topMax) {
        edge = "top";
        posY = topMax;
        pet.style.transform = `rotate(180deg) scaleX(${clockwise})`;
      }
      break;
  }

  pet.style.left = `${posX}px`;
  pet.style.bottom = `${posY}px`;
}

function changeDirection() {
  if (Math.random() < 0.5) {
    const turn = Math.random() < 0.5 ? -1 : 1;
    clockwise *= turn;
    speed = normal_speed;
    pet.style.transform = `${pet.style.transform} scaleX(${turn})`;
  } else {
    speed = 0;
  }
}

const IncomingCommand = {
  sendAccessToken: "sendAccessToken",
  logout: "logout",
  setExercise: "setExercise",
};

const OutgoingCommand = {
  info: "info",
  error: "error",
  cloneRepository: "cloneRepository",
  submit: "submit",
};

const SectionsToDisplay = {
  login: "login",
  noExercise: "noExercise",
  problemStatement: "problemStatement",
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

let courseIdExerciseId = undefined;
let token = undefined;

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
  } else if (!courseIdExerciseId) {
    showSection(SectionsToDisplay.noExercise);
  } else {
    showSection(SectionsToDisplay.problemStatement);
  }
}

async function setCookie(tk) {
  try {
    await fetch(`http://localhost:8080/api/public/re-key`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tk}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }

        token = tk;
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

function deleteCookie() {
  document.cookie = "";
  // TODO make logout request to Artemis
  token = undefined;
  showSection(SectionsToDisplay.login);
}

async function fetchParticipation(courseId, exerciseId) {
  try {
    const response = await fetch(
      `http://localhost:8080/api/exercises/${exerciseId}/participation`,
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
    if (!participation || !participation.results) {
      return undefined;
    }
    latestResult = participation.results.sort((a, b) => new Date(b.completionDate) - new Date(a.completionDate))[0];
    if(!latestResult){
      return undefined;
    }

    document.getElementById("scoreButton").textContent = `${latestResult.score} %`;
    document.getElementById("scoreIframe").src = `http://localhost:9000/courses/${courseId}/exercises/${exerciseId}/participations/${participation.id}/results/${latestResult.id}/feedback`;
    document.getElementById("score").hidden = false;

    return participation;
  } catch (error) {
    if (error instanceof TypeError) {
      postError(`Could not reach the server: ${error.message}`);
    }

    postError(`Fetch participation failed: ${error}`);
    return undefined;
  }
}

async function setCurrentExercise(
  courseId,
  exerciseId,
  showSubmitButton = false
) {
  let url = `http://localhost:9000/courses/${courseId}/exercises/${exerciseId}/problem-statement`;

  const participation = await fetchParticipation(courseId, exerciseId);
  if (participation) {
    url += `/${participation.id}`;
  } else {
    document.getElementById("score").hidden = true;
  }

  document.getElementById("problemStatementIframe").src = url;

  courseIdExerciseId = { courseId, exerciseId };

  const button = document.getElementById("cloneButton");
  if (showSubmitButton) {
    button.textContent = "Submit";
    button.onclick = submit;
  } else {
    button.textContent = "Clone";
    button.onclick = cloneRepository;
  }

  changeState();
}

function cloneRepository() {
  vscode.postMessage({
    command: OutgoingCommand.cloneRepository,
    text: "",
  });
}

function submit() {
  vscode.postMessage({
    command: OutgoingCommand.submit,
    text: "",
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
    case IncomingCommand.setExercise:
      const messageText = message.text; // e.g., '{"courseId": 123, "exerciseId": 456, "showSubmitButton": true}'
      try {
        const deserializedObject = JSON.parse(messageText);
        setCurrentExercise(
          deserializedObject.courseId,
          deserializedObject.exerciseId,
          deserializedObject.showSubmitButton
        );
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

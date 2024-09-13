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

let exercise = null;
let loggedIn = false;

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
  if (!loggedIn) {
    showSection(SectionsToDisplay.login);
  } else if (!exercise) {
    showSection(SectionsToDisplay.noExercise);
  } else {
    showSection(SectionsToDisplay.problemStatement);
  }
}

async function setCookie(token) {
  try {
    const response = await fetch(`http://localhost:8080/api/public/re-key`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      loggedIn = true;
      postInfo("Login successful!");
    } else {
      throw new Error(response.statusText);
    }
  } catch (error) {
    postError("Login failed: " + error);
    return;
  }

  changeState();
}

function deleteCookie() {
  document.cookie = "";
  // TODO make logout request to Artemis
  loggedIn = false;
  showSection(SectionsToDisplay.login);
}

function setCurrentExercise(courseId, exerciseId, showSubmitButton = false) {
  exercise = { courseId, exerciseId };

  document.getElementById(
    "problemStatementIframe"
  ).src = `http://localhost:9000/courses/${courseId}/exercises/${exerciseId}/problem-statement`;

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
      const messageText = message.text; // e.g., '{"courseId": 123, "exerciseId": 456}'
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

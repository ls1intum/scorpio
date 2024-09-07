const IncomingCommand = {
  sendAccessToken: "sendAccessToken",
  logout: "logout",
  setExercise: "setExercise",
};

const OutgoingCommand = {
  info: "info",
  error: "error",
};

const SectionsToDisplay = {
  login: "login",
  noExercise: "noExercise",
  problemStatement: "problemStatement",
};

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

async function setCookie(token) {
  try {
    const response = await fetch(`http://localhost:8080/api/public/re-key`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    if (response.ok) {
      loggedIn = true;
      vscode.postMessage({
        command: OutgoingCommand.info,
        text: "Login successful!",
      });
    } else {
      console.error("Login failed:", response.statusText);
      vscode.postMessage({
        command: OutgoingCommand.error,
        text: "Login failed: " + response.statusText,
      });
      return;
    }
  } catch (error) {
    console.error("Login failed:", error);
    vscode.postMessage({
      command: OutgoingCommand.error,
      text: "Login failed: " + error,
    });
    return;
  }

  if (!exercise) {
    showSection(SectionsToDisplay.noExercise);
  } else {
    showSection(SectionsToDisplay.problemStatement);
  }
}

function deleteCookie() {
  document.cookie = "";
  // TODO make logout request to Artemis
  loggedIn = false;
  showSection(SectionsToDisplay.login);
}

function setCurrentExercise(courseId, exerciseId) {
  document.getElementById(
    "problemStatementIframe"
  ).src = `http://localhost:9000/courses/${courseId}/exercises/${exerciseId}/problem-statement`;

  exercise = { courseId, exerciseId };

  if (!loggedIn) {
    showSection(SectionsToDisplay.login);
  } else {
    showSection(SectionsToDisplay.problemStatement);
  }
}

const vscode = acquireVsCodeApi();

if (!loggedIn) {
  showSection(SectionsToDisplay.login);
} else if (!exercise) {
  showSection(SectionsToDisplay.noExercise);
} else {
  showSection(SectionsToDisplay.problemStatement);
}
// setCurrentExercise(1, 1);
// showSection(SectionsToDisplay.problemStatement);

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
          deserializedObject.exerciseId
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

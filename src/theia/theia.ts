import * as vscode from "vscode";
import { cloneTheia } from "./cloning";
import { exit } from "process";
import { execSync } from "child_process";

type theiaEnv = {
  ARTEMIS_TOKEN: string | undefined;
  ARTEMIS_URL: string | undefined;
  GIT_URI: URL | undefined;
  GIT_USER: string | undefined;
  GIT_MAIL: string | undefined;
};

function readTheiaEnv(): theiaEnv | undefined {
  if (!getEnvVariable("THEIA")) {
    return undefined;
  }

  const theiaArtemisToken = getEnvVariable("ARTEMIS_TOKEN");
  const theiaArtemisUrlString = getEnvVariable("ARTEMIS_URL");
  const theiaArtemisUrl = theiaArtemisUrlString ? theiaArtemisUrlString : undefined;
  const theiaGitCloneUrlString = getEnvVariable("GIT_URI");
  const theiaGitCloneUrl = theiaGitCloneUrlString ? new URL(theiaGitCloneUrlString) : undefined;
  const theiaGitUserName = getEnvVariable("GIT_USER");
  const theiaGitUserMail = getEnvVariable("GIT_MAIL");

  return {
    ARTEMIS_TOKEN: theiaArtemisToken,
    ARTEMIS_URL: theiaArtemisUrl,
    GIT_URI: theiaGitCloneUrl,
    GIT_USER: theiaGitUserName,
    GIT_MAIL: theiaGitUserMail,
  };
}

export var theiaEnv: theiaEnv | undefined;

export async function initTheia() {
  theiaEnv = readTheiaEnv();

  if (!theiaEnv) {
    return;
  }

  vscode.window.showInformationMessage("Theia environment detected");
  if (
    !theiaEnv.ARTEMIS_TOKEN ||
    !theiaEnv.ARTEMIS_URL ||
    !theiaEnv.GIT_URI ||
    !theiaEnv.GIT_USER ||
    !theiaEnv.GIT_MAIL
  ) {
    vscode.window.showErrorMessage(
      "The Theia environment variables are not configured correctly. Quitting extension."
    );
    exit(1);
  }

  vscode.commands.executeCommand("setContext", "scorpio.theia", true);

  // clone repository
  cloneTheia(theiaEnv.GIT_URI!);

  // login should trigger workspace detection
}


function getEnvVariable(key: string): string | undefined {
  try {
    const result = execSync(`echo $${key}`, { encoding: "utf8" });
    return result.trim();
  } catch (error) {
    console.error(`Error fetching env variable ${key}: ${error}`);
    return undefined;
  }
}

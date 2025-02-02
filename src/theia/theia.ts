import * as vscode from "vscode";
import { execSync } from "child_process";
import simpleGit, { GitConfigScope } from "simple-git";
import { hostname } from "os";
import { cloneByGivenURL } from "../participation/cloning.service";

type theiaEnv = {
  THEIA_FLAG: boolean;
  ARTEMIS_TOKEN: string | undefined;
  ARTEMIS_URL: string | undefined;
  GIT_URI: URL | undefined;
  GIT_USER: string | undefined;
  GIT_MAIL: string | undefined;
};

function readTheiaEnv(): theiaEnv {
  const theiaFlag = getEnvVariable("THEIA") !== undefined;

  const theiaArtemisToken = getEnvVariable("ARTEMIS_TOKEN");

  const theiaArtemisUrlString = getEnvVariable("ARTEMIS_URL");
  const theiaArtemisUrl = theiaArtemisUrlString ? theiaArtemisUrlString : undefined;

  const theiaGitCloneUrlString = getEnvVariable("GIT_URI");
  const theiaGitCloneUrl = theiaGitCloneUrlString ? new URL(theiaGitCloneUrlString) : undefined;

  const theiaGitUserName = getEnvVariable("GIT_USER");
  const theiaGitUserMail = getEnvVariable("GIT_MAIL");

  return {
    THEIA_FLAG: theiaFlag,
    ARTEMIS_TOKEN: theiaArtemisToken,
    ARTEMIS_URL: theiaArtemisUrl,
    GIT_URI: theiaGitCloneUrl,
    GIT_USER: theiaGitUserName,
    GIT_MAIL: theiaGitUserMail,
  };
}

export const theiaEnv: theiaEnv = readTheiaEnv();

export function getWorkspaceFolder(){
  return vscode.workspace.workspaceFolders?.at(0)?.uri;
}

export async function initTheia() {
  if (theiaEnv.GIT_URI) {
    vscode.commands.executeCommand("setContext", "scorpio.theia.givenExercise", true);
  }

  // clone repository
  if (theiaEnv.GIT_URI) {
      const workspaceFolderUri = getWorkspaceFolder();
      if (!workspaceFolderUri) {
        vscode.window.showErrorMessage("No workspace folder available to clone repository");
        return;
      }
    
    cloneByGivenURL(theiaEnv.GIT_URI, workspaceFolderUri.fsPath);
  }

  // set git config values
  if (theiaEnv.THEIA_FLAG) {
    try {
      const git = simpleGit();
      const hostnameConst = hostname();
      theiaEnv.GIT_USER = theiaEnv.GIT_USER ? theiaEnv.GIT_USER : hostnameConst;
      theiaEnv.GIT_MAIL = theiaEnv.GIT_MAIL
        ? theiaEnv.GIT_MAIL
        : theiaEnv.GIT_USER
        ? theiaEnv.GIT_USER + "@artemis-theia.de"
        : hostnameConst + "@artemis-theia.de";

      await git.addConfig("user.name", theiaEnv.GIT_USER, undefined, GitConfigScope.global);
      await git.addConfig("user.email", theiaEnv.GIT_MAIL, undefined, GitConfigScope.global);
    } catch (e: any) {
      console.error(`Error setting git config: ${e.message}`);
    }
  }
  // login should trigger workspace detection
}

function getEnvVariable(key: string): string | undefined {
  try {
    const result = execSync(`echo $${key}`, { encoding: "utf8" }).trim();
    return result ? result : undefined;
  } catch (error) {
    console.error(`Error fetching env variable ${key}: ${error}`);
    return undefined;
  }
}

import * as vscode from "vscode";
import { authenticationProvider } from "../extension";
import { theiaEnv } from "../theia/theia";
import { getSettingsForTheia, handleSettingsChangeForTheia } from "../theia/settings";

export type Settings = {
  base_url: string | undefined;
  default_repo_path: string | undefined;
  easter_egg: boolean;
};

export var settings: Settings

export function initSettings() {
  if (theiaEnv) {
    settings = getSettingsForTheia();
  } else{
    settings = getSettingsForVscode();
  }

  vscode.workspace.onDidChangeConfiguration((e) => {
    if (theiaEnv) {
      handleSettingsChangeForTheia(e);
    } else {
      handleSettingsChangeForVscode(e);
    }
  });
}

function getSettingsForVscode(): Settings {
  const base_url = vscode.workspace.getConfiguration("scorpio").get<string>("artemis.apiBaseUrl");
  if (!base_url) {
    vscode.window.showErrorMessage("Artemis Base URL not set. Please set it in the settings.");
  }

  const default_repo_path = vscode.workspace.getConfiguration("scorpio").get<string>("defaults.repoPath");

  const easter_egg = vscode.workspace.getConfiguration("scorpio").get<boolean>("?") ?? false;

  return {
    base_url: base_url,
    default_repo_path: default_repo_path,
    easter_egg: easter_egg,
  };
}

async function handleSettingsChangeForVscode(e: vscode.ConfigurationChangeEvent) {
  if (e.affectsConfiguration("scorpio.artemis.apiBaseUrl")) {
    const base_url = vscode.workspace.getConfiguration("scorpio").get<string>("artemis.apiBaseUrl");
    if (!base_url) {
      vscode.window.showErrorMessage("Artemis Base URL not set. Please set it in the settings.");
    }
    settings.base_url = base_url;

    await authenticationProvider.removeSession();
    console.warn("Restarting extension");
    vscode.commands.executeCommand("scorpio.restart");
  }

  if (e.affectsConfiguration("scorpio.defaults.repoPath")) {
    const default_repo_path = vscode.workspace.getConfiguration("scorpio").get<string>("defaults.repoPath");
    settings.default_repo_path = default_repo_path;
  }

  if (e.affectsConfiguration("scorpio.?")) {
    const easter_egg = vscode.workspace.getConfiguration("scorpio").get<boolean>("?") ?? false;
    settings.easter_egg = easter_egg;
  }
}



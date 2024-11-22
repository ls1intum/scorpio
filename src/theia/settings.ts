import * as vscode from "vscode";
import { settings, Settings } from "../shared/settings";
import { theiaEnv } from "./theia";

export function getSettingsForTheia(): Settings {
  const base_url = theiaEnv!.ARTEMIS_URL?.toString();
  if (!base_url) {
    vscode.window.showWarningMessage("Artemis API URL not set in env. Falling back to default.");
    vscode.workspace.getConfiguration("scorpio").get<string>("artemis.apiBaseUrl");
  }

  const config = vscode.workspace.getConfiguration("scorpio");
  config.update("artemis.apiBaseUrl", base_url, vscode.ConfigurationTarget.Global);

  return {
    base_url: base_url,
    default_repo_path: undefined,
    easter_egg: false,
  };
}

export async function handleSettingsChangeForTheia(e: vscode.ConfigurationChangeEvent) {
  const config = vscode.workspace.getConfiguration("scorpio");

  if (e.affectsConfiguration("scorpio.artemis.apiBaseUrl")) {
    // url should not be changed in theia environement
    vscode.window.showWarningMessage("Artemis URL can not be changed in theia environment");
    config.update("artemis.apiBaseUrl", settings.base_url, vscode.ConfigurationTarget.Global);
  }

  if (e.affectsConfiguration("scorpio.defaults.repoPath")) {
    // path should not be changed in theia environement
    vscode.window.showWarningMessage("Default repository path can not be changed in theia environment");
    config.update("defaults.repoPath", settings.default_repo_path, vscode.ConfigurationTarget.Global);
  }

  if (e.affectsConfiguration("scorpio.?")) {
    const easter_egg = vscode.workspace.getConfiguration("scorpio").get<boolean>("?") ?? false;
    settings.easter_egg = easter_egg;
  }
}

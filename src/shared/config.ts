import * as vscode from "vscode";
import { authenticationProvider } from "../extension";

type Settings = {
  base_url: string | undefined;
  client_url: string | undefined;
  default_repo_path: string | undefined;
  easter_egg: boolean;
};

export const settings: Settings = (() => {
  const base_url = vscode.workspace.getConfiguration("scorpio").get<string>("artemis.apiBaseUrl");
  if (!base_url) {
    vscode.window.showErrorMessage("Artemis API Base URL not set. Please set it in the settings.");
  }

  let client_url = vscode.workspace.getConfiguration("scorpio").get<string>("artemis.clientBaseUrl");
  if (!client_url) {
    if (base_url) {
      client_url = base_url;
    } else {
      vscode.window.showErrorMessage("Artemis API Base URL not set. Please set it in the settings.");
    }
  }
  const default_repo_path = vscode.workspace.getConfiguration("scorpio").get<string>("defaults.repoPath");

  const easter_egg = vscode.workspace.getConfiguration("scorpio").get<boolean>("?") ?? false;

  return {
    base_url: base_url,
    client_url: client_url,
    default_repo_path: default_repo_path,
    easter_egg: easter_egg,
  };
})();


vscode.workspace.onDidChangeConfiguration(async (e) => {
  if (e.affectsConfiguration("scorpio.artemis.apiBaseUrl")) {
    const base_url = vscode.workspace.getConfiguration("scorpio").get<string>("artemis.apiBaseUrl");
    if (!base_url) {
      vscode.window.showErrorMessage("Artemis API Base URL not set. Please set it in the settings.");
    }
    settings.base_url = base_url;

    await authenticationProvider.removeSession();
    console.log("Restarting extension");
    vscode.commands.executeCommand("scorpio.restart");
  }

  if (e.affectsConfiguration("scorpio.artemis.clientBaseUrl")) {
    let client_url = vscode.workspace.getConfiguration("scorpio").get<string>("artemis.clientBaseUrl");
    if (!client_url) {
      if (settings.base_url) {
        client_url = settings.base_url;
      } else {
        vscode.window.showErrorMessage("Artemis API Base URL not set. Please set it in the settings.");
      }
    }
    settings.client_url = client_url;
  }

  if (e.affectsConfiguration("scorpio.defaults.repoPath")) {
    const default_repo_path = vscode.workspace.getConfiguration("scorpio").get<string>("defaults.repoPath");
    settings.default_repo_path = default_repo_path;
  }

  if (e.affectsConfiguration("scorpio.?")) {
    const easter_egg = vscode.workspace.getConfiguration("scorpio").get<boolean>("?") ?? false;
    settings.easter_egg = easter_egg;

  }
});

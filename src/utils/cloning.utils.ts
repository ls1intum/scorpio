export function addVcsTokenToUrl(url: string, username: string, vsctoken: string): string {
  const credentials = `://${username}:${vsctoken}@`;
  if (!url.includes("@")) {
    // the url has the format https://vcs-server.com
    return url.replace("://", credentials);
  } else {
    // the url has the format https://username@vcs-server.com -> replace ://username@
    return url.replace(/:\/\/.*@/, credentials);
  }
}

export function getProjectKeyFromRepoUrl(repoUrl: string): string {
    // extract projectKey {protocol}://{username}@{host}:{port}/git/{PROJECT_KEY}/{project_key}-{username}.git
    const parts = repoUrl.split("/");
    if (parts.length < 5) {
      throw new Error("Invalid artemis repository URL does not contain project key");
    }
  
    const projectKey = parts[4];
    return projectKey;
  }
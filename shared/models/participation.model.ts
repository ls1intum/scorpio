import { Exercise } from "./exercise.model";
import { Result } from "./result.model";
import { ProgrammingSubmission } from "./submission.model";

export class StudentParticipation {
  public id?: number;

  public individualDueDate?: Date;
  public submissions?: ProgrammingSubmission[];
  public exercise?: Exercise;

  // workaround for strict template here, only used in case of StudentParticipation
  public participantName?: string;
  public participantIdentifier?: string;

  public repositoryUri?: string;
  public buildPlanId?: string;
  public branch?: string;

  constructor() {}
}

export function getLatestResult(participation: StudentParticipation | undefined): Result | undefined {
  return participation?.submissions?.reduce((latestSubmission, currentSubmission) => {
    return latestSubmission.id! > currentSubmission.id! ? latestSubmission : currentSubmission;
  })?.results?.reduce((latestResult, currentResult) => {
    return latestResult.id! > currentResult.id! ? latestResult : currentResult;
  })
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

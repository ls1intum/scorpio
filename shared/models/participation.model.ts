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

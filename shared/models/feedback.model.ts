import { Result } from "./result.model";
import { TestCase } from "./testcase.model";

export enum FeedbackType {
  MANUAL = "MANUAL",
  MANUAL_UNREFERENCED = "MANUAL_UNREFERENCED",
  AUTOMATIC_ADAPTED = "AUTOMATIC_ADAPTED",
  AUTOMATIC = "AUTOMATIC",
}

export class Feedback {
  public id?: number;
  public text?: string;
  public detailText?: string;
  public hasLongFeedbackText?: boolean;
  public reference?: string;
  public credits?: number;
  public type?: FeedbackType;
  public result?: Result;
  public positive?: boolean;
  public testCase?: TestCase;

  constructor() {}
}

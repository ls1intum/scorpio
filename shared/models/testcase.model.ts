import { ProgrammingExercise } from "./exercise.model";

export enum TestCaseType {
  STRUCTURAL = "STRUCTURAL",
  BEHAVIORAL = "BEHAVIORAL",
  DEFAULT = "DEFAULT",
}

export enum Visibility {
  ALWAYS = "ALWAYS",
  AFTER_DUE_DATE = "AFTER_DUE_DATE",
  NEVER = "NEVER",
}

export class TestCase {
  id?: number;
  testName?: string;
  weight?: number;
  bonusMultiplier?: number;
  bonusPoints?: number;
  active?: boolean;
  visibility?: Visibility;
  exercise?: ProgrammingExercise;
  type?: TestCaseType;
}

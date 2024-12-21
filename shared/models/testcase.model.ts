import { ProgrammingExercise } from "./exercise.model"
import { Visibility } from "./feedback.model"

export enum TestCaseType {
    STRUCTURAL = 'STRUCTURAL',
    BEHAVIORAL = 'BEHAVIORAL',
    DEFAULT = 'DEFAULT',
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
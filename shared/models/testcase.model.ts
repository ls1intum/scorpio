import { ProgrammingExercise } from "./exercise.model"
import { Visibility } from "./feedback.model"

export enum TestCaseType {
    STRUCTURAL = 'STRUCTURAL',
    BEHAVIORAL = 'BEHAVIORAL',
    DEFAULT = 'DEFAULT',
}

export class TestCase {
    id: number;
    testName?: string;
    weight?: number;
    bonusMultiplier?: number;
    bonusPoints?: number;
    active?: boolean;
    visibility?: Visibility;
    exercise?: ProgrammingExercise;
    type?: TestCaseType;

    constructor(
        id: number,
        testName?: string,
        weight?: number,
        bonusMultiplier?: number,
        bonusPoints?: number,
        active?: boolean,
        visibility?: Visibility,
        exercise?: ProgrammingExercise,
        type?: TestCaseType
    ){
        this.id = id;
        this.testName = testName;
        this.weight = weight;
        this.bonusMultiplier = bonusMultiplier;
        this.bonusPoints = bonusPoints;
        this.active = active;
        this.visibility = visibility;
        this.exercise = exercise;
        this.type = type;
    }
}
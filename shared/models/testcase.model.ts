import { Visibility } from "./feedback.model"

export enum TestCaseType {
    STRUCTURAL = 'STRUCTURAL',
    BEHAVIORAL = 'BEHAVIORAL',
    DEFAULT = 'DEFAULT',
}

export type TestCase = {
    id: number,
    testName: string,
    weight: number,
    active: boolean,
    visibility: Visibility
    bonusMultiplier: number
    bonusPoints: number
    type: TestCaseType
}
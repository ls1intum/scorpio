import { TestCase } from "./testcase.model";

export enum FeedbackType {
    MANUAL = "MANUAL",
    MANUAL_UNREFERENCED = "MANUAL_UNREFERENCED",
    AUTOMATIC_ADAPTED = "AUTOMATIC_ADAPTED",
    AUTOMATIC = "AUTOMATIC",
}

export enum Visibility {
    ALWAYS = "ALWAYS",
    AFTER_DUE_DATE = "AFTER_DUE_DATE",
    NEVER = "NEVER",
}

export type Feedback = {
    id: number,
    detailText: string,
    testCase: TestCase,
    credits: number,
    positive: boolean,
    type: FeedbackType,
    visibility: Visibility,
}

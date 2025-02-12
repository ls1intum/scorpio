import { AssessmentType } from "./exercise.model";
import { Feedback } from "./feedback.model"
import { ProgrammingSubmission } from "./submission.model";

export class Result {
    public id?: number;
    public completionDate?: Date;
    public successful?: boolean;

    /**
     * Current score in percent i.e. between 1 - 100
     * - Can be larger than 100 if bonus points are available
     */
    public score?: number;
    public assessmentType?: AssessmentType;
    public rated?: boolean;
    public hasComplaint?: boolean;
    public exampleResult?: boolean;
    public testCaseCount?: number;
    public passedTestCaseCount?: number;
    public codeIssueCount?: number;

    public submission?: ProgrammingSubmission = new ProgrammingSubmission();
    public feedbacks: Feedback[] = [];

    constructor() {
    }

    static fromJSON(json: any): Result {
        const result = Object.assign(new Result(), json);
        if (json.submission) {
            result.submission = Object.assign(new ProgrammingSubmission(), json.submission);
        }

        return result;
    }
}

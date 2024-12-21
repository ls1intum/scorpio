import { AssessmentType } from "./exercise.model";
import { Feedback } from "./feedback.model"
import { StudentParticipation } from "./participation.model";

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
    public buildJobId?: string;

    // public submission?: Submission;
    public feedbacks: Feedback[] = [];
    /**
     * @deprecated This property will be removed in Artemis 8.0. Use `submission.participation` instead.
     */
    public participation?: StudentParticipation;

    constructor() {
    }
}

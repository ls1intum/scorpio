import { Result } from "./result.model";

const enum SubmissionType {
    MANUAL = 'MANUAL',
    TIMEOUT = 'TIMEOUT',
    INSTRUCTOR = 'INSTRUCTOR',
    EXTERNAL = 'EXTERNAL',
    TEST = 'TEST',
    ILLEGAL = 'ILLEGAL',
}

export class ProgrammingSubmission{
    public id?: number;
    public submitted?: boolean;
    public submissionDate?: Date;
    public type?: SubmissionType;
    public exampleSubmission?: boolean;
    public durationInMinutes?: number;
    public results?: Result[];

    public commitHash?: string;
    public buildFailed?: boolean;
}
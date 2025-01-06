import { Exercise } from "./exercise.model";
import { Result } from "./result.model"

export class StudentParticipation {
    public id?: number;

    public individualDueDate?: Date;
    public presentationScore?: number;
    /**
     * @deprecated This property will be removed in Artemis 8.0. Use `submissions.results` instead.
     */
    public results: Result[] = [];
    // public submissions?: Submission[];
    public exercise?: Exercise;

    // workaround for strict template here, only used in case of StudentParticipation
    public participantName?: string;
    public participantIdentifier?: string;

    public repositoryUri?: string;
    public buildPlanId?: string;
    public branch?: string;

    constructor() {
    }

    public getLatestResult(): Result | undefined {
        if (this.results.length === 0) {
            return undefined;
        }
        return this.results.reduce((latestResult, currentResult) => {
            return latestResult.id! > currentResult.id! ? latestResult : currentResult;
        });
    }
}

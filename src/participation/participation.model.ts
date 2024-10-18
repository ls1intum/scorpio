export type Participation = {
    type: string,
    id: number,
    repositoryUri: string,
    userIndependentRepositoryUri: string,
    participantIdentifier: string,
    results: Result[] | undefined
}

export type Result = {
    id: number,
    completionDate: Date,
    score: number,
    rated: boolean,
}
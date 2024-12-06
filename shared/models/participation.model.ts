import { Result } from "./result.model"

export type Participation = {
    type: string,
    id: number,
    repositoryUri: string,
    userIndependentRepositoryUri: string,
    participantIdentifier: string,
    results: Result[]
}
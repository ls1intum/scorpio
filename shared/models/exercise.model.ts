import { Participation } from "./participation.model"

export type Exercise = {
    type: string,
    id: number,
    title: string,
    shortName: string,
    problemStatement: string,
    // fix that jsons are not correctly deserialized
    dueDate: Date | undefined,
    maxPoints: number,
    bonusPoints: number,
    difficulty: string | undefined,
    studentParticipations: Participation[],
}
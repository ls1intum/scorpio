import { Feedback } from "./feedback.model"

export type Result = {
    id: number,
    completionDate: Date,
    score: number,
    rated: boolean,
    feedbacks: Feedback[]
}
import { Exercise } from './exercise.model';

export type Course = {
    id: number;
    title: string;
    description: string;
    shortName: string;
    exercises: Exercise[];
}

export type TotalScores = {
    maxPoints: number;
    reachablePoints: number;
    studentScores: {
        absoluteScore: number;
        relativeScore: number;
    }
}
import { Exercise } from '../exercise/exercise.model';

export type Course = {
    id: number;
    title: string;
    description: string;
    shortName: string;
    exercises: Exercise[] | undefined;
}

export type TotalScores = {
    maxPoints: number;
    reachablePoints: number;
    studentScores: {
        absoluteScore: number;
        relativeScore: number;
    }
}
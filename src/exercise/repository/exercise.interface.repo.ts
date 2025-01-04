import { Course } from "@shared/models/course.model";
import { Exercise } from "@shared/models/exercise.model";

export interface ExerciseDB {
    getExercise(exerciseId: string): Promise<Exercise>;
    saveExercise(exercise: Exercise): Promise<Exercise>;
}
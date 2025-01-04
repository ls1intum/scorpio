import { ExerciseDB } from "./exercise.interface.repo";
import { Exercise } from "@shared/models/exercise.model";

class ExerciseDBKeyValue implements ExerciseDB {
    getExercise(exerciseId: string): Promise<Exercise> {
        throw new Error("Method not implemented.");
    }

    saveExercise(exercise: Exercise): Promise<Exercise> {
        throw new Error("Method not implemented.");
    }
}
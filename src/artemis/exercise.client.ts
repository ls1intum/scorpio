import { Course } from "@shared/models/course.model";
import { Exercise } from "@shared/models/exercise.model";
import { artemisRequestJson } from "../infra/http/artemis-http.client";

export async function fetchProgrammingExercisesByCourseId(
  token: string,
  courseId: number,
): Promise<Exercise[]> {
  const data = await artemisRequestJson<any>(`/api/core/courses/${courseId}/for-dashboard`, {
    token,
  });

  return (
    data.course.exercises
      ?.filter((exercise: Exercise) => exercise.type == "programming")
      .map((exercise: Exercise) => {
        exercise.dueDate = exercise.dueDate ? new Date(exercise.dueDate) : undefined;
        return exercise;
      }) ?? ([] as Exercise[])
  );
}

export async function fetchExerciseById(
  token: string,
  exerciseId: number,
): Promise<{ course: Course; exercise: Exercise }> {
  const data = await artemisRequestJson<{ [key: string]: any }>(
    `/api/exercise/exercises/${exerciseId}`,
    { token },
  );
  return { course: data.course as Course, exercise: data as Exercise };
}

export async function fetchExerciseDetailesById(
  token: string,
  exerciseId: number,
): Promise<Exercise> {
  const response = await artemisRequestJson<any>(`/api/exercise/exercises/${exerciseId}/details`, {
    token,
  });
  const exercise = response.exercise;

  // Transform API response to match our data model:
  // From: participation -> results -> submission
  // To:   participation -> submissions -> results
  exercise.studentParticipations = (exercise.studentParticipations ?? []).map(
    (participation: any) => {
      const submissions = (participation.results ?? []).map((result: any) => {
        const { submission } = result;
        const resultWithoutSubmission = { ...result, submission: undefined };

        return {
          ...submission,
          results: [resultWithoutSubmission],
        };
      });

      return {
        ...participation,
        submissions,
        results: undefined,
      };
    },
  );

  return exercise as Exercise;
}

import { settings } from "../shared/settings";
import { Course } from "@shared/models/course.model";
import { Exercise } from "@shared/models/exercise.model";
import { StudentParticipation } from "@shared/models/participation.model";

export async function fetch_programming_exercises_by_courseId(
  token: string,
  courseId: number
): Promise<Exercise[]> {
  const url = `${settings.base_url}/api/core/courses/${courseId}/for-dashboard`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(`HTTP error! status: ${response.status} message: ${errorText}`);
      }

      const data = await response.json();

      return (
        data.course.exercises
          ?.filter((exercise: Exercise) => exercise.type == "programming")
          .map((exercise: Exercise) => {
            // date string is not cast correctly to interface Date before
            exercise.dueDate = exercise.dueDate ? new Date(exercise.dueDate) : undefined;
            return exercise;
          }) ?? ([] as Exercise[])
      );
    })
    .catch((error) => {
      if (error instanceof TypeError) {
        throw new Error(`Could not reach the server: ${error.message}`);
      }

      throw error;
    });
}

export async function fetch_exercise_by_id(
  token: string,
  exerciseId: number
): Promise<{ course: Course; exercise: Exercise }> {
  const url = `${settings.base_url}/api/exercise/exercises/${exerciseId}`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(`HTTP error! status: ${response.status} message: ${errorText}`);
      }

      const data: { [key: string]: any } = await response.json();

      return { course: data.course as Course, exercise: data as Exercise };
    })
    .catch((error) => {
      if (error instanceof TypeError) {
        throw new Error(`Could not reach the server: ${error.message}`);
      }

      throw error;
    });
}

export async function fetch_exercise_details_by_id(token: string, exerciseId: number): Promise<Exercise> {
  const url = `${settings.base_url}/api/exercise/exercises/${exerciseId}/details`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(`HTTP error! status: ${response.status} message: ${errorText}`);
      }

      const exercise = (await response.json()).exercise;

      // Transform API response to match our data model:
      // From: participation -> results -> submission
      // To:   participation -> submissions -> results
      exercise.studentParticipations = (exercise.studentParticipations ?? []).map((participation: any) => {
        // Create submissions array with nested results
        const submissions = (participation.results ?? []).map((result: any) => {
          const { submission } = result;
          // Remove circular reference
          const resultWithoutSubmission = { ...result, submission: undefined };

          // Return submission with result included
          return {
            ...submission,
            results: [resultWithoutSubmission],
          };
        });

        // Return participation with new structure
        return {
          ...participation,
          submissions,
          results: undefined, // Remove original results after restructuring
        };
      });

      return exercise as Exercise;
    })
    .catch((error) => {
      if (error instanceof TypeError) {
        throw new Error(`Could not reach the server: ${error.message}`);
      }

      throw error;
    });
}

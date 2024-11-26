import { settings } from "../shared/settings";
import { Course } from "../course/course.model";
import { Exercise } from "./exercise.model";

export async function fetch_exercise_by_exerciseId(
  token: string,
  exerciseId: number
): Promise<Exercise> {
  const url = `${settings.base_url}/api/exercises/${exerciseId}`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} message: ${response.text}`
        );
      }

      const data = await response.json();

      return data as Exercise;
    })
    .catch((error) => {
      if (error instanceof TypeError) {
        throw new Error(`Could not reach the server: ${error.message}`);
      }

      throw error;
    });
}

export async function fetch_programming_exercises_by_courseId(
  token: string,
  courseId: number
): Promise<Exercise[]> {
  const url = `${settings.base_url}/api/courses/${courseId}/for-dashboard`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} message: ${response.text}`
        );
      }

      const data = await response.json();

      return data.course.exercises?.filter((exercise: Exercise) => exercise.type == "programming")
      .map((exercise : Exercise) => {
        // date string is not cast correctly to interface Date before
        exercise.dueDate = exercise.dueDate ? new Date(exercise.dueDate) : undefined;
        return exercise;
      }) 
      ?? [] as Exercise[];
    })
    .catch((error) => {
      if (error instanceof TypeError) {
        throw new Error(`Could not reach the server: ${error.message}`);
      }

      throw error;
    });
}

export async function fetch_course_exercise_projectKey(
  token: string,
  projectKey: string
): Promise<{ course: Course; exercise: Exercise }> {
  const url = `${settings.base_url}/api/programming-exercises/project-key/${projectKey}`;

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
        throw new Error(
          `HTTP error! status: ${response.status} message: ${errorText}`
        );
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

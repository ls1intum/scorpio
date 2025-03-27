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

        throw new Error(
          `HTTP error! status: ${response.status} message: ${errorText}`
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

export async function fetch_course_exercise_by_repo_name(
  token: string,
  repoName: string
): Promise<{ course: Course; exercise: Exercise }> {
  const url = `${settings.base_url}/api/programming/programming-exercise-participations/repo-name/${repoName}`;

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

      const course = data.exercise.course as Course;
      data.exercise.course = null;
      let exercise = data.exercise as Exercise;
      data.exercise = null;
      exercise.studentParticipations = [data as StudentParticipation];


      return { course: course, exercise: exercise };
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

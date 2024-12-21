import { settings } from "../shared/settings";
import { Course } from "@shared/models/course.model";

export async function fetch_all_courses(token: string): Promise<Course[]> {
  const url = `${settings.base_url}/api/courses/for-dashboard`;

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
        data.courses
          ?.map((courseAndScore: any) => {
            let course: Course = courseAndScore.course as Course;
            course.maxPoints = courseAndScore.totalScores.maxPoints;
            course.absoluteScore = courseAndScore.totalScores.studentScores.absoluteScore;
            course.relativeScore = courseAndScore.totalScores.studentScores.relativeScore;

            return course;
          })
          .map((course: Course) => {
            course.exercises = course.exercises
              ?.filter((exercise) => exercise.type == "programming")
              .map((exercise) => {
                exercise.dueDate = exercise.dueDate ? new Date(exercise.dueDate!) : undefined;
                return exercise;
              });
            return course;
          })
          .filter((course: Course) => course.exercises && course.exercises.length > 0) ?? []
      );
    })
    .catch((error) => {
      if (error instanceof TypeError) {
        throw new Error(`Could not reach the server: ${error.message}`);
      }

      throw error;
    });
}

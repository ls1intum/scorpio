import { settings } from "../shared/config";
import { Course, TotalScores } from "./course.model";

export async function fetch_course_by_courseId(
  token: string,
  courseId: number
): Promise<Course> {
  const url = `${settings.base_url}/api/courses/${courseId}`;

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
      return data as Course;
    })
    .catch((error) => {
      if (error instanceof TypeError) {
        throw new Error(`Could not reach the server: ${error.message}`);
      }

      throw error;
    });
}

export async function fetch_all_courses(
  token: string
): Promise<{ course: Course; totalScores: TotalScores }[]> {
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
        throw new Error(
          `HTTP error! status: ${response.status} message: ${errorText}`
        );
      }

      const data = await response.json();
      return (
        data.courses
          ?.map((courseAndScore: any) => ({
            course: courseAndScore.course,
            totalScores: courseAndScore.totalScores,
          }))
          .map(
            (courseWithScore: { course: Course; totalScores: TotalScores }) => {
              courseWithScore.course.exercises =
                courseWithScore.course.exercises
                  ?.filter((exercise) => exercise.type == "programming")
                  .map((exercise) => {
                    exercise.dueDate = exercise.dueDate
                      ? new Date(exercise.dueDate!)
                      : undefined;
                    return exercise;
                  });
              return courseWithScore;
            }
          )
          .filter(
            (courseWithScore: { course: Course; totalScores: TotalScores }) =>
              courseWithScore.course.exercises && courseWithScore.course.exercises.length > 0
          ) ?? []
      );
    })
    .catch((error) => {
      if (error instanceof TypeError) {
        throw new Error(`Could not reach the server: ${error.message}`);
      }

      throw error;
    });
}

import { Course } from "@shared/models/course.model";
import { artemisRequestJson } from "../infra/http/artemis-http.client";

export async function fetchAllCourses(token: string): Promise<Course[]> {
  const data = await artemisRequestJson<any>("/api/core/courses/for-dashboard", { token });

  return (
    data.courses
      ?.map((courseAndScore: any) => {
        const course: Course = courseAndScore.course as Course;
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
}

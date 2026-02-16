import { Course } from "@shared/models/course.model";
import { Exercise } from "@shared/models/exercise.model";
import { Feedback } from "@shared/models/feedback.model";
import { Result } from "@shared/models/result.model";
import { ProgrammingSubmission } from "@shared/models/submission.model";
import { TestCase } from "@shared/models/testcase.model";
import { artemisRequestJson } from "../infra/http/artemis-http.client";
import { fetchResultDetails } from "./participation.client";

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
  const exercise = response.exercise as Exercise;
  exercise.dueDate = exercise.dueDate ? new Date(exercise.dueDate) : undefined;

  const testCasesById = new Map<number, TestCase>();
  const normalizedParticipations = [];
  for (const participation of exercise.studentParticipations ?? []) {
    const normalizedSubmissions: ProgrammingSubmission[] = (participation.submissions ?? []).map(
      (submission: any) => ({
        ...submission,
        submissionDate: submission.submissionDate ? new Date(submission.submissionDate) : undefined,
        results: (submission.results ?? []).map((result: any) => ({
          ...result,
          completionDate: result.completionDate ? new Date(result.completionDate) : undefined,
          submission: undefined,
        })) as Result[],
        participation: undefined,
      }),
    );

    const latestSubmission = getLatestById(normalizedSubmissions);
    const latestResult: Result | undefined = latestSubmission
      ? getLatestById<Result>(latestSubmission.results ?? [])
      : undefined;

    if (latestSubmission) {
      latestSubmission.results = latestResult ? [latestResult] : [];
    }

    if (latestResult?.id && participation.id) {
      const feedbacks: Feedback[] = await fetchResultDetails(
        token,
        participation.id,
        latestResult.id,
      );
      latestResult.feedbacks = feedbacks;
      for (const feedback of feedbacks) {
        const testCase = feedback.testCase;
        if (testCase?.id !== undefined) {
          testCasesById.set(testCase.id, testCase);
        }
      }
    }

    normalizedParticipations.push({
      ...participation,
      submissions: latestSubmission ? [latestSubmission] : [],
      results: undefined,
    });
  }
  exercise.studentParticipations = normalizedParticipations;

  if (testCasesById.size > 0) {
    exercise.testCases = Array.from(testCasesById.values());
  }

  return exercise;
}

// Assumes ids are
function getLatestById<T extends { id?: number }>(items: T[]): T | undefined {
  if (items.length === 0) {
    return undefined;
  }

  return items.reduce((latest, current) => {
    const latestId = latest.id ?? -1;
    const currentId = current.id ?? -1;
    return currentId > latestId ? current : latest;
  });
}

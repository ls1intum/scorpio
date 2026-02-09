import { Feedback } from "@shared/models/feedback.model";
import { StudentParticipation } from "@shared/models/participation.model";
import { artemisRequestJson } from "../infra/http/artemis-http.client";

export async function startExercise(token: string, exerciseId: number): Promise<StudentParticipation> {
  return artemisRequestJson<StudentParticipation>(`/api/exercise/exercises/${exerciseId}/participations`, {
    method: "POST",
    token,
  });
}

export async function fetchParticipationByRepoName(
  token: string,
  repoName: string
): Promise<StudentParticipation> {
  return artemisRequestJson<StudentParticipation>(`/api/programming/programming-exercise-participations`, {
    method: "GET",
    token,
    query: { repoName },
  });
}

export async function fetchResultDetails(
  token: string,
  participationId: number,
  resultId: number
): Promise<Feedback[]> {
  return artemisRequestJson<Feedback[]>(
    `/api/assessment/participations/${participationId}/results/${resultId}/details`,
    { token }
  );
}

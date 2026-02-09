import { Feedback } from "@shared/models/feedback.model";
import { StudentParticipation } from "@shared/models/participation.model";
import { artemisRequestJson } from "../infra/http/artemis-http.client";

export async function start_exercise(token: string, exerciseId: number): Promise<StudentParticipation> {
  return artemisRequestJson<StudentParticipation>(`/api/exercise/exercises/${exerciseId}/participations`, {
    method: "POST",
    token,
  });
}

export async function fetch_participation_by_repo_name(
  token: string,
  repoName: string
): Promise<StudentParticipation> {
  return artemisRequestJson<StudentParticipation>(`/api/programming/programming-exercise-participations`, {
    method: "GET",
    token,
    query: { repoName },
  });
}

export async function fetch_result_details(
  token: string,
  participationId: number,
  resultId: number
): Promise<Feedback[]> {
  return artemisRequestJson<Feedback[]>(
    `/api/assessment/participations/${participationId}/results/${resultId}/details`,
    { token }
  );
}

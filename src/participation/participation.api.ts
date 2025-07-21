import { settings } from "../shared/settings";
import { Feedback } from "@shared/models/feedback.model";
import { StudentParticipation } from "@shared/models/participation.model";

export async function start_exercise(token: string, exerciseId: number): Promise<StudentParticipation> {
  const url = `${settings.base_url}/api/exercise/exercises/${exerciseId}/participations`;

  return fetch(url, {
    method: "POST",
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

      return data as StudentParticipation;
    })
    .catch((error) => {
      if (error instanceof TypeError) {
        throw new Error(`Could not reach the server: ${error.message}`);
      }

      throw error;
    });
}

/**
 *
 * @param token the artemis authentication token
 * @param repoName the repo name of the exercise e.g. pse24w11e01-ge42gak
 * @returns the course plus the exercise with the participation corresponding to the repo name
 */
export async function fetch_participation_by_repo_name(
  token: string,
  repoName: string
): Promise<StudentParticipation> {
  const url = `${settings.base_url}/api/programming/programming-exercise-participations?repoName=${repoName}`;

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

      return (await response.json()) as StudentParticipation;
    })
    .catch((error) => {
      if (error instanceof TypeError) {
        throw new Error(`Could not reach the server: ${error.message}`);
      }

      throw error;
    });
}

export async function fetch_result_details(
  token: string,
  participationId: number,
  resultId: number
): Promise<Feedback[]> {
  const url = `${settings.base_url}/api/assessment/participations/${participationId}/results/${resultId}/details
`;

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

      return (await response.json()) as Feedback[];
    })
    .catch((error) => {
      if (error instanceof TypeError) {
        throw new Error(`Could not reach the server: ${error.message}`);
      }

      throw error;
    });
}

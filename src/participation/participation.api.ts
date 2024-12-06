import { settings } from "../shared/settings";
import { Feedback } from "@shared/models/feedback.model";
import { Participation } from "@shared/models/participation.model";

export async function start_exercise(
  token: string,
  exerciseId: number
): Promise<Participation> {
  const url = `${settings.base_url}/api/exercises/${exerciseId}/participations`;

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
        
        throw new Error(
          `HTTP error! status: ${response.status} message: ${errorText}`
        );
      }

      const data = await response.json();

      return data as Participation;
    })
    .catch((error) => {
      if (error instanceof TypeError) {
        throw new Error(`Could not reach the server: ${error.message}`);
      }

      throw error;
    });
}

export async function fetch_latest_participation(
  token: string,
  exerciseId: number
): Promise<Participation> {
  const url = `${settings.base_url}/api/exercises/${exerciseId}/participation`;

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

      return data as Participation;
    })
    .catch((error) => {
      if (error instanceof TypeError) {
        throw new Error(`Could not reach the server: ${error.message}`);
      }

      throw error;
    });

    
}

export async function fetch_feedback(
  token: string,
  participationId: number,
  resultId: number
): Promise<Feedback[]> {
  const url = `${settings.base_url}/api/participations/${participationId}/results/${resultId}/details`;

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

      return data as Feedback[];
    })
    .catch((error) => {
      if (error instanceof TypeError) {
        throw new Error(`Could not reach the server: ${error.message}`);
      }

      throw error;
    });

    
}

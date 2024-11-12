import { settings } from "../shared/settings";
import { Participation } from "./participation.model";

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
        throw new Error(
          `HTTP error! status: ${response.status} message: ${response.text}`
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
        throw new Error(
          `HTTP error! status: ${response.status} message: ${response.text}`
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

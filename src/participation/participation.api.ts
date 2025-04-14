import { settings } from "../shared/settings";
import { Feedback } from "@shared/models/feedback.model";
import { StudentParticipation } from "@shared/models/participation.model";

export async function start_exercise(
  token: string,
  exerciseId: number
): Promise<StudentParticipation> {
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
        
        throw new Error(
          `HTTP error! status: ${response.status} message: ${errorText}`
        );
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

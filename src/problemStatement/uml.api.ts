import { settings } from "../shared/settings";

export async function fetch_uml(token: string, plantUml: string): Promise<string> {
  // Encode the plantUml string for use as a query parameter
  const encodedPlantUml = encodeURIComponent(plantUml);

  // automatically
  const url = `${settings.base_url}/api/programming/plantuml/svg?plantuml=${encodedPlantUml}&useDarkTheme=true`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "text/plain",
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(`HTTP error! status: ${response.status} message: ${errorText}`);
      }

      const data: string = await response.text();

      return data;
    })
    .catch((error) => {
      if (error instanceof TypeError) {
        throw new Error(`Could not reach the server: ${error.message}`);
      }

      throw error;
    });
}

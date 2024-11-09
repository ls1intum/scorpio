import { settings } from "../shared/config";

export async function authenticateToken(
  username: string,
  password: string
): Promise<{access_token: string}> {
  var url = new URL(`${settings.base_url}/api/public/authenticate`);
  url.searchParams.append("as-bearer", "true");

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      password: password,
      rememberMe: true,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `HTTP error with status: ${response.status} ${response.statusText}`
        );
      }

      return response.json();
    })
    .catch((error) => {
      if (error instanceof TypeError) {
        throw new Error(`Could not reach the server: ${error.message}`);
      }

      throw error;
    });
}

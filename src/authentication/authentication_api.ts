import { settings } from "../shared/settings";

export async function authenticateToken(
  username: string,
  password: string
): Promise<{access_token: string}> {
  const url = new URL(`${settings.base_url}/api/public/authenticate`);
  url.searchParams.append("as-bearer", "true");
  url.searchParams.append("tool", "SCORPIO");

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
    .then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          `HTTP error with status: ${response.status} ${errorText}`
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

export function retrieveVcsAccessToken(token: string, participationId: number,): Promise<string> {
  return getVcsAccessToken(token, participationId, "GET").catch((error) => {
    return getVcsAccessToken(token, participationId, "PUT");
  });
}

function getVcsAccessToken(token: string, participationId: number, method: string): Promise<string> {
  const url = new URL(`${settings.base_url}/api/account/participation-vcs-access-token`);
  url.searchParams.append("participationId", participationId.toString());

  return fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          `HTTP error with status: ${response.status} ${errorText}`
        );
      }

      return response.text();
    })
    .catch((error) => {
      if (error instanceof TypeError) {
        throw new Error(`Could not reach the server: ${error.message}`);
      }

      throw error;
    });
}

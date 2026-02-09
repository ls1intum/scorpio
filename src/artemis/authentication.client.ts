import { artemisRequestText, artemisRequest } from "../infra/http/artemis-http.client";

export async function authenticateToken(username: string, password: string): Promise<{ access_token: string }> {
  const response = await artemisRequest("/api/core/public/authenticate", {
    method: "POST",
    query: { tool: "SCORPIO" },
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
      rememberMe: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error with status: ${response.status} ${errorText}`);
  }

  return response.json();
}

export function retrieveVcsAccessToken(token: string, participationId: number): Promise<string> {
  return getVcsAccessToken(token, participationId, "GET").catch(() => {
    return getVcsAccessToken(token, participationId, "PUT");
  });
}

function getVcsAccessToken(token: string, participationId: number, method: "GET" | "PUT"): Promise<string> {
  return artemisRequestText("/api/core/account/participation-vcs-access-token", {
    method,
    token,
    headers: {
      "Content-Type": "application/json",
    },
    query: {
      participationId,
    },
  });
}

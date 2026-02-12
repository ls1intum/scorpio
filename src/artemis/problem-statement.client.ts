import { artemisRequestText } from "../infra/http/artemis-http.client";

export async function fetchUml(
  token: string,
  plantUml: string,
  useDarkTheme: boolean = false,
): Promise<string> {
  return artemisRequestText("/api/programming/plantuml/svg", {
    token,
    headers: {
      "Content-Type": "text/plain",
    },
    query: {
      plantuml: plantUml,
      useDarkTheme,
    },
  });
}

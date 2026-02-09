import { artemisRequestText } from "../infra/http/artemis-http.client";

export async function fetch_uml(token: string, plantUml: string, useDarkTheme: boolean = false): Promise<string> {
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

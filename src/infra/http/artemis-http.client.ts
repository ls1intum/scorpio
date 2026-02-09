import { settings } from "../../shared/settings";

type QueryValue = string | number | boolean | undefined;

type ArtemisRequestOptions = {
  method?: string;
  token?: string;
  body?: BodyInit | null;
  query?: Record<string, QueryValue>;
  headers?: Record<string, string>;
};

function buildUrl(path: string, query?: Record<string, QueryValue>): URL {
  if (!settings.base_url) {
    throw new Error("Base URL is not set");
  }

  const url = new URL(path, settings.base_url);
  if (!query) return url;
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      url.searchParams.append(key, String(value));
    }
  }
  return url;
}

export async function artemisRequest(path: string, options: ArtemisRequestOptions = {}): Promise<Response> {
  const headers: Record<string, string> = { ...options.headers };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const url = buildUrl(path, options.query);

  return fetch(url, {
    method: options.method ?? "GET",
    headers,
    body: options.body ?? undefined,
  });
}

export async function artemisRequestJson<T>(path: string, options: ArtemisRequestOptions = {}): Promise<T> {
  const response = await artemisRequest(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status} message: ${errorText}`);
  }

  return (await response.json()) as T;
}

export async function artemisRequestText(path: string, options: ArtemisRequestOptions = {}): Promise<string> {
  const response = await artemisRequest(path, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status} message: ${errorText}`);
  }

  return response.text();
}

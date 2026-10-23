/**
 * Pure helpers for GitHub repositories, scopes and identities.
 */

import type { GitHubConfig } from "./config";

export type RepoRef = { owner: string; repo: string };

export type Scope = "public_repo" | "repo";

/** `owner/repo` of a GitHub remote URL on the configured host, or undefined for any other URL. */
export function parseRepoFromUrl(
  url: string | undefined,
  config: GitHubConfig,
): RepoRef | undefined {
  if (!url) {
    return undefined;
  }
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }
  if (parsed.host.toLowerCase() !== config.host) {
    return undefined;
  }
  const match =
    /^\/([A-Za-z0-9](?:[A-Za-z0-9-]{0,38}))\/([A-Za-z0-9._-]{1,100}?)(?:\.git)?\/?$/.exec(
      parsed.pathname,
    );
  if (!match || match[2] === "." || match[2] === "..") {
    return undefined;
  }
  return { owner: match[1], repo: match[2] };
}

/** `repo` includes everything `public_repo` grants. */
export function hasScope(granted: readonly string[], needed: Scope): boolean {
  return granted.includes("repo") || (needed === "public_repo" && granted.includes("public_repo"));
}

export function parseScopes(scope: string | undefined): string[] {
  return (scope ?? "")
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export type GitHubUser = { id: number; login: string; name?: string | null };

/**
 * The commit identity for a GitHub user. GitHub attributes the noreply address to the account, so the real email
 * address is never needed.
 */
export function gitHubIdentity(user: GitHubUser): { name: string; email: string } {
  return {
    name: user.name?.trim() || user.login,
    email: `${user.id}+${user.login}@users.noreply.github.com`,
  };
}

/** Scorpio's fallback identity, `<pod hostname>@artemis-theia.de`, used when no Artemis identity was given. */
export function isSessionIdentity(email: string): boolean {
  return email.trim().toLowerCase().endsWith("@artemis-theia.de");
}

/** Link to open a pull request from `forkOwner:branch` into the upstream repository. */
export function compareUrl(
  config: GitHubConfig,
  upstream: RepoRef,
  baseBranch: string,
  forkOwner: string,
  branch: string,
): string {
  const head = `${encodeURIComponent(forkOwner)}:${encodeURIComponent(branch)}`;
  return `${config.webOrigin}/${upstream.owner}/${upstream.repo}/compare/${encodeURIComponent(baseBranch)}...${head}?expand=1`;
}

/** A remote name that does not clash with the existing ones: `preferred`, else `preferred-2`, `preferred-3`, ... */
export function freeRemoteName(preferred: string, existing: readonly string[]): string {
  if (!existing.includes(preferred)) {
    return preferred;
  }
  for (let i = 2; ; i++) {
    const candidate = `${preferred}-${i}`;
    if (!existing.includes(candidate)) {
      return candidate;
    }
  }
}

/** Whether two remote URLs point at the same repository, ignoring credentials, case of the host and `.git`. */
export function sameRepository(a: string | undefined, b: string | undefined): boolean {
  const normalize = (url: string | undefined) => {
    if (!url) {
      return undefined;
    }
    try {
      const parsed = new URL(url);
      return `${parsed.host.toLowerCase()}${parsed.pathname.replace(/\.git\/?$/, "").replace(/\/+$/, "")}`;
    } catch {
      return url;
    }
  };
  const left = normalize(a);
  return left !== undefined && left === normalize(b);
}

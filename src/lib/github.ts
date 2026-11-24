import { GitHubUser } from "./session";

export interface GitHubAccountItem {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  type: string;
  site_admin: boolean;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}

export interface SyncResult {
  user: GitHubUser;
  totalFollowers: number;
  totalFollowing: number;
  notFollowingBack: GitHubAccountItem[];
  followBackCandidates: GitHubAccountItem[];
  rateLimit: RateLimitInfo | null;
  syncedAt: string;
}

const GITHUB_API_BASE = "https://api.github.com";

export class GitHubAPIError extends Error {
  status: number;
  rateLimit?: RateLimitInfo;

  constructor(message: string, status: number, rateLimit?: RateLimitInfo) {
    super(message);
    this.name = "GitHubAPIError";
    this.status = status;
    this.rateLimit = rateLimit;
  }
}

/**
 * Extract rate limit information from GitHub response headers
 */
export function extractRateLimit(headers: Headers): RateLimitInfo | null {
  const limit = headers.get("x-ratelimit-limit");
  const remaining = headers.get("x-ratelimit-remaining");
  const reset = headers.get("x-ratelimit-reset");
  const used = headers.get("x-ratelimit-used");

  if (!limit || !remaining || !reset) return null;

  return {
    limit: parseInt(limit, 10),
    remaining: parseInt(remaining, 10),
    reset: parseInt(reset, 10),
    used: used ? parseInt(used, 10) : 0,
  };
}

/**
 * Fetch authenticated user info
 */
export async function fetchAuthenticatedUser(token: string): Promise<{
  user: GitHubUser;
  rateLimit: RateLimitInfo | null;
}> {
  const res = await fetch(`${GITHUB_API_BASE}/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "GitHub-Social-Manager",
    },
    cache: "no-store",
  });

  const rateLimit = extractRateLimit(res.headers);

  if (!res.ok) {
    const errorBody = await res.text();
    let message = `GitHub API error: ${res.status} ${res.statusText}`;
    try {
      const parsed = JSON.parse(errorBody);
      if (parsed.message) message = parsed.message;
    } catch {
      // ignore json parse error
    }
    throw new GitHubAPIError(message, res.status, rateLimit || undefined);
  }

  const user: GitHubUser = await res.json();
  return { user, rateLimit };
}

/**
 * Fetch all items across pages for followers or following
 */
export async function fetchAllUserList(
  token: string,
  endpoint: "followers" | "following",
  maxPages: number = 30 // 30 pages * 100 = 3,000 accounts safe ceiling
): Promise<{ items: GitHubAccountItem[]; rateLimit: RateLimitInfo | null }> {
  const items: GitHubAccountItem[] = [];
  let page = 1;
  let lastRateLimit: RateLimitInfo | null = null;

  while (page <= maxPages) {
    const url = `${GITHUB_API_BASE}/user/${endpoint}?per_page=100&page=${page}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "GitHub-Social-Manager",
      },
      cache: "no-store",
    });

    lastRateLimit = extractRateLimit(res.headers);

    if (!res.ok) {
      const errText = await res.text();
      let msg = `Failed to fetch ${endpoint} (page ${page}): ${res.status}`;
      try {
        const json = JSON.parse(errText);
        if (json.message) msg = json.message;
      } catch {
        // ignore
      }
      throw new GitHubAPIError(msg, res.status, lastRateLimit || undefined);
    }

    const pageData: GitHubAccountItem[] = await res.json();
    if (!Array.isArray(pageData) || pageData.length === 0) {
      break;
    }

    items.push(...pageData);

    // If less than 100 returned, we reached the end of the list
    if (pageData.length < 100) {
      break;
    }

    page++;
  }

  return { items, rateLimit: lastRateLimit };
}

/**
 * Follow a user (PUT /user/following/{username})
 */
export async function followUser(
  token: string,
  username: string
): Promise<{ success: boolean; rateLimit: RateLimitInfo | null }> {
  const res = await fetch(`${GITHUB_API_BASE}/user/following/${encodeURIComponent(username)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "GitHub-Social-Manager",
      "Content-Length": "0",
    },
    cache: "no-store",
  });

  const rateLimit = extractRateLimit(res.headers);

  if (!res.ok && res.status !== 204) {
    const errText = await res.text();
    let msg = `Failed to follow ${username}: status ${res.status}`;
    try {
      const json = JSON.parse(errText);
      if (json.message) msg = json.message;
    } catch {
      // ignore
    }
    throw new GitHubAPIError(msg, res.status, rateLimit || undefined);
  }

  return { success: true, rateLimit };
}

/**
 * Unfollow a user (DELETE /user/following/{username})
 */
export async function unfollowUser(
  token: string,
  username: string
): Promise<{ success: boolean; rateLimit: RateLimitInfo | null }> {
  const res = await fetch(`${GITHUB_API_BASE}/user/following/${encodeURIComponent(username)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "GitHub-Social-Manager",
    },
    cache: "no-store",
  });

  const rateLimit = extractRateLimit(res.headers);

  if (!res.ok && res.status !== 204) {
    const errText = await res.text();
    let msg = `Failed to unfollow ${username}: status ${res.status}`;
    try {
      const json = JSON.parse(errText);
      if (json.message) msg = json.message;
    } catch {
      // ignore
    }
    throw new GitHubAPIError(msg, res.status, rateLimit || undefined);
  }

  return { success: true, rateLimit };
}

/**
 * Check rate limit
 */
export async function fetchRateLimit(token: string): Promise<RateLimitInfo | null> {
  const res = await fetch(`${GITHUB_API_BASE}/rate_limit`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "GitHub-Social-Manager",
    },
    cache: "no-store",
  });

  if (!res.ok) return null;

  try {
    const data = await res.json();
    return {
      limit: data.rate.limit,
      remaining: data.rate.remaining,
      reset: data.rate.reset,
      used: data.rate.used,
    };
  } catch {
    return extractRateLimit(res.headers);
  }
}

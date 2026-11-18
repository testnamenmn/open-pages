/**
 * GitHub public-data helpers (no login, no token): runs in the owner's browser.
 * Unauthenticated limit is 60 requests/hour per IP, so a full sync uses at most ~7 requests.
 *
 * NOTE: the public contribution graph needs authentication, so we use public *events*:
 *  - "pushes" = number of public PushEvents per day (we deliberately do not rely on commit
 *    counts in the payload; GitHub has been trimming PushEvent payloads)
 *  - "active days" = days with a public push, pull request, review or issue event
 * The events API only reaches back ~90 days / 300 events.
 */

export type GithubErrorCode = 'not_found' | 'rate_limited' | 'network' | 'http';

export class GithubError extends Error {
  constructor(public code: GithubErrorCode, message: string, public resetAt?: Date) {
    super(message);
  }
}

export interface GithubEvent {
  type: string;
  created_at: string;
}

export interface GithubSnapshot {
  followers: number;
  repos: number;
  stars: number;
  events: GithubEvent[];
  eventsTruncated: boolean; // hit the 300-event cap, so older days are incomplete
}

const USERNAME_RE = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;

/** Accepts "octocat", "@octocat" or "https://github.com/octocat". Returns null if invalid. */
export function parseUsername(input: string): string | null {
  let s = input.trim();
  s = s.replace(/^https?:\/\/(www\.)?github\.com\//i, '').replace(/^@/, '').replace(/[/?#].*$/, '');
  return USERNAME_RE.test(s) ? s : null;
}

const API = 'https://api.github.com';

async function getJson<T>(url: string, fetchImpl: typeof fetch): Promise<T> {
  let res: Response;
  try {
    res = await fetchImpl(url, { headers: { Accept: 'application/vnd.github+json' } });
  } catch {
    throw new GithubError('network', 'Could not reach GitHub. Check your connection and try again.');
  }
  if (res.status === 404) throw new GithubError('not_found', 'That GitHub user was not found.');
  if (res.status === 403 || res.status === 429) {
    const reset = Number(res.headers.get('x-ratelimit-reset'));
    const resetAt = reset ? new Date(reset * 1000) : undefined;
    const when = resetAt ? ` Try again after ${resetAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.` : ' Try again later.';
    throw new GithubError('rate_limited', `GitHub's free request limit was reached.${when}`, resetAt);
  }
  if (!res.ok) throw new GithubError('http', `GitHub returned an error (${res.status}).`);
  return (await res.json()) as T;
}

export async function fetchGithubSnapshot(username: string, fetchImpl: typeof fetch = fetch): Promise<GithubSnapshot> {
  const u = encodeURIComponent(username);
  const user = await getJson<{ followers: number; public_repos: number }>(`${API}/users/${u}`, fetchImpl);

  // Stars across the user's own public repos (up to 300 repos).
  let stars = 0;
  for (let page = 1; page <= 3; page++) {
    const repos = await getJson<{ stargazers_count: number }[]>(`${API}/users/${u}/repos?type=owner&per_page=100&page=${page}`, fetchImpl);
    stars += repos.reduce((n, r) => n + (r.stargazers_count || 0), 0);
    if (repos.length < 100) break;
  }

  // Public events: up to 3 pages of 100 (GitHub caps this endpoint at 300 events / 90 days).
  const events: GithubEvent[] = [];
  let truncated = false;
  for (let page = 1; page <= 3; page++) {
    const batch = await getJson<GithubEvent[]>(`${API}/users/${u}/events/public?per_page=100&page=${page}`, fetchImpl);
    events.push(...batch.map((e) => ({ type: e.type, created_at: e.created_at })));
    if (batch.length < 100) break;
    if (page === 3) truncated = true;
  }

  return { followers: user.followers ?? 0, repos: user.public_repos ?? 0, stars, events, eventsTruncated: truncated };
}

// --- Events → daily numbers ---------------------------------------------------------------

const ACTIVE_TYPES = new Set(['PushEvent', 'PullRequestEvent', 'PullRequestReviewEvent', 'IssuesEvent']);
const DAY_MS = 86_400_000;
const utcDay = (d: Date) => d.toISOString().slice(0, 10);

export interface DailyBuckets {
  /** First UTC day (YYYY-MM-DD) we have complete data for. */
  sinceDay: string;
  pushes: { day: string; count: number }[]; // every day from sinceDay to today, zeros included
  activeDays: string[]; // days with any contribution-like event
}

export function bucketEvents(events: GithubEvent[], truncated: boolean, now: Date = new Date()): DailyBuckets {
  const today = utcDay(now);
  let since = utcDay(new Date(now.getTime() - 89 * DAY_MS)); // events API reaches back ~90 days
  if (truncated && events.length > 0) {
    // The oldest returned day may be partially cut off: start from the day after it.
    const oldest = events.reduce((m, e) => (e.created_at < m ? e.created_at : m), events[0].created_at);
    const afterOldest = utcDay(new Date(new Date(oldest).getTime() + DAY_MS));
    if (afterOldest > since) since = afterOldest;
  }

  const pushCount = new Map<string, number>();
  const active = new Set<string>();
  for (const e of events) {
    const day = e.created_at.slice(0, 10);
    if (day < since || day > today) continue;
    if (e.type === 'PushEvent') pushCount.set(day, (pushCount.get(day) ?? 0) + 1);
    if (ACTIVE_TYPES.has(e.type)) active.add(day);
  }

  const pushes: { day: string; count: number }[] = [];
  for (let t = new Date(`${since}T00:00:00Z`).getTime(); utcDay(new Date(t)) <= today; t += DAY_MS) {
    const day = utcDay(new Date(t));
    pushes.push({ day, count: pushCount.get(day) ?? 0 });
  }
  return { sinceDay: since, pushes, activeDays: [...active].sort() };
}

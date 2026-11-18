import { metricsApi } from './metricsApi';
import { bucketEvents, fetchGithubSnapshot, GithubSnapshot, parseUsername } from './github';
import type { GithubStat, MetricKind, MetricSeries, SeriesMap } from '../types/metrics';

export interface GithubMetricDef {
  stat: GithubStat;
  key: string;
  label: string;
  kind: MetricKind;
  unit: string;
}

export const GITHUB_METRICS: GithubMetricDef[] = [
  { stat: 'pushes', key: 'github-pushes', label: 'GitHub pushes', kind: 'number', unit: 'pushes' },
  { stat: 'active_days', key: 'github-active-days', label: 'GitHub active days', kind: 'checkin', unit: '' },
  { stat: 'followers', key: 'github-followers', label: 'GitHub followers', kind: 'number', unit: '' },
  { stat: 'stars', key: 'github-stars', label: 'GitHub stars', kind: 'number', unit: 'stars' },
  { stat: 'repos', key: 'github-repos', label: 'GitHub public repos', kind: 'number', unit: 'repos' },
];

/** Re-sync automatically when opening Metrics if the data is older than this. */
export const STALE_MS = 6 * 60 * 60 * 1000;
/** Minimum gap between manual syncs (protects GitHub's 60 requests/hour free limit). */
export const MIN_MANUAL_GAP_MS = 2 * 60 * 1000;

export const githubSeries = (series: SeriesMap): MetricSeries[] => Object.values(series).filter((m) => m.source === 'github');
export const githubUsername = (series: SeriesMap): string | null => githubSeries(series)[0]?.sourceRef ?? null;

export function lastSyncedAt(series: SeriesMap): number | null {
  const times = githubSeries(series).map((m) => (m.syncedAt ? new Date(m.syncedAt).getTime() : 0));
  return times.length && times.every((t) => t > 0) ? Math.min(...times) : null;
}

export const isStale = (series: SeriesMap, now = Date.now()): boolean => {
  if (githubSeries(series).length === 0) return false;
  const last = lastSyncedAt(series);
  return last === null || now - last > STALE_MS;
};

interface Target {
  id: string;
  stat: GithubStat;
}

/** Makes sure the five GitHub metrics exist for this page; returns their ids. */
async function ensureMetrics(pageId: string, username: string, series: SeriesMap): Promise<Target[]> {
  const targets: Target[] = [];
  for (const def of GITHUB_METRICS) {
    const existing = series[def.key];
    if (existing) {
      if (existing.source !== 'github') {
        throw new Error(`You already have a manual metric called “${existing.label}” (${def.key}). Rename or delete it, then connect GitHub.`);
      }
      targets.push({ id: existing.id, stat: def.stat });
      continue;
    }
    const created = await metricsApi.createMetric({
      pageId,
      key: def.key,
      label: def.label,
      kind: def.kind,
      unit: def.unit,
      source: 'github',
      sourceRef: username,
      sourceStat: def.stat,
    });
    targets.push({ id: created.id, stat: def.stat });
  }
  return targets;
}

async function applySnapshot(targets: Target[], snap: GithubSnapshot, now = new Date()): Promise<void> {
  const buckets = bucketEvents(snap.events, snap.eventsTruncated, now);
  const since = `${buckets.sinceDay}T00:00:00Z`;
  for (const t of targets) {
    switch (t.stat) {
      case 'pushes':
        await metricsApi.syncPoints(t.id, 'replace', since, buckets.pushes.map((p) => ({ ts: `${p.day}T12:00:00Z`, value: p.count })));
        break;
      case 'active_days':
        await metricsApi.syncPoints(t.id, 'replace', since, buckets.activeDays.map((day) => ({ ts: `${day}T12:00:00Z`, value: 1 })));
        break;
      case 'followers':
        await metricsApi.syncPoints(t.id, 'snapshot', null, [{ value: snap.followers }]);
        break;
      case 'stars':
        await metricsApi.syncPoints(t.id, 'snapshot', null, [{ value: snap.stars }]);
        break;
      case 'repos':
        await metricsApi.syncPoints(t.id, 'snapshot', null, [{ value: snap.repos }]);
        break;
    }
  }
}

/** Validates the username with GitHub first, so nothing is created for a typo. */
export async function connectGithub(pageId: string, rawUsername: string, series: SeriesMap): Promise<string> {
  const username = parseUsername(rawUsername);
  if (!username) throw new Error('Enter a GitHub username, like octocat, or a profile link.');
  const snap = await fetchGithubSnapshot(username);
  const targets = await ensureMetrics(pageId, username, series);
  await applySnapshot(targets, snap);
  return username;
}

export async function syncGithub(pageId: string, series: SeriesMap): Promise<void> {
  const username = githubUsername(series);
  if (!username) throw new Error('GitHub is not connected.');
  const snap = await fetchGithubSnapshot(username);
  const targets = await ensureMetrics(pageId, username, series);
  await applySnapshot(targets, snap);
}

/** Removes the GitHub metrics (and their history) from the page. */
export async function disconnectGithub(series: SeriesMap): Promise<void> {
  for (const m of githubSeries(series)) await metricsApi.deleteMetric(m.id);
}

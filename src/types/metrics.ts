export type MetricKind = 'number' | 'checkin';

export interface MetricPoint {
  id?: number;
  ts: string; // ISO timestamp
  value: number;
}

export type MetricSource = 'manual' | 'github';
export type GithubStat = 'pushes' | 'active_days' | 'followers' | 'stars' | 'repos';

export interface Metric {
  id: string;
  pageId: string;
  key: string;
  label: string;
  kind: MetricKind;
  unit: string;
  /** Where the data comes from. Absent/'manual' = typed in by the owner. */
  source?: MetricSource;
  /** For source 'github': the GitHub username. */
  sourceRef?: string | null;
  sourceStat?: GithubStat | null;
  syncedAt?: string | null;
}

/** A metric together with its points, sorted oldest → newest. */
export interface MetricSeries extends Metric {
  points: MetricPoint[];
}

export type SeriesMap = Record<string, MetricSeries>; // keyed by metric key

export const slugifyKey = (label: string): string =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

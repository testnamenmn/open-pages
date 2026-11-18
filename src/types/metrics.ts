export type MetricKind = 'number' | 'checkin';

export interface MetricPoint {
  id?: number;
  ts: string; // ISO timestamp
  value: number;
}

export interface Metric {
  id: string;
  pageId: string;
  key: string;
  label: string;
  kind: MetricKind;
  unit: string;
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

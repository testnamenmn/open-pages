import type { MetricPoint, MetricSeries } from '../types/metrics';

const DAY_MS = 86_400_000;

/** Local calendar day key (YYYY-MM-DD) so check-ins land on the viewer's "today". */
export const dayKey = (d: Date | string): string => {
  const date = typeof d === 'string' ? new Date(d) : d;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const latest = (s?: MetricSeries): MetricPoint | undefined => s?.points[s.points.length - 1];

/** 'up' | 'down' | 'neutral' comparing the last two points. */
export const trend = (s?: MetricSeries): 'up' | 'down' | 'neutral' => {
  if (!s || s.points.length < 2) return 'neutral';
  const [prev, last] = s.points.slice(-2);
  return last.value > prev.value ? 'up' : last.value < prev.value ? 'down' : 'neutral';
};

/** Set of local day keys that have at least one check-in. */
export const checkinDays = (s?: MetricSeries): Set<string> =>
  new Set((s?.points ?? []).filter((p) => p.value > 0).map((p) => dayKey(p.ts)));

/**
 * Current streak in days. A streak stays alive if you checked in today OR yesterday
 * (so it doesn't read 0 before you've had a chance to log today).
 */
export const currentStreak = (s?: MetricSeries, now: Date = new Date()): number => {
  const days = checkinDays(s);
  let cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!days.has(dayKey(cursor))) cursor = new Date(cursor.getTime() - DAY_MS);
  let count = 0;
  while (days.has(dayKey(cursor))) {
    count++;
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1);
  }
  return count;
};

/** Last `n` days (oldest → newest) flagged true if checked in. */
export const lastDays = (s: MetricSeries | undefined, n: number, now: Date = new Date()) => {
  const days = checkinDays(s);
  const out: { day: string; done: boolean }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    out.push({ day: dayKey(d), done: days.has(dayKey(d)) });
  }
  return out;
};

export type Range = '30d' | '90d' | 'all';

/** Chart rows for a number metric within a range. */
export const chartRows = (s: MetricSeries | undefined, range: Range = '30d', now: Date = new Date()) => {
  if (!s) return [];
  const cutoff = range === 'all' ? 0 : now.getTime() - (range === '30d' ? 30 : 90) * DAY_MS;
  return s.points
    .filter((p) => new Date(p.ts).getTime() >= cutoff)
    .map((p) => ({ ts: p.ts, label: dayKey(p.ts).slice(5), value: p.value }));
};

export const formatValue = (n: number): string =>
  Math.abs(n) >= 1000 ? n.toLocaleString() : String(Math.round(n * 100) / 100);

export const timeAgo = (iso: string, now: Date = new Date()): string => {
  const mins = Math.round((now.getTime() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)}h ago`;
  return `${Math.round(mins / 1440)}d ago`;
};

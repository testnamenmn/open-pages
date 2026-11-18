import { supabase } from '../lib/supabase';
import type { GithubStat, Metric, MetricKind, MetricPoint, MetricSeries, MetricSource, SeriesMap } from '../types/metrics';

/** Newest points kept per metric when loading a page (keeps public pages fast). */
const POINTS_PER_METRIC = 400;

interface MetricRow {
  id: string;
  page_id: string;
  key: string;
  label: string;
  kind: MetricKind;
  unit: string;
  source?: MetricSource;
  source_ref?: string | null;
  source_stat?: GithubStat | null;
  synced_at?: string | null;
}

const BASE_COLS = 'id,page_id,key,label,kind,unit';
const SOURCE_COLS = 'source,source_ref,source_stat,synced_at';
interface PointRow {
  id: number;
  ts: string;
  value: number;
}

const toMetric = (r: MetricRow): Metric => ({
  id: r.id,
  pageId: r.page_id,
  key: r.key,
  label: r.label,
  kind: r.kind,
  unit: r.unit,
  source: r.source ?? 'manual',
  sourceRef: r.source_ref ?? null,
  sourceStat: r.source_stat ?? null,
  syncedAt: r.synced_at ?? null,
});

const toPoint = (r: PointRow): MetricPoint => ({ id: r.id, ts: r.ts, value: Number(r.value) });

export const metricsApi = {
  /** All metrics of a page with their points (works for logged-out visitors on public pages). */
  async loadSeries(pageId: string): Promise<SeriesMap> {
    if (!supabase) return {};
    const query = (cols: string) =>
      supabase!
        .from('metrics')
        .select(`${cols},metric_points(id,ts,value)`)
        .eq('page_id', pageId)
        .order('ts', { referencedTable: 'metric_points', ascending: false })
        .limit(POINTS_PER_METRIC, { referencedTable: 'metric_points' });

    let { data, error } = await query(`${BASE_COLS},${SOURCE_COLS}`);
    // Migration 0004 (source columns) not applied yet? Fall back so existing pages keep working.
    if (error && (error.code === '42703' || /column .* does not exist|schema cache/i.test(error.message))) {
      ({ data, error } = await query(BASE_COLS));
    }
    if (error) throw error;

    const map: SeriesMap = {};
    for (const row of (data ?? []) as unknown as (MetricRow & { metric_points: PointRow[] })[]) {
      const series: MetricSeries = {
        ...toMetric(row),
        points: row.metric_points.map(toPoint).reverse(), // oldest → newest
      };
      map[series.key] = series;
    }
    return map;
  },

  async createMetric(input: {
    pageId: string;
    key: string;
    label: string;
    kind: MetricKind;
    unit: string;
    source?: MetricSource;
    sourceRef?: string;
    sourceStat?: GithubStat;
  }): Promise<Metric> {
    if (!supabase) throw new Error('Supabase is not configured');
    const row: Record<string, unknown> = { page_id: input.pageId, key: input.key, label: input.label, kind: input.kind, unit: input.unit };
    if (input.source && input.source !== 'manual') {
      row.source = input.source;
      row.source_ref = input.sourceRef;
      row.source_stat = input.sourceStat;
    }
    const { data, error } = await supabase
      .from('metrics')
      .insert(row)
      .select(`${BASE_COLS},${SOURCE_COLS}`)
      .single();
    if (error) {
      if (error.code === '23505') throw new Error('You already have a metric with that name.');
      throw new Error(error.message);
    }
    return toMetric(data as MetricRow);
  },

  /** Writes GitHub-synced points through the sync_metric_points() database function. */
  async syncPoints(metricId: string, mode: 'replace' | 'snapshot', since: string | null, points: { ts?: string; value: number }[]): Promise<void> {
    if (!supabase) throw new Error('Supabase is not configured');
    const { error } = await supabase.rpc('sync_metric_points', { p_metric: metricId, p_mode: mode, p_since: since, p_points: points });
    if (error) {
      if (/sync_metric_points|function/i.test(error.message) && /not exist|schema cache|find/i.test(error.message)) {
        throw new Error('GitHub sync needs database update 0004. Run supabase/migrations/0004_github_source.sql in Supabase.');
      }
      throw new Error(error.message);
    }
  },

  async deleteMetric(metricId: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('metrics').delete().eq('id', metricId);
    if (error) throw new Error(error.message);
  },

  async logPoint(metricId: string, value: number, ts?: Date): Promise<MetricPoint> {
    if (!supabase) throw new Error('Supabase is not configured');
    const { data, error } = await supabase
      .from('metric_points')
      .insert({ metric_id: metricId, value, ...(ts ? { ts: ts.toISOString() } : {}) })
      .select('id,ts,value')
      .single();
    if (error) throw new Error(error.message);
    return toPoint(data as PointRow);
  },

  async deletePoint(pointId: number): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('metric_points').delete().eq('id', pointId);
    if (error) throw new Error(error.message);
  },
};

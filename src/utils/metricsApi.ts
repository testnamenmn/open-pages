import { supabase } from '../lib/supabase';
import type { Metric, MetricKind, MetricPoint, MetricSeries, SeriesMap } from '../types/metrics';

/** Newest points kept per metric when loading a page (keeps public pages fast). */
const POINTS_PER_METRIC = 400;

interface MetricRow {
  id: string;
  page_id: string;
  key: string;
  label: string;
  kind: MetricKind;
  unit: string;
}
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
});

const toPoint = (r: PointRow): MetricPoint => ({ id: r.id, ts: r.ts, value: Number(r.value) });

export const metricsApi = {
  /** All metrics of a page with their points (works for logged-out visitors on public pages). */
  async loadSeries(pageId: string): Promise<SeriesMap> {
    if (!supabase) return {};
    const { data, error } = await supabase
      .from('metrics')
      .select('id,page_id,key,label,kind,unit,metric_points(id,ts,value)')
      .eq('page_id', pageId)
      .order('ts', { referencedTable: 'metric_points', ascending: false })
      .limit(POINTS_PER_METRIC, { referencedTable: 'metric_points' });
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

  async createMetric(input: { pageId: string; key: string; label: string; kind: MetricKind; unit: string }): Promise<Metric> {
    if (!supabase) throw new Error('Supabase is not configured');
    const { data, error } = await supabase
      .from('metrics')
      .insert({ page_id: input.pageId, key: input.key, label: input.label, kind: input.kind, unit: input.unit })
      .select('id,page_id,key,label,kind,unit')
      .single();
    if (error) {
      if (error.code === '23505') throw new Error('You already have a metric with that name.');
      throw new Error(error.message);
    }
    return toMetric(data as MetricRow);
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

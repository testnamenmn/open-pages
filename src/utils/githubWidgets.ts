import { v4 as uuid } from 'uuid';
import { widgetSchemas, WidgetInstance, WidgetType } from '../types/schema';
import type { SeriesMap } from '../types/metrics';

interface Def {
  metricKey: string;
  type: WidgetType;
  config: Record<string, unknown>;
}

/** The starter set of widgets for a connected GitHub account, in display order. */
const GITHUB_WIDGET_DEFS: Def[] = [
  { metricKey: 'github-active-days', type: 'streak', config: { title: 'Coding streak', unit: 'days', color: '#51cf66' } },
  { metricKey: 'github-pushes', type: 'chart_bar', config: { title: 'Pushes per day', unit: 'pushes', color: '#748ffc' } },
  { metricKey: 'github-followers', type: 'stat_number', config: { title: 'GitHub followers', color: '#22b8cf' } },
  { metricKey: 'github-stars', type: 'counter', config: { title: 'GitHub stars', unit: 'stars', color: '#fcc419' } },
  { metricKey: 'github-repos', type: 'counter', config: { title: 'Public repos', unit: 'repos', color: '#845ef7' } },
];

/**
 * Widgets to append so the page shows the user's GitHub metrics. Skips metrics that do not exist
 * yet and any metric already linked by an existing widget, so running it twice never duplicates.
 */
export function missingGithubWidgets(existing: WidgetInstance[], series: SeriesMap): WidgetInstance[] {
  const linked = new Set(existing.map((w) => w.config.metricKey).filter((k): k is string => typeof k === 'string'));
  const out: WidgetInstance[] = [];
  for (const def of GITHUB_WIDGET_DEFS) {
    if (series[def.metricKey]?.source !== 'github' || linked.has(def.metricKey)) continue;
    const n = existing.length + out.length;
    out.push({
      id: `widget_${uuid()}`,
      type: def.type,
      config: { ...widgetSchemas[def.type].defaultConfig, ...def.config, metricKey: def.metricKey },
      position: { x: n % 3, y: Math.floor(n / 3) },
      size: { w: 1, h: 1 },
    });
  }
  return out;
}

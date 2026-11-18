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

// --- Linking template widgets ---------------------------------------------------------------

/** Which GitHub metric a template widget (connector 'github') is meant to show, if any. */
function matchTemplateWidget(w: WidgetInstance): string | null {
  if (w.connector !== 'github') return null;
  const title = String(w.config.title ?? '');
  if (w.type === 'streak') return 'github-active-days';
  if (w.type === 'chart_bar' || w.type === 'chart_line') return 'github-pushes';
  if (w.type === 'stat_number' || w.type === 'counter') {
    if (/repo/i.test(title)) return 'github-repos';
    if (/follow/i.test(title)) return 'github-followers';
    if (/star/i.test(title)) return 'github-stars';
  }
  return null;
}

export interface GithubPlan {
  widgets: WidgetInstance[];
  /** Template widgets that were switched to real GitHub data. */
  linked: number;
  /** Brand-new widgets appended for metrics nothing showed yet. */
  added: number;
}

/**
 * Makes a page show the user's GitHub data without duplicates:
 *  1. template widgets meant for GitHub (streak, commits chart, repos...) are linked in place,
 *     which also clears their sample-data placeholders;
 *  2. any GitHub metric still not shown gets a new widget.
 * Running it again changes nothing.
 */
export function applyGithubWidgets(existing: WidgetInstance[], series: SeriesMap): GithubPlan {
  const taken = new Set(existing.map((w) => w.config.metricKey).filter((k): k is string => typeof k === 'string' && !!k));
  let linked = 0;
  const updated = existing.map((w) => {
    if (typeof w.config.metricKey === 'string' && w.config.metricKey) return w;
    const key = matchTemplateWidget(w);
    if (!key || taken.has(key) || series[key]?.source !== 'github') return w;
    taken.add(key);
    linked++;
    const config: Record<string, unknown> = { ...w.config, metricKey: key, sample: false };
    if (key === 'github-pushes') {
      config.unit = 'pushes';
      if (config.title === 'Monthly Commits') config.title = 'Pushes per day'; // data is pushes/day, not commits/month
    }
    return { ...w, config };
  });
  const extra = missingGithubWidgets(updated, series);
  return { widgets: [...updated, ...extra], linked, added: extra.length };
}

export function describePlan(plan: Pick<GithubPlan, 'linked' | 'added'>): string {
  const parts: string[] = [];
  if (plan.linked) parts.push(`linked ${plan.linked} template widget${plan.linked === 1 ? '' : 's'} to your GitHub data`);
  if (plan.added) parts.push(`added ${plan.added} new widget${plan.added === 1 ? '' : 's'}`);
  const s = parts.join(' and ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

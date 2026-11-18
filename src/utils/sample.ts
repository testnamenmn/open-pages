import type { WidgetInstance, WidgetType } from '../types/schema';

/** Widget types whose template config contains placeholder numbers. */
export const SAMPLE_TYPES: ReadonlySet<WidgetType> = new Set<WidgetType>(['streak', 'counter', 'progress', 'stat_number']);

/**
 * True when a widget still shows a template's placeholder numbers instead of real data.
 *  - Never for widgets linked to a metric (they show live data or an empty state).
 *  - Never once the user edited the numbers (config.sample === false).
 *  - Flagged explicitly by templates (config.sample === true), and also recognised on pages created
 *    before the flag existed, because template widgets have ids starting with "tpl_".
 */
export function isSampleWidget(w: Pick<WidgetInstance, 'id' | 'type' | 'config'>): boolean {
  if (!SAMPLE_TYPES.has(w.type)) return false;
  if (typeof w.config.metricKey === 'string' && w.config.metricKey) return false;
  if (w.config.sample === false) return false;
  return w.config.sample === true || w.id.startsWith('tpl_');
}

/** Config keys that are purely cosmetic: changing them does not turn sample data into real data. */
export const COSMETIC_KEYS: ReadonlySet<string> = new Set(['title', 'color', 'unit', 'fontSize', 'maxItems', 'content', 'subtitle']);

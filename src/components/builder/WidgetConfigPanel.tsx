import { WidgetInstance, widgetSchemas, ConfigField } from '../../types/schema';
import { Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { MetricSeries } from '../../types/metrics';
import type { WidgetType } from '../../types/schema';
import { COSMETIC_KEYS } from '../../utils/sample';

// Which metric kind each widget type can display.
const METRIC_KINDS: Partial<Record<WidgetType, 'number' | 'checkin' | 'any'>> = {
  counter: 'number',
  progress: 'number',
  stat_number: 'number',
  chart_line: 'number',
  chart_bar: 'number',
  streak: 'checkin',
  log_feed: 'any',
};

interface Props {
  widget: WidgetInstance;
  metricOptions?: MetricSeries[];
  hasPublishedCopy?: boolean;
  onUpdate: (config: Record<string, unknown>) => void;
  onRemove: () => void;
}

export default function WidgetConfigPanel({ widget, onUpdate, onRemove, metricOptions = [], hasPublishedCopy = false }: Props) {
  const schema = widgetSchemas[widget.type];

  const handleChange = (field: ConfigField, value: unknown) => {
    let parsed: unknown = value;
    if (field.type === 'number') {
      parsed = Number(value);
    }
    // Typing your own numbers means it is no longer template placeholder data.
    onUpdate(COSMETIC_KEYS.has(field.key) ? { [field.key]: parsed } : { [field.key]: parsed, sample: false });
  };

  return (
    <div className="space-y-4">
      {/* Widget header */}
      <div className="flex items-center gap-3 p-3 bg-surface-3/50 rounded-lg border border-white/5">
        <span className="text-2xl">{schema.icon}</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-white">{schema.label}</p>
          <p className="text-[10px] text-gray-500">{schema.description}</p>
        </div>
      </div>

      {/* Template hint (integrations are not live yet) */}
      {widget.connector && widget.connector !== 'manual' && (
        <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
          <span className="text-xs text-gray-400">
            {widget.connector === 'github' ? (
              <>Tip: connect GitHub under <Link to="/metrics" className="text-brand-300 underline">Metrics</Link>, then link a “GitHub …” metric below.</>
            ) : (
              <>Template idea: {widget.connector.charAt(0).toUpperCase() + widget.connector.slice(1)} data. That integration is
              coming soon, so for now link a metric you log yourself.</>
            )}
          </span>
        </div>
      )}

      {/* Live metric link */}
      {METRIC_KINDS[widget.type] && (
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Linked metric (live data)</label>
          {!hasPublishedCopy ? (
            <p className="text-[11px] text-gray-500">Publish this page first, then create metrics under <Link to="/metrics" className="text-brand-300 underline">Metrics</Link>.</p>
          ) : (
            <>
              <select
                value={String(widget.config.metricKey ?? '')}
                onChange={(e) => onUpdate({ metricKey: e.target.value })}
                className="w-full px-3 py-2 bg-surface-3 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-brand-500/50"
              >
                <option value="">None (use the manual values below)</option>
                {metricOptions
                  .filter((m) => METRIC_KINDS[widget.type] === 'any' || m.kind === METRIC_KINDS[widget.type])
                  .map((m) => (
                    <option key={m.key} value={m.key}>
                      {m.label} ({m.source === 'github' ? 'GitHub' : m.kind === 'checkin' ? 'check-in' : 'number'})
                    </option>
                  ))}
              </select>
              <p className="text-[10px] text-gray-500 mt-1">
                Need a new one? <Link to="/metrics" className="text-brand-300 underline">Create a metric</Link>
              </p>
            </>
          )}
        </div>
      )}

      {widget.type === 'habit_grid' && (
        <p className="text-[11px] text-gray-500">
          Each habit reads the check-in metric with the same name. Create check-in metrics called “Run”, “Lift”, etc. under{' '}
          <Link to="/metrics" className="text-brand-300 underline">Metrics</Link>.
        </p>
      )}

      {/* Config fields */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Configuration</p>
        {schema.configFields.map((field) => (
          <div key={field.key}>
            <label className="text-xs text-gray-400 mb-1 block">{field.label}</label>
            {field.type === 'text' && (
              <input
                type="text"
                value={String(widget.config[field.key] ?? field.default)}
                onChange={(e) => handleChange(field, e.target.value)}
                className="w-full px-3 py-2 bg-surface-3 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-brand-500/50"
              />
            )}
            {field.type === 'number' && (
              <input
                type="number"
                value={Number(widget.config[field.key] ?? field.default)}
                onChange={(e) => handleChange(field, e.target.value)}
                className="w-full px-3 py-2 bg-surface-3 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-brand-500/50"
              />
            )}
            {field.type === 'color' && (
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={String(widget.config[field.key] ?? field.default)}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className="w-8 h-8 rounded border border-white/10 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={String(widget.config[field.key] ?? field.default)}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className="flex-1 px-3 py-2 bg-surface-3 border border-white/10 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-brand-500/50"
                />
              </div>
            )}
            {field.type === 'select' && field.options && (
              <select
                value={String(widget.config[field.key] ?? field.default)}
                onChange={(e) => handleChange(field, e.target.value)}
                className="w-full px-3 py-2 bg-surface-3 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-brand-500/50"
              >
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
            {field.type === 'boolean' && (
              <button
                onClick={() => handleChange(field, !widget.config[field.key])}
                className={`w-9 h-5 rounded-full transition-all ${
                  widget.config[field.key] ? 'bg-brand-500' : 'bg-surface-4'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                    widget.config[field.key] ? 'translate-x-[18px]' : 'translate-x-[3px]'
                  }`}
                />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Remove button */}
      <button
        onClick={onRemove}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 hover:bg-red-500/20 transition-all"
      >
        <Trash2 size={12} />
        Remove Widget
      </button>
    </div>
  );
}

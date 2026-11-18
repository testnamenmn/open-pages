import { WidgetInstance, widgetSchemas } from '../../types/schema';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import type { SeriesMap } from '../../types/metrics';
import { slugifyKey } from '../../types/metrics';
import { latest, trend, currentStreak, lastDays, chartRows, formatValue, timeAgo, Range } from '../../utils/metricMath';

interface Props {
  widget: WidgetInstance;
  /** Live metric data keyed by metric key. Widgets linked to a metric show this instead of manual config. */
  series?: SeriesMap;
}

const EmptyNote = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[11px] text-gray-500 py-4 text-center">{children}</p>
);

/** Wraps a widget and marks it when it shows GitHub-synced (public, unverified) data. */
export default function WidgetRenderer(props: Props) {
  const key = props.widget.config.metricKey;
  const linked = typeof key === 'string' && key ? props.series?.[key] : undefined;
  if (linked?.source !== 'github') return <WidgetBody {...props} />;
  return (
    <div className="relative">
      <WidgetBody {...props} />
      <span className="absolute bottom-1.5 right-3 text-[9px] text-gray-600" title="Public data pulled from GitHub, not verified">
        Public GitHub data · @{linked.sourceRef}
      </span>
    </div>
  );
}

function WidgetBody({ widget, series }: Props) {
  const schema = widgetSchemas[widget.type];
  const { config } = widget;
  const color = (config.color as string) || '#5c7cfa';
  const linked = typeof config.metricKey === 'string' && config.metricKey ? series?.[config.metricKey as string] : undefined;
  const [range, setRange] = useState<Range>('30d');

  const baseClasses = 'glass-card rounded-xl p-4 border border-white/5';

  switch (widget.type) {
    case 'streak':
      return (
        <div className={baseClasses}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{schema.icon}</span>
            <span className="text-xs text-gray-400">{config.title as string}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold" style={{ color }}>
              {linked?.kind === 'checkin' ? currentStreak(linked) : (config.currentDays as number)}
            </span>
            <span className="text-xs text-gray-500">{linked?.kind === 'checkin' ? 'days' : (config.unit as string)}</span>
          </div>
          <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1 }}
              className="h-full rounded-full"
              style={{ background: color }}
            />
          </div>
        </div>
      );

    case 'counter':
      return (
        <div className={baseClasses}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{schema.icon}</span>
            <span className="text-xs text-gray-400">{config.title as string}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold" style={{ color }}>
              {linked && latest(linked)
                ? formatValue(latest(linked)!.value)
                : typeof config.value === 'number' ? config.value.toLocaleString() : String(config.value)}
            </span>
            {(linked?.unit || config.unit) ? <span className="text-xs text-gray-500">{linked?.unit || String(config.unit)}</span> : null}
          </div>
        </div>
      );

    case 'progress':
      const current = linked && latest(linked) ? latest(linked)!.value : (config.current as number) || 0;
      const target = (config.target as number) || 100;
      const pct = Math.min(100, Math.max(0, Math.round((current / target) * 100)));
      return (
        <div className={baseClasses}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{schema.icon}</span>
            <span className="text-xs text-gray-400">{config.title as string}</span>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-2xl font-bold text-white">{current}</span>
            <span className="text-xs text-gray-500">/ {target} {config.unit as string}</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1 }}
              className="h-full rounded-full"
              style={{ background: color }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-right">{pct}%</p>
        </div>
      );

    case 'stat_number':
      const liveTrend = linked?.kind === 'number' && latest(linked) ? trend(linked) : undefined;
      const trendValue = liveTrend ?? config.trend;
      const TrendIcon = trendValue === 'up' ? TrendingUp : trendValue === 'down' ? TrendingDown : Minus;
      const trendColor = trendValue === 'up' ? '#51cf66' : trendValue === 'down' ? '#ff6b6b' : '#9ca3af';
      return (
        <div className={baseClasses}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">{config.title as string}</span>
            <TrendIcon size={12} style={{ color: trendColor }} />
          </div>
          <p className="text-2xl font-bold" style={{ color }}>
            {linked && latest(linked) ? `${formatValue(latest(linked)!.value)}${linked.unit ? ' ' + linked.unit : ''}` : (config.value as string)}
          </p>
          {config.subtitle ? <p className="text-xs text-gray-500 mt-1">{String(config.subtitle)}</p> : null}
        </div>
      );

    case 'text_block':
      const fontSize = config.fontSize === 'large' ? 'text-lg' : config.fontSize === 'small' ? 'text-xs' : 'text-sm';
      return (
        <div className={baseClasses}>
          <p className={`${fontSize} text-gray-300 italic`}>{config.content as string}</p>
        </div>
      );

    case 'chart_line':
    case 'chart_bar': {
      const rows = linked?.kind === 'number' ? chartRows(linked, range) : [];
      const Chart = widget.type === 'chart_bar' ? BarChart : LineChart;
      return (
        <div className={baseClasses}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{schema.icon}</span>
              <span className="text-xs text-gray-400">{config.title as string}</span>
            </div>
            {rows.length > 0 && (
              <div className="flex gap-1">
                {(['30d', '90d', 'all'] as Range[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`px-1.5 py-0.5 rounded text-[10px] ${range === r ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    {r === 'all' ? 'All' : r}
                  </button>
                ))}
              </div>
            )}
          </div>
          {rows.length === 0 ? (
            <EmptyNote>{linked ? 'No data in this range yet' : 'Link a metric to show data here'}</EmptyNote>
          ) : (
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <Chart data={rows} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#6b7280' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 9, fill: '#6b7280' }} axisLine={false} tickLine={false} width={44} domain={['auto', 'auto']} allowDecimals={linked?.unit !== 'pushes'} />
                  <Tooltip
                    contentStyle={{ background: '#1a1b26', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
                    formatter={(v: number) => [`${formatValue(v)}${linked?.unit ? ' ' + linked.unit : ''}`, linked?.label ?? '']}
                  />
                  {widget.type === 'chart_bar' ? (
                    <Bar dataKey="value" fill={color} radius={[3, 3, 0, 0]} />
                  ) : (
                    <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={rows.length < 25} />
                  )}
                </Chart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      );
    }

    case 'habit_grid': {
      const habits = (config.habits as string[]) || [];
      return (
        <div className={baseClasses}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{schema.icon}</span>
            <span className="text-xs text-gray-400">{config.title as string}</span>
          </div>
          <div className="space-y-1.5">
            {habits.slice(0, 5).map((habit, i) => {
              const habitSeries = series?.[slugifyKey(habit)];
              const cells = lastDays(habitSeries?.kind === 'checkin' ? habitSeries : undefined, 14);
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 w-14 truncate" title={habit}>{habit}</span>
                  <div className="flex gap-0.5">
                    {cells.map((c) => (
                      <div
                        key={c.day}
                        title={c.day}
                        className="w-2.5 h-2.5 rounded-sm"
                        style={{ background: c.done ? color : 'rgba(255,255,255,0.06)' }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-gray-600 mt-2">Last 14 days</p>
        </div>
      );
    }

    case 'log_feed': {
      const max = Number(config.maxItems) || 5;
      const entries = linked ? [...linked.points].reverse().slice(0, max) : [];
      return (
        <div className={baseClasses}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{schema.icon}</span>
            <span className="text-xs text-gray-400">{config.title as string}</span>
          </div>
          {entries.length === 0 ? (
            <EmptyNote>{linked ? 'Nothing logged yet' : 'Link a metric to show activity'}</EmptyNote>
          ) : (
            <div className="space-y-2">
              {entries.map((p) => (
                <div key={p.id ?? p.ts} className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">
                    {linked!.kind === 'checkin' ? `${linked!.label} ✓` : `${linked!.label}: ${formatValue(p.value)}${linked!.unit ? ' ' + linked!.unit : ''}`}
                  </span>
                  <span className="text-[10px] text-gray-600">{timeAgo(p.ts)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    case 'badge_row':
      return (
        <div className={baseClasses}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{schema.icon}</span>
            <span className="text-xs text-gray-400">{config.title as string}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {((config.badges as string[]) || []).length === 0 && (
              <span className="text-[11px] text-gray-500">No badges yet</span>
            )}
            {((config.badges as string[]) || []).map((badge, i) => (
              <span key={i} className="px-2 py-1 bg-white/5 rounded text-[10px] text-gray-300">
                {badge}
              </span>
            ))}
          </div>
        </div>
      );

    default:
      return (
        <div className={baseClasses}>
          <p className="text-xs text-gray-500">Unknown widget type</p>
        </div>
      );
  }
}

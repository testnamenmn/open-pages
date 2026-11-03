import { WidgetInstance, widgetSchemas } from '../../types/schema';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  widget: WidgetInstance;
}

export default function WidgetRenderer({ widget }: Props) {
  const schema = widgetSchemas[widget.type];
  const { config } = widget;
  const color = (config.color as string) || '#5c7cfa';

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
              {config.currentDays as number}
            </span>
            <span className="text-xs text-gray-500">{config.unit as string}</span>
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
              {typeof config.value === 'number' ? config.value.toLocaleString() : String(config.value)}
            </span>
            {config.unit ? <span className="text-xs text-gray-500">{String(config.unit)}</span> : null}
          </div>
        </div>
      );

    case 'progress':
      const current = (config.current as number) || 0;
      const target = (config.target as number) || 100;
      const pct = Math.round((current / target) * 100);
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
      const TrendIcon = config.trend === 'up' ? TrendingUp : config.trend === 'down' ? TrendingDown : Minus;
      const trendColor = config.trend === 'up' ? '#51cf66' : config.trend === 'down' ? '#ff6b6b' : '#9ca3af';
      return (
        <div className={baseClasses}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">{config.title as string}</span>
            <TrendIcon size={12} style={{ color: trendColor }} />
          </div>
          <p className="text-2xl font-bold" style={{ color }}>
            {config.value as string}
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
    case 'chart_bar':
      return (
        <div className={baseClasses}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{schema.icon}</span>
            <span className="text-xs text-gray-400">{config.title as string}</span>
          </div>
          <div className="flex items-end gap-1 h-16">
            {[40, 65, 30, 80, 55, 70, 45].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="flex-1 rounded-t"
                style={{ background: `${color}${widget.type === 'chart_bar' ? '' : '60'}` }}
              />
            ))}
          </div>
          <p className="text-[10px] text-gray-600 mt-2">Sample data • Connect API for live</p>
        </div>
      );

    case 'habit_grid':
      const habits = (config.habits as string[]) || [];
      const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
      return (
        <div className={baseClasses}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{schema.icon}</span>
            <span className="text-xs text-gray-400">{config.title as string}</span>
          </div>
          <div className="space-y-1.5">
            {habits.slice(0, 4).map((habit, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-500 w-12 truncate">{habit}</span>
                <div className="flex gap-0.5">
                  {days.map((_, j) => (
                    <div
                      key={j}
                      className="w-3 h-3 rounded-sm"
                      style={{
                        background: Math.random() > 0.3 ? `${color}60` : 'rgba(255,255,255,0.05)',
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'log_feed':
      return (
        <div className={baseClasses}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{schema.icon}</span>
            <span className="text-xs text-gray-400">{config.title as string}</span>
          </div>
          <div className="space-y-2">
            {[
              { text: 'Completed morning run', time: '2h ago' },
              { text: 'Read 45 pages', time: '5h ago' },
              { text: 'Meditated 20 min', time: '8h ago' },
            ].map((log, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs text-gray-300">{log.text}</span>
                <span className="text-[10px] text-gray-600">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'badge_row':
      return (
        <div className={baseClasses}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{schema.icon}</span>
            <span className="text-xs text-gray-400">{config.title as string}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {['🏆 30 days', '⭐ 100', '🔥 Streak'].map((badge, i) => (
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

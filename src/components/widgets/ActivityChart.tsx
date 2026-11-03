import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ActivityData } from '../../data/mockData';

interface Props {
  activity: ActivityData;
  index: number;
}

export default function ActivityChart({ activity, index }: Props) {
  const total = activity.data.reduce((sum: number, d: { value: number }) => sum + d.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      className="widget-card glass-card rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{activity.icon}</span>
          <h3 className="font-semibold text-white text-sm">{activity.title}</h3>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold" style={{ color: activity.color }}>
            {total.toFixed(1)}
          </p>
          <p className="text-xs text-gray-500">{activity.unit} total</p>
        </div>
      </div>

      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={activity.data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${activity.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={activity.color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={activity.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 11 }}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                background: 'rgba(26, 29, 46, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#9ca3af' }}
              itemStyle={{ color: activity.color }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={activity.color}
              strokeWidth={2}
              fill={`url(#gradient-${activity.id})`}
              animationDuration={1500}
              animationBegin={index * 200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

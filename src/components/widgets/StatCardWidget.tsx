import { motion } from 'framer-motion';
import { StatCard as StatCardType } from '../../data/mockData';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  stat: StatCardType;
  index: number;
}

export default function StatCardWidget({ stat, index }: Props) {
  const TrendIcon = stat.trend === 'up' ? TrendingUp : stat.trend === 'down' ? TrendingDown : Minus;
  const trendColor = stat.trend === 'up' ? '#51cf66' : stat.trend === 'down' ? '#ff6b6b' : '#9ca3af';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="widget-card glass-card rounded-2xl p-4 relative overflow-hidden"
    >
      <div
        className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-15"
        style={{ background: stat.color }}
      />

      <div className="flex items-center justify-between mb-2">
        <span className="text-lg">{stat.icon}</span>
        <div className="flex items-center gap-1" style={{ color: trendColor }}>
          <TrendIcon size={12} />
          <span className="text-xs font-medium">{stat.trendValue}</span>
        </div>
      </div>

      <p className="text-2xl font-bold text-white mb-0.5">{stat.value}</p>
      <p className="text-xs text-gray-400">{stat.title}</p>
      <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { StreakData } from '../../data/mockData';
import { Flame, Trophy } from 'lucide-react';

interface Props {
  streak: StreakData;
  index: number;
}

export default function StreakCard({ streak, index }: Props) {
  const percentage = Math.min((streak.currentStreak / streak.longestStreak) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="widget-card glass-card rounded-2xl p-5 relative overflow-hidden"
    >
      {/* Background glow */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20"
        style={{ background: streak.color }}
      />

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{streak.icon}</span>
          <h3 className="font-semibold text-white text-sm">{streak.title}</h3>
        </div>
        {streak.currentStreak === streak.longestStreak && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Trophy size={16} className="text-accent-yellow" />
          </motion.div>
        )}
      </div>

      <div className="mb-3">
        <div className="flex items-baseline gap-1">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className="text-3xl font-bold"
            style={{ color: streak.color }}
          >
            {streak.currentStreak}
          </motion.span>
          <span className="text-sm text-gray-400">{streak.unit}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Longest: {streak.longestStreak} {streak.unit}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: index * 0.1 + 0.5, duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${streak.color}, ${streak.color}88)` }}
        />
      </div>

      {/* Fire animation for active streaks */}
      {streak.currentStreak > 0 && (
        <div className="absolute top-3 right-3 streak-fire">
          <Flame size={14} style={{ color: streak.color }} />
        </div>
      )}
    </motion.div>
  );
}

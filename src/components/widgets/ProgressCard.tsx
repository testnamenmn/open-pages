import { motion } from 'framer-motion';
import { ProgressData } from '../../data/mockData';

interface Props {
  goal: ProgressData;
  index: number;
}

export default function ProgressCard({ goal, index }: Props) {
  const percentage = Math.round((goal.current / goal.target) * 100);
  const isComplete = percentage >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="widget-card glass-card rounded-2xl p-5 relative overflow-hidden"
    >
      <div
        className="absolute bottom-0 left-0 w-full h-1/2 blur-3xl opacity-10"
        style={{ background: goal.color }}
      />

      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">{goal.icon}</span>
        <h3 className="font-semibold text-white text-sm">{goal.title}</h3>
      </div>

      <div className="flex items-end justify-between mb-2">
        <div>
          <span className="text-2xl font-bold text-white">{goal.current}</span>
          <span className="text-sm text-gray-400 ml-1">/ {goal.target} {goal.unit}</span>
        </div>
        <span
          className="text-sm font-bold"
          style={{ color: isComplete ? '#51cf66' : goal.color }}
        >
          {percentage}%
        </span>
      </div>

      {/* Circular progress */}
      <div className="flex items-center justify-center my-4">
        <div className="relative w-20 h-20">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="3"
            />
            <motion.circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke={goal.color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${percentage} ${100 - percentage}`}
              initial={{ strokeDasharray: '0 100' }}
              animate={{ strokeDasharray: `${percentage} ${100 - percentage}` }}
              transition={{ delay: index * 0.1 + 0.3, duration: 1.5, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold" style={{ color: goal.color }}>
              {isComplete ? '✓' : `${percentage}%`}
            </span>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center">{goal.timeframe}</p>
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { weeklyHabitData } from '../../data/mockData';

const habitNames = [
  { key: 'exercise', label: '🏋️ Exercise' },
  { key: 'meditate', label: '🧘 Meditate' },
  { key: 'read', label: '📖 Read' },
  { key: 'journal', label: '✍️ Journal' },
  { key: 'nosugar', label: '🍎 No Sugar' },
  { key: 'sleep', label: '😴 Sleep 11pm' },
];

export default function HabitGrid() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="widget-card glass-card rounded-2xl p-5"
    >
      <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
        <span>📊</span> Weekly Habit Tracker
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-xs text-gray-500 pb-3 pr-4">Habit</th>
              {weeklyHabitData.map((day) => (
                <th key={day.day} className="text-center text-xs text-gray-500 pb-3 px-1">
                  {day.day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habitNames.map((habit, habitIndex) => (
              <tr key={habit.key}>
                <td className="text-xs text-gray-300 py-1.5 pr-4 whitespace-nowrap">
                  {habit.label}
                </td>
                {weeklyHabitData.map((day, dayIndex) => {
                  const completed = day[habit.key as keyof typeof day] as boolean;
                  return (
                    <td key={day.day} className="text-center py-1.5 px-1">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: habitIndex * 0.05 + dayIndex * 0.03 }}
                        className={`w-6 h-6 mx-auto rounded-md flex items-center justify-center text-xs ${
                          completed
                            ? 'bg-accent-green/20 text-accent-green'
                            : 'bg-white/5 text-gray-600'
                        }`}
                      >
                        {completed ? '✓' : '·'}
                      </motion.div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-accent-green/20 border border-accent-green/30" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-white/5 border border-white/10" />
          <span>Not done</span>
        </div>
      </div>
    </motion.div>
  );
}

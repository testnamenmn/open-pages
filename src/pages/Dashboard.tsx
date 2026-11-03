import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  currentUser,
  streaks,
  progressGoals,
  activityCharts,
  statCards,
  weeklyHabitData,
} from '../data/mockData';
import StreakCard from '../components/widgets/StreakCard';
import ProgressCard from '../components/widgets/ProgressCard';
import ActivityChart from '../components/widgets/ActivityChart';
import StatCardWidget from '../components/widgets/StatCardWidget';
import HabitGrid from '../components/widgets/HabitGrid';
import MonthlyChart from '../components/widgets/MonthlyChart';
import {
  Share2,
  Heart,
  MessageCircle,
  Bookmark,
  Link2,
  Calendar,
  MapPin,
  ExternalLink,
  Check,
} from 'lucide-react';

export default function Dashboard() {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://openpages.io/alexchen');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalStreakDays = streaks.reduce((sum, s) => sum + s.currentStreak, 0);
  const completedHabits = weeklyHabitData.reduce(
    (sum, day) =>
      sum +
      [day.exercise, day.meditate, day.read, day.journal, day.nosugar, day.sleep].filter(Boolean)
        .length,
    0
  );

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-6 sm:p-8 mb-6 relative overflow-hidden"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600/5 via-transparent to-accent-purple/5" />

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-brand-400 to-accent-purple flex items-center justify-center text-3xl sm:text-4xl shadow-lg shadow-brand-500/20">
                {currentUser.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">{currentUser.name}</h1>
                  <span className="px-2 py-0.5 rounded-full bg-accent-green/10 text-accent-green text-xs font-medium">
                    Active
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-2">@{currentUser.username}</p>
                <p className="text-gray-300 text-sm max-w-lg">{currentUser.bio}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    Joined March 2024
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    San Francisco, CA
                  </span>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-6 mb-6">
              <div className="text-center">
                <p className="text-xl font-bold text-white">{currentUser.followers.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-white">{currentUser.following}</p>
                <p className="text-xs text-gray-500">Following</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-accent-green">{totalStreakDays}</p>
                <p className="text-xs text-gray-500">Streak Days</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-brand-400">{completedHabits}</p>
                <p className="text-xs text-gray-500">Habits This Week</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setLiked(!liked)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  liked
                    ? 'bg-accent-pink/10 text-accent-pink border border-accent-pink/20'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
                {liked ? 'Liked' : 'Like'}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 transition-all">
                <MessageCircle size={14} />
                Comment
              </button>
              <button
                onClick={() => setSaved(!saved)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  saved
                    ? 'bg-brand-600/10 text-brand-300 border border-brand-500/20'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                <Bookmark size={14} fill={saved ? 'currentColor' : 'none'} />
                {saved ? 'Saved' : 'Save'}
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-brand-500 to-accent-purple text-white hover:opacity-90 transition-all"
                >
                  <Share2 size={14} />
                  Share
                </button>
                {showShareMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full right-0 mt-2 glass-card rounded-xl p-3 min-w-[200px] z-50 border border-white/10"
                  >
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 transition-all"
                    >
                      {copied ? <Check size={14} className="text-accent-green" /> : <Link2 size={14} />}
                      {copied ? 'Copied!' : 'Copy link'}
                    </button>
                    <button className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 transition-all">
                      <ExternalLink size={14} />
                      Open in new tab
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat, i) => (
            <StatCardWidget key={stat.id} stat={stat} index={i} />
          ))}
        </div>

        {/* Streaks Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            🔥 Active Streaks
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {streaks.map((streak, i) => (
              <StreakCard key={streak.id} streak={streak} index={i} />
            ))}
          </div>
        </motion.div>

        {/* Progress Goals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            🎯 2024 Goals
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {progressGoals.map((goal, i) => (
              <ProgressCard key={goal.id} goal={goal} index={i} />
            ))}
          </div>
        </motion.div>

        {/* Activity Charts */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            📊 Recent Activity
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activityCharts.map((activity, i) => (
              <ActivityChart key={activity.id} activity={activity} index={i} />
            ))}
          </div>
        </div>

        {/* Bottom Section - Habit Grid & Monthly Chart */}
        <div className="grid lg:grid-cols-2 gap-6">
          <HabitGrid />
          <MonthlyChart />
        </div>

        {/* Engagement Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 glass-card rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {['👩‍🎨', '🏋️', '📚', '🎸'].map((emoji, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-surface-3 border-2 border-surface flex items-center justify-center text-sm"
                >
                  {emoji}
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm text-gray-300">
                <span className="font-semibold text-white">1,247 people</span> are following this page
              </p>
              <p className="text-xs text-gray-500">Last updated 2 hours ago</p>
            </div>
          </div>
          <button className="px-5 py-2.5 bg-brand-600/20 text-brand-300 rounded-lg text-sm font-medium hover:bg-brand-600/30 transition-all border border-brand-500/20">
            + Follow
          </button>
        </motion.div>
      </div>
    </div>
  );
}

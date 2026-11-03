import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { otherUsers } from '../data/mockData';
import {
  Search,
  Filter,
  Flame,
  Target,
  BookOpen,
  Heart,
  TrendingUp,
  Users,
  Sparkles,
} from 'lucide-react';

const categories = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'fitness', label: 'Fitness', icon: TrendingUp },
  { id: 'reading', label: 'Reading', icon: BookOpen },
  { id: 'habits', label: 'Habits', icon: Target },
  { id: 'sobriety', label: 'Sobriety', icon: Heart },
  { id: 'streaks', label: 'Streaks', icon: Flame },
];

const trendingPages = [
  {
    user: otherUsers[1],
    highlight: '365-day workout streak',
    metric: '🏋️ 365 days',
    color: '#51cf66',
  },
  {
    user: otherUsers[2],
    highlight: '73 books read this year',
    metric: '📚 73/100 books',
    color: '#748ffc',
  },
  {
    user: otherUsers[0],
    highlight: '200 days of yoga practice',
    metric: '🧘 200 days',
    color: '#845ef7',
  },
];

export default function Explore() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Explore Open Pages
          </h1>
          <p className="text-gray-400 text-lg">
            Discover inspiring dashboards from people around the world
          </p>
        </motion.div>

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Search pages, people, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-surface-2 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-500/50 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-3 bg-surface-2 border border-white/10 rounded-xl text-gray-400 text-sm hover:bg-surface-3 transition-colors">
            <Filter size={16} />
            Filters
          </button>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                  : 'bg-surface-2 text-gray-400 border border-white/5 hover:bg-surface-3 hover:text-gray-300'
              }`}
            >
              <cat.icon size={14} />
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Trending Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-accent-orange" />
            Trending Now
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {trendingPages.map((page, i) => (
              <motion.div
                key={page.user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <Link
                  to="/dashboard"
                  className="glass-card rounded-2xl p-5 block hover:border-white/10 transition-all group relative overflow-hidden"
                >
                  <div
                    className="absolute top-0 right-0 w-20 h-20 rounded-full blur-3xl opacity-10"
                    style={{ background: page.color }}
                  />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center text-xl">
                        {page.user.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm group-hover:text-brand-300 transition-colors">
                          {page.user.name}
                        </p>
                        <p className="text-xs text-gray-500">@{page.user.username}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">{page.highlight}</p>
                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{
                        background: `${page.color}15`,
                        color: page.color,
                      }}
                    >
                      {page.metric}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Community Pages Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Users size={18} className="text-brand-400" />
            Community Pages
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherUsers.map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
              >
                <Link
                  to="/dashboard"
                  className="glass-card rounded-2xl p-5 block hover:border-white/10 transition-all group"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-surface-3 flex items-center justify-center text-2xl">
                      {user.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white group-hover:text-brand-300 transition-colors">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">@{user.username}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">{user.bio}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{user.followers.toLocaleString()} followers</span>
                    <span>Joined {new Date(user.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Load More */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 text-center"
        >
          <button className="px-6 py-3 bg-surface-2 border border-white/10 rounded-xl text-gray-300 text-sm font-medium hover:bg-surface-3 transition-all">
            Load More Pages
          </button>
        </motion.div>
      </div>
    </div>
  );
}

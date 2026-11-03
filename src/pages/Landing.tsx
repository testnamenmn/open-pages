import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Users,
  BarChart3,
  Share2,
  Zap,
  Heart,
  Target,
  Flame,
} from 'lucide-react';
import { streaks, otherUsers } from '../data/mockData';

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center hero-gradient pt-16">
        {/* Floating decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute top-32 left-[10%] text-4xl opacity-20"
          >
            📊
          </motion.div>
          <motion.div
            animate={{ y: [10, -10, 10], rotate: [0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute top-48 right-[15%] text-3xl opacity-20"
          >
            🏃
          </motion.div>
          <motion.div
            animate={{ y: [-8, 8, -8] }}
            transition={{ duration: 7, repeat: Infinity }}
            className="absolute bottom-32 left-[20%] text-3xl opacity-20"
          >
            📚
          </motion.div>
          <motion.div
            animate={{ y: [5, -15, 5] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute bottom-48 right-[25%] text-4xl opacity-20"
          >
            🧘
          </motion.div>
        </div>

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-600/10 border border-brand-500/20 text-brand-300 text-sm mb-8">
              <Sparkles size={14} />
              <span>Your life, visualized. Share what matters.</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6"
          >
            Build Your
            <br />
            <span className="gradient-text">Open Page</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Create beautiful, personalized data dashboards to track your fitness goals,
            hobbies, sobriety streaks, and more. Share your journey and inspire others.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/dashboard"
              className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-500 to-accent-purple rounded-xl text-white font-semibold text-lg hover:opacity-90 transition-all shadow-lg shadow-brand-500/20"
            >
              Create Your Page
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/explore"
              className="flex items-center gap-2 px-8 py-4 rounded-xl text-gray-300 font-medium border border-white/10 hover:bg-white/5 transition-all"
            >
              <Users size={18} />
              Explore Pages
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5">
            <div className="w-1.5 h-3 rounded-full bg-white/40" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need to <span className="gradient-text">track & share</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              From sobriety streaks to fitness goals, Open Pages gives you beautiful widgets
              to visualize what matters most to you.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <BarChart3 size={24} />,
                title: 'Rich Visualizations',
                description: 'Charts, streaks, progress bars, and habit trackers — all beautifully designed and animated.',
                color: '#5c7cfa',
              },
              {
                icon: <Share2 size={24} />,
                title: 'Social Motivation',
                description: 'Share your page with friends, get encouragement, and build accountability through community.',
                color: '#845ef7',
              },
              {
                icon: <Zap size={24} />,
                title: 'Easy to Build',
                description: 'No coding required. Pick your widgets, customize colors, and publish your page in minutes.',
                color: '#51cf66',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-6 hover:border-white/10 transition-all"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${feature.color}15`, color: feature.color }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Preview Section */}
      <section className="py-24 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              See it in <span className="gradient-text">action</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Here's a glimpse of what your Open Page could look like
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-card rounded-3xl p-6 sm:p-8 border border-white/5"
          >
            {/* Mock dashboard preview */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-accent-purple flex items-center justify-center text-lg">
                🧑‍💻
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Alex Chen's Open Page</p>
                <p className="text-xs text-gray-500">@alexchen • Updated 2 hours ago</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {streaks.slice(0, 4).map((streak, i) => (
                <motion.div
                  key={streak.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-surface-3/50 rounded-xl p-4 border border-white/5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span>{streak.icon}</span>
                    <span className="text-xs text-gray-400">{streak.title}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold" style={{ color: streak.color }}>
                      {streak.currentStreak}
                    </span>
                    <span className="text-xs text-gray-500">{streak.unit}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    <Flame size={10} style={{ color: streak.color }} />
                    <span className="text-xs" style={{ color: streak.color }}>
                      🔥 Active
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Join the <span className="gradient-text">community</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Thousands of people are already sharing their journeys
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherUsers.slice(0, 6).map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card rounded-xl p-4 flex items-center gap-3 hover:border-white/10 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full bg-surface-3 flex items-center justify-center text-2xl">
                  {user.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm group-hover:text-brand-300 transition-colors">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.bio}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{user.followers.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">followers</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="glass-card rounded-3xl p-8 sm:p-12 border border-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-600/10 via-transparent to-accent-purple/10" />
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Heart size={20} className="text-accent-pink" />
                  <Target size={20} className="text-brand-400" />
                  <Flame size={20} className="text-accent-orange" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Ready to share your story?
                </h2>
                <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">
                  Your data tells a story. Let the world see your progress, your dedication,
                  and your growth.
                </p>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-500 to-accent-purple rounded-xl text-white font-semibold text-lg hover:opacity-90 transition-all shadow-lg shadow-brand-500/20"
                >
                  Start Building Your Page
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand-400 to-accent-purple flex items-center justify-center">
              <span className="text-white font-bold text-xs">OP</span>
            </div>
            <span className="text-sm text-gray-500">Open Pages © 2024</span>
          </div>
          <p className="text-xs text-gray-600">
            Share your life data. Inspire others. Build better habits.
          </p>
        </div>
      </footer>
    </div>
  );
}

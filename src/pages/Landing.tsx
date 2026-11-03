import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Layers,
  Key,
  Share2,
  Palette,
  Layout,
  Database,
  Github,
  Activity,
  BookOpen,
} from 'lucide-react';
import { widgetSchemas } from '../types/schema';

export default function Landing() {
  const primitives = Object.values(widgetSchemas).slice(0, 6);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center hero-gradient pt-14">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-600/10 border border-brand-500/20 text-brand-300 text-xs mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
              <span>MVP v0.1 — Now in development</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-5"
          >
            Build Your
            <br />
            <span className="gradient-text">Open Page</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto mb-8 leading-relaxed"
          >
            A modular dashboard builder for personal data. Connect APIs,
            drag-and-drop widgets, and share your life metrics with the world.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              to="/templates"
              className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-accent-purple rounded-xl text-white font-semibold hover:opacity-90 transition-all shadow-lg shadow-brand-500/20"
            >
              <Layers size={16} />
              Start with a Template
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/my-pages"
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-gray-300 font-medium border border-white/10 hover:bg-white/5 transition-all"
            >
              <Layout size={16} />
              My Pages
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Data Schema Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Database size={16} className="text-brand-400" />
              <span className="text-xs text-gray-500 uppercase tracking-wide">Data Schema</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Primitive Widget Types
            </h2>
            <p className="text-gray-400 text-sm max-w-lg mx-auto">
              Every Open Page is built from composable data primitives.
              Mix and match to tell your story.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {primitives.map((schema, i) => (
              <motion.div
                key={schema.type}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-xl p-4 text-center hover:border-white/15 transition-all"
              >
                <span className="text-2xl mb-2 block">{schema.icon}</span>
                <p className="text-xs font-medium text-white">{schema.label}</p>
                <p className="text-[10px] text-gray-500 mt-1 font-mono">{schema.type}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Publish in 3 Steps
            </h2>
            <p className="text-gray-400 text-sm max-w-lg mx-auto">
              From template to live page in under 2 minutes
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                step: '1',
                title: 'Choose a Template',
                desc: 'Pick from Fitness, Developer, Polymath, or start from scratch',
                icon: '📚',
              },
              {
                step: '2',
                title: 'Customize',
                desc: 'Drag widgets, tweak colors, add your data — no code required',
                icon: '🎨',
              },
              {
                step: '3',
                title: 'Publish',
                desc: 'Get your vanity URL and share it with the world',
                icon: '🚀',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-xl p-6 text-center relative"
              >
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center text-white font-bold text-sm">
                  {item.step}
                </div>
                <span className="text-4xl mb-3 block">{item.icon}</span>
                <h3 className="text-sm font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* API Connectors */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Key size={16} className="text-accent-green" />
              <span className="text-xs text-gray-500 uppercase tracking-wide">API Connectors</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Connect Your Data Sources
            </h2>
            <p className="text-gray-400 text-sm max-w-lg mx-auto">
              Secure OAuth 2.0 integration with the services you already use.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: <Github size={24} />, name: 'GitHub', desc: 'Commits, repos, coding streaks', color: '#6e5494' },
              { icon: <Activity size={24} />, name: 'Strava', desc: 'Runs, rides, fitness data', color: '#fc4c02' },
              { icon: <BookOpen size={24} />, name: 'Goodreads', desc: 'Books, reading goals', color: '#553b08' },
            ].map((api, i) => (
              <motion.div
                key={api.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-xl p-5 hover:border-white/15 transition-all"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${api.color}15`, color: api.color }}
                >
                  {api.icon}
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{api.name}</h3>
                <p className="text-xs text-gray-500">{api.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              MVP Feature Set
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: <Layout size={18} />, title: 'Drag & Drop Builder', desc: 'Modular canvas — add, remove, and configure widgets visually' },
              { icon: <Layers size={18} />, title: 'Template Library', desc: 'Starter packs for Fitness, Developer, Polymath, and more' },
              { icon: <Key size={18} />, title: 'OAuth 2.0 Auth', desc: 'Secure connections to GitHub, Strava, Goodreads' },
              { icon: <Palette size={18} />, title: 'Customization Engine', desc: 'Colors, fonts, layouts — no code required' },
              { icon: <Share2 size={18} />, title: 'Public Sharing', desc: 'Vanity URLs, SEO settings, social sharing' },
              { icon: <Database size={18} />, title: 'Data Schema', desc: '10 primitive widget types for any data story' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-xl p-5 hover:border-white/15 transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-brand-600/10 flex items-center justify-center mb-3 text-brand-300">
                  {feature.icon}
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{feature.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-8 border border-white/5"
          >
            <h2 className="text-2xl font-bold text-white mb-3">Ready to build?</h2>
            <p className="text-sm text-gray-400 mb-6">
              Pick a template or start from scratch. Your Open Page is minutes away.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/templates"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-accent-purple rounded-xl text-white font-medium hover:opacity-90 transition-all"
              >
                Browse Templates
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/connectors"
                className="flex items-center gap-2 px-6 py-3 border border-white/10 rounded-xl text-gray-300 font-medium hover:bg-white/5 transition-all"
              >
                <Key size={14} />
                Connect APIs
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-brand-400 to-accent-purple flex items-center justify-center">
              <span className="text-white font-bold text-[8px]">OP</span>
            </div>
            <span className="text-xs text-gray-600">Open Pages MVP v0.1</span>
          </div>
          <p className="text-[10px] text-gray-700">
            Schema-driven • OAuth 2.0 • Modular widgets • Public sharing
          </p>
        </div>
      </footer>
    </div>
  );
}

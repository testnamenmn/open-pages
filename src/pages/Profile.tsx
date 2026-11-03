import { useState } from 'react';
import { motion } from 'framer-motion';
import { currentUser } from '../data/mockData';
import {
  Settings,
  Edit3,
  Eye,
  Palette,
  Layout,
  Bell,
  Shield,
  LogOut,
  ChevronRight,
  Plus,
  Image,
  Type,
  BarChart3,
  Target,
  Flame,
  Check,
} from 'lucide-react';

const widgets = [
  { id: 'streaks', label: 'Streak Counter', icon: Flame, color: '#51cf66', active: true },
  { id: 'progress', label: 'Progress Goals', icon: Target, color: '#748ffc', active: true },
  { id: 'charts', label: 'Activity Charts', icon: BarChart3, color: '#845ef7', active: true },
  { id: 'stats', label: 'Quick Stats', icon: BarChart3, color: '#ff922b', active: true },
  { id: 'habits', label: 'Habit Tracker', icon: Check, color: '#22b8cf', active: true },
  { id: 'image', label: 'Cover Image', icon: Image, color: '#f06595', active: false },
  { id: 'bio', label: 'About Section', icon: Type, color: '#fcc419', active: true },
];

const colorOptions = [
  { name: 'Ocean', color: '#5c7cfa' },
  { name: 'Forest', color: '#51cf66' },
  { name: 'Sunset', color: '#ff922b' },
  { name: 'Rose', color: '#f06595' },
  { name: 'Violet', color: '#845ef7' },
  { name: 'Cyan', color: '#22b8cf' },
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState<'widgets' | 'appearance' | 'settings'>('widgets');
  const [selectedColor, setSelectedColor] = useState('#5c7cfa');
  const [isPublic, setIsPublic] = useState(true);
  const [widgetStates, setWidgetStates] = useState(
    Object.fromEntries(widgets.map((w) => [w.id, w.active]))
  );

  const toggleWidget = (id: string) => {
    setWidgetStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-6 sm:p-8 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-brand-400 to-accent-purple flex items-center justify-center text-3xl sm:text-4xl shadow-lg shadow-brand-500/20">
              {currentUser.avatar}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-1">{currentUser.name}</h1>
              <p className="text-gray-400 text-sm mb-2">@{currentUser.username}</p>
              <p className="text-gray-300 text-sm">{currentUser.bio}</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/10 transition-all">
                <Edit3 size={14} />
                Edit Profile
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-purple rounded-lg text-sm text-white font-medium hover:opacity-90 transition-all">
                <Eye size={14} />
                Preview Page
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-1 mb-6 bg-surface-2 rounded-xl p-1"
        >
          {[
            { id: 'widgets', label: 'Widgets', icon: Layout },
            { id: 'appearance', label: 'Appearance', icon: Palette },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-surface-3 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Widgets Tab */}
        {activeTab === 'widgets' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="glass-card rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Your Widgets</h3>
              <p className="text-sm text-gray-400 mb-6">
                Choose which widgets appear on your Open Page. Drag to reorder.
              </p>

              <div className="space-y-3">
                {widgets.map((widget, i) => (
                  <motion.div
                    key={widget.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-4 bg-surface-3/50 rounded-xl border border-white/5 hover:border-white/10 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: `${widget.color}15` }}
                      >
                        <widget.icon size={18} style={{ color: widget.color }} />
                      </div>
                      <span className="text-sm font-medium text-white">{widget.label}</span>
                    </div>
                    <button
                      onClick={() => toggleWidget(widget.id)}
                      className={`relative w-11 h-6 rounded-full transition-all ${
                        widgetStates[widget.id] ? 'bg-brand-500' : 'bg-surface-4'
                      }`}
                    >
                      <motion.div
                        animate={{ x: widgetStates[widget.id] ? 20 : 2 }}
                        className="absolute top-1 w-4 h-4 rounded-full bg-white"
                      />
                    </button>
                  </motion.div>
                ))}
              </div>

              <button className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-all">
                <Plus size={16} />
                Add Custom Widget
              </button>
            </div>

            {/* Active Widgets Preview */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Page Preview</h3>
              <p className="text-sm text-gray-400 mb-4">
                {Object.values(widgetStates).filter(Boolean).length} widgets active
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {widgets
                  .filter((w) => widgetStates[w.id])
                  .map((widget) => (
                    <div
                      key={widget.id}
                      className="p-3 rounded-xl border border-white/5 bg-surface-3/30 flex items-center gap-2"
                    >
                      <widget.icon size={14} style={{ color: widget.color }} />
                      <span className="text-xs text-gray-300">{widget.label}</span>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="glass-card rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Accent Color</h3>
              <p className="text-sm text-gray-400 mb-6">
                Choose a color that represents your personality
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {colorOptions.map((option) => (
                  <button
                    key={option.color}
                    onClick={() => setSelectedColor(option.color)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                      selectedColor === option.color
                        ? 'border-white/20 bg-white/5'
                        : 'border-transparent hover:bg-white/5'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-full shadow-lg"
                      style={{
                        background: option.color,
                        boxShadow:
                          selectedColor === option.color
                            ? `0 0 20px ${option.color}40`
                            : 'none',
                      }}
                    />
                    <span className="text-xs text-gray-400">{option.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Theme</h3>
              <p className="text-sm text-gray-400 mb-6">
                Select the overall look of your page
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'dark', label: 'Dark', preview: 'bg-surface-2' },
                  { id: 'gradient', label: 'Gradient', preview: 'bg-gradient-to-br from-brand-900/50 to-accent-purple/20' },
                  { id: 'minimal', label: 'Minimal', preview: 'bg-surface-3' },
                ].map((theme) => (
                  <button
                    key={theme.id}
                    className={`p-4 rounded-xl border transition-all ${
                      theme.id === 'dark'
                        ? 'border-brand-500/30 bg-brand-600/10'
                        : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className={`w-full h-16 rounded-lg ${theme.preview} mb-2 border border-white/5`} />
                    <span className="text-xs text-gray-300">{theme.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Page Layout</h3>
              <p className="text-sm text-gray-400 mb-6">
                Choose how your widgets are arranged
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'grid', label: 'Grid', desc: 'Equal-sized cards' },
                  { id: 'masonry', label: 'Masonry', desc: 'Varied heights' },
                ].map((layout) => (
                  <button
                    key={layout.id}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      layout.id === 'grid'
                        ? 'border-brand-500/30 bg-brand-600/10'
                        : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    <span className="text-sm font-medium text-white">{layout.label}</span>
                    <p className="text-xs text-gray-500 mt-1">{layout.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="glass-card rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Privacy</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Public Page</p>
                    <p className="text-xs text-gray-500">Anyone can view your Open Page</p>
                  </div>
                  <button
                    onClick={() => setIsPublic(!isPublic)}
                    className={`relative w-11 h-6 rounded-full transition-all ${
                      isPublic ? 'bg-brand-500' : 'bg-surface-4'
                    }`}
                  >
                    <motion.div
                      animate={{ x: isPublic ? 20 : 2 }}
                      className="absolute top-1 w-4 h-4 rounded-full bg-white"
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Show in Explore</p>
                    <p className="text-xs text-gray-500">Appear in the community directory</p>
                  </div>
                  <button className="relative w-11 h-6 rounded-full bg-brand-500 transition-all">
                    <div className="absolute top-1 left-5 w-4 h-4 rounded-full bg-white" />
                  </button>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>
              <div className="space-y-3">
                {[
                  { label: 'New followers', desc: 'When someone follows your page' },
                  { label: 'Likes & reactions', desc: 'When someone likes your widgets' },
                  { label: 'Comments', desc: 'When someone comments on your page' },
                  { label: 'Streak milestones', desc: 'Celebrate your achievements' },
                ].map((notif, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-surface-3/30">
                    <div>
                      <p className="text-sm text-white">{notif.label}</p>
                      <p className="text-xs text-gray-500">{notif.desc}</p>
                    </div>
                    <Bell size={16} className="text-gray-500" />
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Account</h3>
              <div className="space-y-2">
                {[
                  { icon: Shield, label: 'Security', desc: 'Password & 2FA' },
                  { icon: LogOut, label: 'Sign Out', desc: 'Sign out of your account' },
                ].map((item, i) => (
                  <button
                    key={i}
                    className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-surface-3/50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={16} className="text-gray-400" />
                      <div className="text-left">
                        <p className="text-sm text-white">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-500" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

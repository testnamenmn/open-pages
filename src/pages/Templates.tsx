import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useBuilder } from '../store/BuilderContext';
import { templates, categories } from '../data/templates';
import { OpenPage } from '../types/schema';
import { Sparkles, ArrowRight, Users } from 'lucide-react';

export default function Templates() {
  const [activeCategory, setActiveCategory] = useState('all');
  const { dispatch } = useBuilder();
  const navigate = useNavigate();

  const filteredTemplates = activeCategory === 'all'
    ? templates
    : templates.filter((t) => t.category === activeCategory);

  const useTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    const page: OpenPage = {
      id: `page_${Date.now()}`,
      slug: 'my-page',
      ownerName: 'Your Name',
      ownerAvatar: template.icon,
      bio: template.description,
      theme: {
        accentColor: template.accentColor,
        bgStyle: 'dark',
        fontFamily: 'inter',
        layout: 'grid',
        borderRadius: 'md',
      },
      widgets: template.widgets,
      connectors: [],
      isPublic: true,
      seoTitle: template.name,
      seoDescription: template.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: 'LOAD_TEMPLATE', payload: page });
    navigate('/builder');
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={20} className="text-accent-yellow" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">Starter Packs</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Template Library</h1>
          <p className="text-gray-400">
            Start with a pre-built template and customize it to match your journey.
          </p>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                  : 'bg-surface-2 text-gray-400 border border-white/5 hover:bg-surface-3'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Templates Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((template, i) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card rounded-2xl overflow-hidden group hover:border-white/15 transition-all"
            >
              {/* Preview header */}
              <div
                className="h-32 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${template.accentColor}20, ${template.accentColor}05)`,
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl opacity-60">{template.icon}</span>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/30 rounded-full">
                  <Users size={10} className="text-gray-400" />
                  <span className="text-[10px] text-gray-400">{template.popularity.toLocaleString()}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-white mb-1">{template.name}</h3>
                <p className="text-xs text-gray-400 mb-4">{template.description}</p>

                {/* Widget preview */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {template.widgets.slice(0, 5).map((w, j) => (
                    <span
                      key={j}
                      className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-gray-400"
                    >
                      {w.type.replace('_', ' ')}
                    </span>
                  ))}
                  {template.widgets.length > 5 && (
                    <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-gray-500">
                      +{template.widgets.length - 5} more
                    </span>
                  )}
                </div>

                <button
                  onClick={() => useTemplate(template.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group-hover:bg-brand-600/20 group-hover:text-brand-300 bg-surface-3 text-gray-300 border border-white/5"
                >
                  Use Template
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Blank start option */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-center"
        >
          <p className="text-sm text-gray-500 mb-3">Or start from scratch</p>
          <button
            onClick={() => navigate('/builder')}
            className="px-6 py-3 bg-surface-2 border border-white/10 rounded-xl text-gray-300 text-sm font-medium hover:bg-surface-3 transition-all"
          >
            Empty Canvas →
          </button>
        </motion.div>
      </div>
    </div>
  );
}

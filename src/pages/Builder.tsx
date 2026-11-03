import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useBuilder } from '../store/BuilderContext';
import { widgetSchemas, WidgetType } from '../types/schema';
import WidgetRenderer from '../components/builder/WidgetRenderer';
import WidgetConfigPanel from '../components/builder/WidgetConfigPanel';
import PublishModal from '../components/builder/PublishModal';
import {
  Plus,
  Trash2,
  GripVertical,
  Eye,
  Settings,
  Layers,
  X,
  Link2,
  Palette,
  FileText,
  ChevronDown,
  Globe,
} from 'lucide-react';

type Tab = 'widgets' | 'theme' | 'settings';

export default function Builder() {
  const { state, dispatch } = useBuilder();
  const { page, selectedWidgetId } = state;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('widgets');
  const [showPreview, setShowPreview] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const selectedWidget = page.widgets.find((w) => w.id === selectedWidgetId);

  const addWidget = (type: WidgetType) => {
    dispatch({ type: 'ADD_WIDGET', payload: { widgetType: type } });
  };

  const removeWidget = (id: string) => {
    dispatch({ type: 'REMOVE_WIDGET', payload: id });
  };

  const handleDragStart = (e: React.DragEvent, type: WidgetType) => {
    e.dataTransfer.setData('widgetType', type);
    dispatch({ type: 'SET_DRAGGING', payload: true });
  };

  const handleDragEnd = () => {
    dispatch({ type: 'SET_DRAGGING', payload: false });
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('widgetType') as WidgetType;
    if (type) addWidget(type);
    setDragOverIndex(null);
  };

  const handlePublished = (slug: string) => {
    setShowPublishModal(false);
    navigate(`/p/${slug}`);
  };

  const widgetTypes = Object.values(widgetSchemas);

  if (showPreview) {
    return (
      <div className="min-h-screen pt-16 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Preview Mode</h2>
            <button
              onClick={() => setShowPreview(false)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/10"
            >
              <X size={14} />
              Back to Editor
            </button>
          </div>
          <PreviewPage />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 flex flex-col lg:flex-row">
      {/* Left Sidebar — Widget Palette */}
      <aside className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-white/5 bg-surface-2/50 overflow-y-auto max-h-[calc(100vh-4rem)]">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Layers size={14} />
              Widget Palette
            </h2>
            <span className="text-xs text-gray-500">{page.widgets.length} active</span>
          </div>

          <p className="text-xs text-gray-500 mb-3">
            Drag widgets onto the canvas or click to add
          </p>

          <div className="space-y-1.5">
            {widgetTypes.map((schema) => (
              <div
                key={schema.type}
                draggable
                onDragStart={(e) => handleDragStart(e, schema.type)}
                onDragEnd={handleDragEnd}
                onClick={() => addWidget(schema.type)}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-3/50 border border-white/5 hover:border-white/15 hover:bg-surface-3 cursor-grab active:cursor-grabbing transition-all group"
              >
                <span className="text-lg">{schema.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{schema.label}</p>
                  <p className="text-[10px] text-gray-500 truncate">{schema.description}</p>
                </div>
                <GripVertical size={12} className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Center — Canvas */}
      <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-white">Page Builder</h1>
            <p className="text-xs text-gray-500">
              openpages.io/<span className="text-brand-300">{page.slug || 'your-slug'}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 hover:bg-white/10"
            >
              <Eye size={12} />
              Preview
            </button>
            <button
              onClick={() => setShowPublishModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-brand-500 to-accent-purple rounded-lg text-xs text-white font-medium hover:opacity-90"
            >
              <Globe size={12} />
              Publish
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOverIndex(0); }}
          onDragLeave={() => setDragOverIndex(null)}
          onDrop={handleDrop}
          className={`min-h-[400px] rounded-2xl border-2 border-dashed transition-all p-4 ${
            state.isDragging
              ? 'border-brand-500/50 bg-brand-600/5'
              : 'border-white/10 bg-surface-2/30'
          }`}
        >
          {page.widgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <div className="w-16 h-16 rounded-2xl bg-surface-3 flex items-center justify-center mb-4">
                <Plus size={24} className="text-gray-500" />
              </div>
              <p className="text-sm text-gray-400 mb-1">Your canvas is empty</p>
              <p className="text-xs text-gray-600">
                Drag widgets from the left panel or click to add
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {page.widgets.map((widget, i) => (
                <motion.div
                  key={widget.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => dispatch({ type: 'SELECT_WIDGET', payload: widget.id })}
                  className={`relative group cursor-pointer rounded-xl transition-all ${
                    selectedWidgetId === widget.id
                      ? 'ring-2 ring-brand-500 ring-offset-2 ring-offset-surface'
                      : 'hover:ring-1 hover:ring-white/20'
                  }`}
                >
                  <WidgetRenderer widget={widget} />
                  {/* Overlay controls */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); removeWidget(widget.id); }}
                      className="w-6 h-6 rounded bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/30"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                  {/* Drag handle */}
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical size={12} className="text-gray-500" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Right Sidebar — Config Panel */}
      <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-white/5 bg-surface-2/50 overflow-y-auto max-h-[calc(100vh-4rem)]">
        <div className="p-4">
          {/* Tabs */}
          <div className="flex gap-1 mb-4 bg-surface-3/50 rounded-lg p-1">
            {[
              { id: 'widgets', label: 'Edit', icon: Settings },
              { id: 'theme', label: 'Theme', icon: Palette },
              { id: 'settings', label: 'Page', icon: FileText },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-surface text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <tab.icon size={12} />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'widgets' && selectedWidget && (
            <WidgetConfigPanel
              widget={selectedWidget}
              onUpdate={(config: Record<string, unknown>) =>
                dispatch({ type: 'UPDATE_WIDGET_CONFIG', payload: { id: selectedWidget.id, config } })
              }
              onRemove={() => removeWidget(selectedWidget.id)}
            />
          )}

          {activeTab === 'widgets' && !selectedWidget && (
            <div className="text-center py-12">
              <Settings size={24} className="text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Select a widget to configure</p>
            </div>
          )}

          {activeTab === 'theme' && <ThemePanel />}
          {activeTab === 'settings' && <PageSettingsPanel />}
        </div>
      </aside>

      {/* Publish Modal */}
      <PublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onPublished={handlePublished}
      />
    </div>
  );
}

function ThemePanel() {
  const { state, dispatch } = useBuilder();
  const { theme } = state.page;

  const colors = ['#5c7cfa', '#51cf66', '#845ef7', '#f06595', '#ff922b', '#22b8cf', '#fcc419', '#ff6b6b'];

  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-medium text-gray-400 mb-2 block">Accent Color</label>
        <div className="grid grid-cols-4 gap-2">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => dispatch({ type: 'UPDATE_THEME', payload: { accentColor: c } })}
              className={`w-full aspect-square rounded-lg border-2 transition-all ${
                theme.accentColor === c ? 'border-white scale-110' : 'border-transparent'
              }`}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-400 mb-2 block">Background</label>
        <div className="grid grid-cols-3 gap-2">
          {(['dark', 'gradient', 'minimal'] as const).map((style) => (
            <button
              key={style}
              onClick={() => dispatch({ type: 'UPDATE_THEME', payload: { bgStyle: style } })}
              className={`p-2 rounded-lg border text-xs capitalize transition-all ${
                theme.bgStyle === style
                  ? 'border-brand-500/50 bg-brand-600/10 text-white'
                  : 'border-white/5 text-gray-500 hover:border-white/15'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-400 mb-2 block">Layout</label>
        <div className="grid grid-cols-3 gap-2">
          {(['grid', 'masonry', 'list'] as const).map((layout) => (
            <button
              key={layout}
              onClick={() => dispatch({ type: 'UPDATE_THEME', payload: { layout } })}
              className={`p-2 rounded-lg border text-xs capitalize transition-all ${
                theme.layout === layout
                  ? 'border-brand-500/50 bg-brand-600/10 text-white'
                  : 'border-white/5 text-gray-500 hover:border-white/15'
              }`}
            >
              {layout}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-400 mb-2 block">Border Radius</label>
        <div className="grid grid-cols-3 gap-2">
          {(['sm', 'md', 'lg'] as const).map((r) => (
            <button
              key={r}
              onClick={() => dispatch({ type: 'UPDATE_THEME', payload: { borderRadius: r } })}
              className={`p-2 rounded-lg border text-xs uppercase transition-all ${
                theme.borderRadius === r
                  ? 'border-brand-500/50 bg-brand-600/10 text-white'
                  : 'border-white/5 text-gray-500 hover:border-white/15'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PageSettingsPanel() {
  const { state, dispatch } = useBuilder();
  const { page } = state;

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-400 mb-1.5 block">Display Name</label>
        <input
          type="text"
          value={page.ownerName}
          onChange={(e) => dispatch({ type: 'UPDATE_PAGE_INFO', payload: { ownerName: e.target.value } })}
          className="w-full px-3 py-2 bg-surface-3 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500/50"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-400 mb-1.5 block">Bio</label>
        <textarea
          value={page.bio}
          onChange={(e) => dispatch({ type: 'UPDATE_PAGE_INFO', payload: { bio: e.target.value } })}
          rows={3}
          className="w-full px-3 py-2 bg-surface-3 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500/50 resize-none"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-400 mb-1.5 block">Vanity URL</label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">openpages.io/</span>
          <input
            type="text"
            value={page.slug}
            onChange={(e) => dispatch({ type: 'UPDATE_PAGE_INFO', payload: { slug: e.target.value.replace(/\s/g, '-').toLowerCase() } })}
            className="flex-1 px-3 py-2 bg-surface-3 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500/50"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-400 mb-1.5 block">SEO Title</label>
        <input
          type="text"
          value={page.seoTitle}
          onChange={(e) => dispatch({ type: 'UPDATE_PAGE_INFO', payload: { seoTitle: e.target.value } })}
          className="w-full px-3 py-2 bg-surface-3 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500/50"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-400 mb-1.5 block">SEO Description</label>
        <textarea
          value={page.seoDescription}
          onChange={(e) => dispatch({ type: 'UPDATE_PAGE_INFO', payload: { seoDescription: e.target.value } })}
          rows={2}
          className="w-full px-3 py-2 bg-surface-3 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500/50 resize-none"
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-surface-3/50 rounded-lg border border-white/5">
        <div>
          <p className="text-xs font-medium text-white">Public Page</p>
          <p className="text-[10px] text-gray-500">Visible to everyone</p>
        </div>
        <button
          onClick={() => dispatch({ type: 'UPDATE_PAGE_INFO', payload: { isPublic: !page.isPublic } })}
          className={`w-9 h-5 rounded-full transition-all ${page.isPublic ? 'bg-brand-500' : 'bg-surface-4'}`}
        >
          <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${page.isPublic ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
        </button>
      </div>
    </div>
  );
}

function PreviewPage() {
  const { state } = useBuilder();
  const { page } = state;

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-accent-purple flex items-center justify-center text-2xl">
          {page.ownerAvatar}
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">{page.ownerName}</h1>
          <p className="text-xs text-gray-500">@{page.slug}</p>
          <p className="text-sm text-gray-400 mt-1">{page.bio}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {page.widgets.map((widget) => (
          <WidgetRenderer key={widget.id} widget={widget} />
        ))}
      </div>
    </div>
  );
}

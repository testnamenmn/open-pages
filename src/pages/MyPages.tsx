import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { storage } from '../utils/storage';
import { OpenPage } from '../types/schema';
import {
  Plus,
  ExternalLink,
  Trash2,
  Edit3,
  Copy,
  Check,
  Globe,
  Eye,
  EyeOff,
  Calendar,
  Layout,
} from 'lucide-react';

export default function MyPages() {
  const [pages, setPages] = useState<OpenPage[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadedPages = storage.getAllPages();
    setPages(loadedPages);
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this page? This cannot be undone.')) {
      storage.deletePage(id);
      setPages(pages.filter((p) => p.id !== id));
    }
  };

  const handleEdit = (page: OpenPage) => {
    // Load the page into the builder
    localStorage.setItem('openpages_current', JSON.stringify(page));
    navigate('/builder');
  };

  const handleCopyLink = (slug: string, id: string) => {
    const url = `https://openpages.io/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Pages</h1>
              <p className="text-gray-400">
                Manage your published Open Pages
              </p>
            </div>
            <Link
              to="/templates"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-purple rounded-lg text-sm text-white font-medium hover:opacity-90 transition-all"
            >
              <Plus size={16} />
              New Page
            </Link>
          </div>
        </motion.div>

        {/* Pages List */}
        {pages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-12 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-surface-3 flex items-center justify-center mx-auto mb-4">
              <Layout size={24} className="text-gray-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No pages yet</h2>
            <p className="text-gray-400 mb-6">
              Create your first Open Page from a template or start from scratch.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/templates"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-accent-purple rounded-xl text-white font-medium hover:opacity-90 transition-all"
              >
                <Layout size={16} />
                Browse Templates
              </Link>
              <Link
                to="/builder"
                className="flex items-center gap-2 px-6 py-3 border border-white/10 rounded-xl text-gray-300 font-medium hover:bg-white/5 transition-all"
              >
                Empty Canvas
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {pages.map((page, i) => (
              <motion.div
                key={page.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-2xl p-5 hover:border-white/15 transition-all"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-400 to-accent-purple flex items-center justify-center text-2xl shrink-0">
                    {page.ownerAvatar}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {page.ownerName}
                      </h3>
                      {page.isPublic ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-accent-green/10 rounded-full">
                          <Globe size={10} className="text-accent-green" />
                          <span className="text-[10px] text-accent-green">Public</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-white/5 rounded-full">
                          <EyeOff size={10} className="text-gray-500" />
                          <span className="text-[10px] text-gray-500">Private</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-1">
                      openpages.io/<span className="text-brand-300">{page.slug}</span>
                    </p>
                    <p className="text-sm text-gray-400 truncate mb-2">{page.bio}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Layout size={10} />
                        {page.widgets.length} widgets
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(page.updatedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopyLink(page.slug, page.id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 hover:bg-white/10 transition-all"
                      title="Copy link"
                    >
                      {copiedId === page.id ? <Check size={12} /> : <Copy size={12} />}
                      {copiedId === page.id ? 'Copied!' : 'Copy'}
                    </button>
                    <Link
                      to={`/p/${page.slug}`}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 hover:bg-white/10 transition-all"
                      title="View page"
                    >
                      <Eye size={12} />
                      View
                    </Link>
                    <button
                      onClick={() => handleEdit(page)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-brand-600/20 border border-brand-500/20 rounded-lg text-xs text-brand-300 hover:bg-brand-600/30 transition-all"
                      title="Edit page"
                    >
                      <Edit3 size={12} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(page.id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 hover:bg-red-500/20 transition-all"
                      title="Delete page"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

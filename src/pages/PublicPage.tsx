import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { storage } from '../utils/storage';
import WidgetRenderer from '../components/builder/WidgetRenderer';
import {
  ArrowLeft,
  Share2,
  Heart,
  ExternalLink,
  Calendar,
  Copy,
  Check,
} from 'lucide-react';
import { useState } from 'react';

export default function PublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  const page = slug ? storage.getPageBySlug(slug) : null;

  if (!page) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-3 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔍</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
          <p className="text-gray-400 mb-6">
            This page doesn't exist or has been removed.
          </p>
          <Link
            to="/templates"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-accent-purple rounded-xl text-white font-medium hover:opacity-90 transition-all"
          >
            <ArrowLeft size={16} />
            Browse Templates
          </Link>
        </div>
      </div>
    );
  }

  const pageUrl = `https://openpages.io/${page.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen pt-16 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Top Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLiked(!liked)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                liked
                  ? 'bg-accent-pink/10 text-accent-pink border border-accent-pink/20'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              <Heart size={12} fill={liked ? 'currentColor' : 'none'} />
              {liked ? 'Liked' : 'Like'}
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 hover:bg-white/10 transition-all"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Share'}
            </button>
          </div>
        </motion.div>

        {/* Page Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-3xl p-6 sm:p-8 mb-6"
        >
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-brand-400 to-accent-purple flex items-center justify-center text-3xl sm:text-4xl shadow-lg shadow-brand-500/20">
              {page.ownerAvatar}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                {page.ownerName}
              </h1>
              <p className="text-gray-400 text-sm mb-2">@{page.slug}</p>
              <p className="text-gray-300 text-sm">{page.bio}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  Published {new Date(page.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Widgets Grid */}
          {page.widgets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500">This page has no widgets yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {page.widgets.map((widget, i) => (
                <motion.div
                  key={widget.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <WidgetRenderer widget={widget} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-6 text-center"
        >
          <p className="text-sm text-gray-400 mb-3">
            Want to build your own Open Page?
          </p>
          <Link
            to="/templates"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-accent-purple rounded-xl text-white font-medium hover:opacity-90 transition-all"
          >
            <ExternalLink size={16} />
            Create Your Page
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

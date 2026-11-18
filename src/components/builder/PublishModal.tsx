import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBuilder } from '../../store/BuilderContext';
import { pagesApi, SlugTakenError } from '../../utils/pagesApi';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../store/AuthContext';
import { pageUrl } from '../../utils/url';
import { X, Globe, Link2, Check, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onPublished: (slug: string) => void;
}

export default function PublishModal({ isOpen, onClose, onPublished }: Props) {
  const { state, dispatch } = useBuilder();
  const { page } = state;
  const { user, loading: authLoading, signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [busy, setBusy] = useState(false);
  
  const [slug, setSlug] = useState(page.slug || '');
  const [isPublic, setIsPublic] = useState(true);
  const [seoTitle, setSeoTitle] = useState(page.seoTitle || 'My Open Page');
  const [seoDescription, setSeoDescription] = useState(page.seoDescription || '');
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    if (!email.includes('@')) {
      setError('Enter a valid email address');
      return;
    }
    setBusy(true);
    const { error: err } = await signInWithEmail(email.trim());
    setBusy(false);
    if (err) setError(err);
    else {
      setError('');
      setEmailSent(true);
    }
  };

  const handlePublish = async () => {
    if (!slug.trim()) {
      setError('Please enter a URL slug');
      return;
    }
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length < 2 || slug.length > 40) {
      setError('Slug must be 2-40 characters: lowercase letters, numbers and single hyphens');
      return;
    }

    setBusy(true);
    try {
      const saved = await pagesApi.savePage({
        ...page,
        slug,
        isPublic,
        seoTitle,
        seoDescription,
        updatedAt: new Date().toISOString(),
      });
      // Remember what was published, so the next Publish defaults to the same URL instead of the placeholder slug.
      dispatch({
        type: 'UPDATE_PAGE_INFO',
        payload: { slug: saved.slug, isPublic: saved.isPublic, seoTitle: saved.seoTitle, seoDescription: saved.seoDescription },
      });
      onPublished(saved.slug);
    } catch (e) {
      setError(e instanceof SlugTakenError ? e.message : (e as Error).message || 'Could not publish. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleSlugChange = (value: string) => {
    const sanitized = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    setSlug(sanitized);
    setError('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="glass-card rounded-2xl p-6 max-w-md w-full border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-brand-400" />
                <h2 className="text-lg font-semibold text-white">Publish Your Page</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            {isSupabaseConfigured && !authLoading && !user ? (
              <div>
                <p className="text-sm text-gray-300 mb-3">
                  Sign in to publish. We'll email you a magic link — no password needed.
                </p>
                {emailSent ? (
                  <p className="text-sm text-green-400">
                    Check your inbox for the sign-in link, then come back and press Publish.
                  </p>
                ) : (
                  <>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      placeholder="you@example.com"
                      className="w-full px-3 py-2 bg-surface-3 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500/50 mb-3"
                    />
                    {error && (
                      <div className="flex items-center gap-1.5 mb-3 text-xs text-red-400">
                        <AlertCircle size={12} />
                        {error}
                      </div>
                    )}
                    <button
                      onClick={handleSignIn}
                      disabled={busy}
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-brand-500 to-accent-purple rounded-lg text-sm text-white font-medium hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                      {busy ? 'Sending…' : 'Send magic link'}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <>
            {/* URL Slug */}
            <div className="mb-4">
              <label className="text-xs font-medium text-gray-400 mb-2 block">
                Your Page URL
              </label>
              <div className="flex items-center gap-2 p-3 bg-surface-3 rounded-lg border border-white/10">
                <span className="text-xs text-gray-500 shrink-0">{pageUrl('')}</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="your-name"
                  className="flex-1 bg-transparent text-sm text-white focus:outline-none"
                />
              </div>
              {error && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-red-400">
                  <AlertCircle size={12} />
                  {error}
                </div>
              )}
            </div>

            {/* SEO Title */}
            <div className="mb-4">
              <label className="text-xs font-medium text-gray-400 mb-2 block">
                Page Title (for SEO)
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full px-3 py-2 bg-surface-3 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500/50"
              />
            </div>

            {/* SEO Description */}
            <div className="mb-4">
              <label className="text-xs font-medium text-gray-400 mb-2 block">
                Description (for SEO)
              </label>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-surface-3 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500/50 resize-none"
                placeholder="Describe your page..."
              />
            </div>

            {/* Public Toggle */}
            <div className="flex items-center justify-between p-3 bg-surface-3/50 rounded-lg border border-white/5 mb-5">
              <div>
                <p className="text-xs font-medium text-white">Make Public</p>
                <p className="text-[10px] text-gray-500">Anyone with the link can view</p>
              </div>
              <button
                onClick={() => setIsPublic(!isPublic)}
                className={`w-9 h-5 rounded-full transition-all ${
                  isPublic ? 'bg-brand-500' : 'bg-surface-4'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                    isPublic ? 'translate-x-[18px]' : 'translate-x-[3px]'
                  }`}
                />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-surface-3 border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-surface-4 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={busy}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-500 to-accent-purple rounded-lg text-sm text-white font-medium hover:opacity-90 transition-all"
              >
                <Check size={14} />
                {busy ? 'Publishing…' : 'Publish'}
              </button>
            </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

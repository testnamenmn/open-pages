import { useState } from 'react';
import { motion } from 'framer-motion';
import { useBuilder } from '../store/BuilderContext';
import {
  Link2,
  Copy,
  Check,
  Twitter,
  Linkedin,
  Globe,
  QrCode,
  Share2,
  Eye,
  EyeOff,
  ExternalLink,
  Code,
} from 'lucide-react';

export default function Share() {
  const { state } = useBuilder();
  const { page } = state;
  const [copied, setCopied] = useState<string | null>(null);
  const [embedCode, setEmbedCode] = useState(false);

  const pageUrl = `https://openpages.io/${page.slug}`;
  const shareText = `Check out my Open Page — ${page.seoTitle}`;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;

  const embedHtml = `<iframe src="${pageUrl}" width="100%" height="600" frameborder="0" title="${page.seoTitle}"></iframe>`;

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <Share2 size={18} className="text-brand-400" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">Public Sharing</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Share Your Page</h1>
          <p className="text-gray-400">
            Get your vanity URL and share your Open Page with the world.
          </p>
        </motion.div>

        {/* Vanity URL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Globe size={16} className="text-brand-400" />
            <h3 className="text-sm font-semibold text-white">Your Vanity URL</h3>
          </div>

          <div className="flex items-center gap-2 p-3 bg-surface-3 rounded-xl border border-white/10">
            <Link2 size={14} className="text-gray-500 shrink-0" />
            <span className="text-sm text-gray-400 shrink-0">openpages.io/</span>
            <span className="text-sm text-white font-medium truncate">{page.slug}</span>
            <button
              onClick={() => handleCopy(pageUrl, 'url')}
              className="ml-auto shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-brand-600/20 text-brand-300 rounded-lg text-xs font-medium hover:bg-brand-600/30 transition-all"
            >
              {copied === 'url' ? <Check size={12} /> : <Copy size={12} />}
              {copied === 'url' ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {page.isPublic ? (
                <>
                  <Eye size={14} className="text-accent-green" />
                  <span className="text-xs text-gray-400">Public — visible to everyone</span>
                </>
              ) : (
                <>
                  <EyeOff size={14} className="text-gray-500" />
                  <span className="text-xs text-gray-400">Private — only you can see</span>
                </>
              )}
            </div>
            <a
              href={pageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-brand-300 hover:text-brand-200"
            >
              <ExternalLink size={12} />
              Open page
            </a>
          </div>
        </motion.div>

        {/* Social Sharing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6 mb-6"
        >
          <h3 className="text-sm font-semibold text-white mb-4">Share on Social</h3>

          <div className="grid grid-cols-2 gap-3">
            <a
              href={twitterShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-surface-3/50 rounded-xl border border-white/5 hover:border-white/15 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#1da1f2]/10 flex items-center justify-center">
                <Twitter size={18} className="text-[#1da1f2]" />
              </div>
              <div>
                <p className="text-sm font-medium text-white group-hover:text-[#1da1f2] transition-colors">Twitter / X</p>
                <p className="text-[10px] text-gray-500">Share with followers</p>
              </div>
            </a>

            <a
              href={linkedinShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-surface-3/50 rounded-xl border border-white/5 hover:border-white/15 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#0077b5]/10 flex items-center justify-center">
                <Linkedin size={18} className="text-[#0077b5]" />
              </div>
              <div>
                <p className="text-sm font-medium text-white group-hover:text-[#0077b5] transition-colors">LinkedIn</p>
                <p className="text-[10px] text-gray-500">Professional network</p>
              </div>
            </a>

            <button
              onClick={() => handleCopy(pageUrl, 'link')}
              className="flex items-center gap-3 p-4 bg-surface-3/50 rounded-xl border border-white/5 hover:border-white/15 transition-all group text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                {copied === 'link' ? <Check size={18} className="text-accent-green" /> : <Copy size={18} className="text-gray-400" />}
              </div>
              <div>
                <p className="text-sm font-medium text-white">Copy Link</p>
                <p className="text-[10px] text-gray-500">{copied === 'link' ? 'Copied to clipboard!' : 'Share anywhere'}</p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 bg-surface-3/50 rounded-xl border border-white/5 hover:border-white/15 transition-all group text-left">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                <QrCode size={18} className="text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">QR Code</p>
                <p className="text-[10px] text-gray-500">For print & posters</p>
              </div>
            </button>
          </div>
        </motion.div>

        {/* SEO Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-6 mb-6"
        >
          <h3 className="text-sm font-semibold text-white mb-4">SEO Preview</h3>

          {/* Google-style preview */}
          <div className="p-4 bg-surface-3 rounded-xl border border-white/5 mb-4">
            <p className="text-xs text-gray-500 mb-1">openpages.io › {page.slug}</p>
            <p className="text-base text-[#8ab4f8] hover:underline cursor-pointer mb-1">
              {page.seoTitle}
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              {page.seoDescription} — Track your progress, share your journey, and inspire others with your personalized Open Page.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Meta Title</label>
              <input
                type="text"
                defaultValue={page.seoTitle}
                className="w-full px-3 py-2 bg-surface-3 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Meta Description</label>
              <textarea
                defaultValue={page.seoDescription}
                rows={2}
                className="w-full px-3 py-2 bg-surface-3 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500/50 resize-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Embed Code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-6"
        >
          <button
            onClick={() => setEmbedCode(!embedCode)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-2">
              <Code size={16} className="text-brand-400" />
              <h3 className="text-sm font-semibold text-white">Embed on Your Site</h3>
            </div>
            <span className="text-xs text-gray-500">{embedCode ? 'Hide' : 'Show'}</span>
          </button>

          {embedCode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4"
            >
              <div className="relative">
                <pre className="p-4 bg-surface-3 rounded-lg border border-white/5 overflow-x-auto">
                  <code className="text-xs text-gray-300 font-mono">{embedHtml}</code>
                </pre>
                <button
                  onClick={() => handleCopy(embedHtml, 'embed')}
                  className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 bg-brand-600/20 text-brand-300 rounded text-[10px] font-medium"
                >
                  {copied === 'embed' ? <Check size={10} /> : <Copy size={10} />}
                  {copied === 'embed' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

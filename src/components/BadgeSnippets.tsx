import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export const badgeUrl = (slug: string, metricKey?: string) =>
  `${window.location.origin}/badge/${slug}${metricKey ? '/' + metricKey : ''}.svg`;
export const ogUrl = (slug: string) => `${window.location.origin}/og/${slug}.png`;
const pageLink = (slug: string) => `${window.location.origin}/p/${slug}`;

function CopyRow({ label, text }: { label: string; text: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1800);
    } catch {
      /* clipboard blocked: the text is selectable */
    }
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-gray-500">{label}</span>
        <button onClick={copy} className="flex items-center gap-1 text-[11px] text-brand-300 hover:underline" aria-label={`Copy ${label}`}>
          {done ? <Check size={11} /> : <Copy size={11} />} {done ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-2 bg-surface-3 border border-white/10 rounded-lg text-[11px] text-gray-300 overflow-x-auto whitespace-pre-wrap break-all">{text}</pre>
    </div>
  );
}

interface Props {
  slug: string;
  /** Metric key for a metric badge; omit for the page-level badge. */
  metricKey?: string;
  alt: string;
  /** False when the page is unpublished or private: the badge would say "not found". */
  live: boolean;
}

/** Live badge preview plus copy-paste snippets (Markdown links to the page, HTML, raw URL). */
export default function BadgeSnippets({ slug, metricKey, alt, live }: Props) {
  const img = badgeUrl(slug, metricKey);
  const link = pageLink(slug);
  const markdown = `[![${alt}](${img})](${link})`;
  const html = `<a href="${link}"><img src="${img}" alt="${alt}"></a>`;
  return (
    <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10 space-y-3" data-testid="badge-snippets">
      <div className="flex items-center gap-3 flex-wrap">
        <img src={img} alt={alt} height={20} className="h-5" data-testid="badge-preview" />
        <span className="text-[11px] text-gray-500">Updates automatically (cached up to 5 minutes).</span>
      </div>
      {!live && (
        <p className="text-[11px] text-amber-400">
          Publish this page and keep it public, otherwise the badge shows “not found”.
        </p>
      )}
      <CopyRow label="Markdown (README or bio)" text={markdown} />
      <CopyRow label="HTML" text={html} />
      <CopyRow label="Image URL" text={img} />
    </div>
  );
}

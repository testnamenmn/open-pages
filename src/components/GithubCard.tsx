import { useEffect, useRef, useState } from 'react';
import { Github, RefreshCw } from 'lucide-react';
import type { SeriesMap } from '../types/metrics';
import { timeAgo } from '../utils/metricMath';
import { GithubError } from '../utils/github';
import {
  connectGithub,
  disconnectGithub,
  githubSeries,
  githubUsername,
  isStale,
  lastSyncedAt,
  MIN_MANUAL_GAP_MS,
  syncGithub,
} from '../utils/githubSync';

interface Props {
  pageId: string;
  series: SeriesMap;
  loading: boolean;
  reload: () => Promise<void>;
}

const btn = 'min-h-11 px-4 rounded-lg text-sm border border-white/10 bg-surface-3 text-gray-200 hover:bg-surface-4 disabled:opacity-40';

export default function GithubCard({ pageId, series, loading, reload }: Props) {
  const username = githubUsername(series);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'error' | 'info'; text: string } | null>(null);
  const autoTried = useRef<string | null>(null);

  const run = async (fn: () => Promise<unknown>, okText?: string) => {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
      await reload();
      if (okText) setMsg({ kind: 'info', text: okText });
    } catch (e) {
      setMsg({ kind: 'error', text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  // Auto-refresh once per page view when the data is stale (older than 6h or never synced).
  useEffect(() => {
    if (loading || !username || autoTried.current === pageId) return;
    autoTried.current = pageId;
    if (isStale(series)) run(() => syncGithub(pageId, series));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, username, pageId]);

  const syncNow = () => {
    const last = lastSyncedAt(series);
    if (last && Date.now() - last < MIN_MANUAL_GAP_MS) {
      setMsg({ kind: 'info', text: 'Already synced a moment ago. GitHub allows only a limited number of free requests per hour.' });
      return;
    }
    run(() => syncGithub(pageId, series), 'Synced.');
  };

  const disconnect = () => {
    if (confirm(`Disconnect @${username}? This deletes the GitHub metrics and their history from this page. Widgets linked to them will go empty.`)) {
      run(() => disconnectGithub(series));
    }
  };

  const last = lastSyncedAt(series);

  return (
    <div className="glass-card rounded-xl p-4 border border-white/5" data-testid="github-card">
      <div className="flex items-center gap-2 mb-1">
        <Github size={16} className="text-brand-400" />
        <p className="text-sm font-semibold text-white">GitHub</p>
        {username && <span className="text-[11px] text-gray-500">@{username}</span>}
      </div>

      {loading ? (
        <p className="text-xs text-gray-500">Loading…</p>
      ) : !username ? (
        <>
          <p className="text-[11px] text-gray-500 mb-3">
            Pull in your public GitHub activity: pushes per day, active days (for a streak), followers, stars and repo count. No login needed.
            Only public data from roughly the last 90 days, so it won't match your profile's contribution graph exactly. It's shown on your page as
            “Public GitHub data” and is not verified.
          </p>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="GitHub username"
              autoCapitalize="none"
              autoCorrect="off"
              className="flex-1 min-w-0 min-h-11 px-3 bg-surface-3 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500/50"
            />
            <button disabled={busy || !input.trim()} onClick={() => run(() => connectGithub(pageId, input, series), 'Connected.')} className={btn}>
              {busy ? 'Connecting…' : 'Connect'}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-[11px] text-gray-500 mb-3">
            Public GitHub data for @{username} · {last ? `synced ${timeAgo(new Date(last).toISOString())}` : 'not synced yet'} · {githubSeries(series).length} metrics.
            Link widgets to “GitHub …” metrics in the builder.
          </p>
          <div className="flex gap-2 flex-wrap">
            <button onClick={syncNow} disabled={busy} className={btn + ' flex items-center gap-2'}>
              <RefreshCw size={14} className={busy ? 'animate-spin' : ''} /> {busy ? 'Syncing…' : 'Sync now'}
            </button>
            <button onClick={disconnect} disabled={busy} className={btn + ' text-red-300'}>Disconnect</button>
          </div>
        </>
      )}

      {msg && (
        <p className={`mt-3 text-xs break-words ${msg.kind === 'error' ? 'text-red-400' : 'text-green-400'}`} data-testid="github-msg">
          {msg.text}
        </p>
      )}
    </div>
  );
}

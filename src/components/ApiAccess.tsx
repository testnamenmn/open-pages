import { useEffect, useState } from 'react';
import { Copy, Check, KeyRound, AlertTriangle } from 'lucide-react';
import { apiKeys, ApiKeyInfo } from '../utils/apiKeys';
import { timeAgo } from '../utils/metricMath';

interface Props {
  pageId: string;
  /** Metric key used in the copy-paste example (falls back to "weight"). */
  exampleMetric?: string;
  /** Metrics available for the in-app key test. */
  metrics?: { key: string; label: string; kind: 'number' | 'checkin' }[];
  /** Called after a successful test entry so the screen can refresh. */
  onLogged?: () => void;
}

export default function ApiAccess({ pageId, exampleMetric, metrics = [], onLogged }: Props) {
  const [info, setInfo] = useState<ApiKeyInfo | null | undefined>(undefined); // undefined = loading
  const [fresh, setFresh] = useState<string | null>(null); // plaintext key, shown once
  const [copied, setCopied] = useState<'key' | 'curl' | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [testMetric, setTestMetric] = useState('');
  const [testValue, setTestValue] = useState('1');
  const [testResult, setTestResult] = useState<{ ok: boolean; status: number; text: string } | null>(null);
  const activeMetric = metrics.find((m) => m.key === testMetric) ?? metrics[0];

  const sendTest = async () => {
    if (!fresh || !activeMetric) return;
    setBusy(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/metric', {
        method: 'POST',
        headers: { Authorization: `Bearer ${fresh}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(activeMetric.kind === 'checkin' ? { metric: activeMetric.key } : { metric: activeMetric.key, value: Number(testValue) }),
      });
      const text = (await res.text()).slice(0, 300);
      setTestResult({ ok: res.ok, status: res.status, text });
      if (res.ok) onLogged?.();
    } catch (e) {
      setTestResult({ ok: false, status: 0, text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    setFresh(null);
    setInfo(undefined);
    apiKeys.get(pageId).then(setInfo).catch((e) => { setErr(e.message); setInfo(null); });
  }, [pageId]);

  const generate = async () => {
    if (info && !confirm('Generate a new key? The current key will stop working immediately.')) return;
    setBusy(true);
    setErr('');
    try {
      const key = await apiKeys.create(pageId);
      setFresh(key);
      setInfo(await apiKeys.get(pageId));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const revoke = async () => {
    if (!confirm('Revoke the API key? Anything using it will stop working.')) return;
    setBusy(true);
    try {
      await apiKeys.revoke(pageId);
      setFresh(null);
      setInfo(null);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const copy = async (text: string, what: 'key' | 'curl') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      /* clipboard blocked: user can select the text manually */
    }
  };

  const metric = exampleMetric || 'weight';
  const curl = `curl -X POST ${window.location.origin}/api/metric \\
  -H "Authorization: Bearer ${fresh ?? 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{"metric":"${metric}","value":72.4}'`;

  const btn = 'min-h-11 px-4 rounded-lg text-sm border border-white/10 bg-surface-3 text-gray-200 hover:bg-surface-4 disabled:opacity-40';

  return (
    <div className="glass-card rounded-xl p-4 border border-white/5" data-testid="api-access">
      <div className="flex items-center gap-2 mb-1">
        <KeyRound size={16} className="text-brand-400" />
        <p className="text-sm font-semibold text-white">API access</p>
      </div>
      <p className="text-[11px] text-gray-500 mb-3">
        Log values from scripts, Shortcuts or automations. One key per page; it can only add entries to this page's metrics.
      </p>

      {info === undefined ? (
        <p className="text-xs text-gray-500">Loading…</p>
      ) : (
        <>
          {info && !fresh && (
            <p className="text-xs text-gray-300 mb-3">
              Active key <code className="text-brand-300">{info.prefix}…</code> · created {timeAgo(info.createdAt)} ·{' '}
              {info.lastUsedAt ? `last used ${timeAgo(info.lastUsedAt)}` : 'never used'}
            </p>
          )}

          {fresh && (
            <div className="mb-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <p className="flex items-center gap-1.5 text-xs text-amber-300 mb-2">
                <AlertTriangle size={12} /> Copy this key now. For security it is shown only once.
              </p>
              <div className="flex gap-2">
                <input readOnly value={fresh} onFocus={(e) => e.currentTarget.select()} aria-label="New API key"
                  className="flex-1 min-w-0 min-h-11 px-3 bg-surface-3 border border-white/10 rounded-lg text-xs text-white font-mono" />
                <button onClick={() => copy(fresh, 'key')} className={btn} aria-label="Copy key">
                  {copied === 'key' ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          )}

          {fresh && metrics.length > 0 && (
            <div className="mb-3 p-3 rounded-lg bg-white/5 border border-white/10" data-testid="key-test">
              <p className="text-xs text-gray-300 mb-2">
                <strong className="text-white">Test this key now</strong> — sends one real entry through the API using the key above, no typing needed.
                Delete the entry afterwards if you like.
              </p>
              <div className="flex gap-2 mb-2">
                <select value={activeMetric?.key} onChange={(e) => setTestMetric(e.target.value)}
                  className="flex-1 min-w-0 min-h-11 px-2 bg-surface-3 border border-white/10 rounded-lg text-xs text-white">
                  {metrics.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
                </select>
                {activeMetric?.kind === 'number' && (
                  <input inputMode="decimal" value={testValue} onChange={(e) => setTestValue(e.target.value)} aria-label="Test value"
                    className="w-24 min-h-11 px-2 bg-surface-3 border border-white/10 rounded-lg text-xs text-white" />
                )}
              </div>
              <button onClick={sendTest} disabled={busy || (activeMetric?.kind === 'number' && Number.isNaN(Number(testValue)))} className={btn + ' w-full'}>
                Send test entry
              </button>
              {testResult && (
                <p className={`mt-2 text-xs break-words ${testResult.ok ? 'text-green-400' : 'text-red-400'}`} data-testid="test-result">
                  {testResult.ok ? '✓ Worked' : '✗ Failed'} · HTTP {testResult.status || 'no response'}
                  <code className="block mt-1 text-[10px] text-gray-400 whitespace-pre-wrap">{testResult.text}</code>
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <button onClick={generate} disabled={busy} className={btn}>{info ? 'Regenerate key' : 'Generate API key'}</button>
            {info && <button onClick={revoke} disabled={busy} className={btn + ' text-red-300'}>Revoke</button>}
          </div>

          {info && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] text-gray-500">Example</p>
                <button onClick={() => copy(curl, 'curl')} className="text-[11px] text-brand-300 hover:underline">
                  {copied === 'curl' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="p-3 bg-surface-3 border border-white/10 rounded-lg text-[11px] text-gray-300 overflow-x-auto whitespace-pre">{curl}</pre>
              <p className="text-[10px] text-gray-600 mt-2">
                <code>metric</code> is the metric's key (its name in lowercase with hyphens, e.g. “Read 30m” → read-30m).
                Check-ins don't need a value. Optional <code>ts</code> backdates an entry (ISO date). Limit: 60 requests/minute.
              </p>
            </div>
          )}
        </>
      )}
      {err && <p className="text-xs text-red-400 mt-2">{err}</p>}
    </div>
  );
}

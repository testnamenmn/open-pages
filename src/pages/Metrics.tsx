import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { pagesApi } from '../utils/pagesApi';
import { metricsApi } from '../utils/metricsApi';
import { useSeries } from '../hooks/useSeries';
import { dayKey, formatValue, timeAgo, currentStreak } from '../utils/metricMath';
import { slugifyKey, MetricKind, MetricSeries } from '../types/metrics';
import type { OpenPage } from '../types/schema';

const inputCls =
  'w-full min-h-11 px-3 py-2 bg-surface-3 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500/50';
const btnCls =
  'min-h-11 px-4 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-brand-500 to-accent-purple hover:opacity-90 disabled:opacity-40 transition-all';

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen pt-20 pb-12 px-4">
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Metrics</h1>
      <p className="text-sm text-gray-400 mb-6">Log values from your phone or laptop. Your public page updates automatically.</p>
      {children}
    </div>
  </div>
);

export default function Metrics() {
  const { user, loading: authLoading, signInWithEmail } = useAuth();
  const [pages, setPages] = useState<OpenPage[] | null>(null);
  const [pageId, setPageId] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    pagesApi
      .listMyPages()
      .then((list) => {
        setPages(list);
        setPageId((cur) => cur || list[0]?.dbId || '');
      })
      .catch(() => setPages([]));
  }, [user]);

  if (!isSupabaseConfigured) {
    return (
      <Shell>
        <p className="text-sm text-gray-400">Metrics need the Supabase backend. See the README for setup.</p>
      </Shell>
    );
  }
  if (authLoading) return <Shell>{null}</Shell>;
  if (!user) return <Shell><SignIn onSignIn={signInWithEmail} /></Shell>;
  if (pages === null) return <Shell><p className="text-sm text-gray-500">Loading…</p></Shell>;
  if (pages.length === 0) {
    return (
      <Shell>
        <div className="glass-card rounded-xl p-5 border border-white/5">
          <p className="text-sm text-gray-300 mb-3">You need a published page before you can track metrics.</p>
          <Link to="/templates" className={btnCls + ' inline-flex items-center'}>Create a page</Link>
        </div>
      </Shell>
    );
  }

  const current = pages.find((p) => p.dbId === pageId) ?? pages[0];
  return (
    <Shell>
      {pages.length > 1 && (
        <select value={current.dbId} onChange={(e) => setPageId(e.target.value)} className={inputCls + ' mb-4'}>
          {pages.map((p) => (
            <option key={p.dbId} value={p.dbId}>{p.ownerName} — /p/{p.slug}</option>
          ))}
        </select>
      )}
      <PageMetrics key={current.dbId} page={current} />
    </Shell>
  );
}

function SignIn({ onSignIn }: { onSignIn: (email: string) => Promise<{ error?: string }> }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');
  return (
    <div className="glass-card rounded-xl p-5 border border-white/5">
      <p className="text-sm text-gray-300 mb-3">Sign in with a magic link to manage your metrics.</p>
      {sent ? (
        <p className="text-sm text-green-400">Check your inbox, then return to this page.</p>
      ) : (
        <>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls + ' mb-3'} />
          {err && <p className="text-xs text-red-400 mb-3">{err}</p>}
          <button
            className={btnCls + ' w-full'}
            onClick={async () => {
              const { error } = await onSignIn(email.trim());
              error ? setErr(error) : setSent(true);
            }}
          >
            Send magic link
          </button>
        </>
      )}
    </div>
  );
}

function PageMetrics({ page }: { page: OpenPage }) {
  const { series, loading, reload } = useSeries(page.dbId);
  const [label, setLabel] = useState('');
  const [kind, setKind] = useState<MetricKind>('number');
  const [unit, setUnit] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const create = async () => {
    const key = slugifyKey(label);
    if (!key) return setError('Give the metric a name');
    setBusy(true);
    setError('');
    try {
      await metricsApi.createMetric({ pageId: page.dbId!, key, label: label.trim(), kind, unit: kind === 'number' ? unit.trim() : '' });
      setLabel('');
      setUnit('');
      await reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const list = Object.values(series).sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className="space-y-4">
      {loading && <p className="text-sm text-gray-500">Loading…</p>}
      {list.map((m) => (
        <MetricCard key={m.id} metric={m} onChange={reload} />
      ))}
      {!loading && list.length === 0 && (
        <p className="text-sm text-gray-500">No metrics yet. Create your first one below.</p>
      )}

      <div className="glass-card rounded-xl p-4 border border-white/5">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">New metric</p>
        <div className="space-y-3">
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Weight, Books read, Run" className={inputCls} />
          <div className="flex gap-2">
            {(['number', 'checkin'] as MetricKind[]).map((k) => (
              <button
                key={k}
                onClick={() => setKind(k)}
                className={`flex-1 min-h-11 rounded-lg text-sm border ${kind === k ? 'bg-brand-500/20 border-brand-500/50 text-white' : 'bg-surface-3 border-white/10 text-gray-400'}`}
              >
                {k === 'number' ? 'Number over time' : 'Daily check-in'}
              </button>
            ))}
          </div>
          {kind === 'number' && <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Unit (optional): kg, km, pages" className={inputCls} />}
          {error && (
            <p className="flex items-center gap-1.5 text-xs text-red-400"><AlertCircle size={12} />{error}</p>
          )}
          <button onClick={create} disabled={busy} className={btnCls + ' w-full flex items-center justify-center gap-2'}>
            <Plus size={16} /> Add metric
          </button>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ metric, onChange }: { metric: MetricSeries; onChange: () => Promise<void> }) {
  const today = dayKey(new Date());
  const [value, setValue] = useState('');
  const [date, setDate] = useState(today);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const recent = [...metric.points].reverse().slice(0, 5);
  const checkedToday = metric.kind === 'checkin' && metric.points.some((p) => dayKey(p.ts) === today);

  // Today → "now"; another day → noon local time on that day.
  const tsFor = (d: string) => (d === today ? undefined : new Date(`${d}T12:00:00`));

  const log = async (v: number) => {
    setBusy(true);
    setErr('');
    try {
      await metricsApi.logPoint(metric.id, v, tsFor(date));
      setValue('');
      await onChange();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="glass-card rounded-xl p-4 border border-white/5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-white">{metric.label}</p>
          <p className="text-[11px] text-gray-500">
            {metric.kind === 'checkin' ? `Check-in · streak ${currentStreak(metric)} days` : `Number${metric.unit ? ' · ' + metric.unit : ''}`}
            {' · '}{metric.points.length} entries
          </p>
        </div>
        <button
          aria-label={`Delete ${metric.label}`}
          onClick={async () => {
            if (confirm(`Delete "${metric.label}" and all its entries?`)) {
              await metricsApi.deleteMetric(metric.id);
              await onChange();
            }
          }}
          className="p-2 text-gray-500 hover:text-red-400"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex gap-2 mb-2">
        {metric.kind === 'number' ? (
          <>
            <input
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={metric.unit || 'Value'}
              className={inputCls}
            />
            <button
              disabled={busy || value.trim() === '' || Number.isNaN(Number(value))}
              onClick={() => log(Number(value))}
              className={btnCls}
            >
              Log
            </button>
          </>
        ) : (
          <button disabled={busy || (checkedToday && date === today)} onClick={() => log(1)} className={btnCls + ' w-full flex items-center justify-center gap-2'}>
            <Check size={16} /> {checkedToday && date === today ? 'Done today' : 'Mark done'}
          </button>
        )}
      </div>
      <label className="flex items-center gap-2 text-[11px] text-gray-500">
        Date
        <input type="date" value={date} max={today} onChange={(e) => setDate(e.target.value || today)} className="bg-surface-3 border border-white/10 rounded px-2 py-1 text-xs text-gray-300" />
      </label>
      {err && <p className="text-xs text-red-400 mt-2">{err}</p>}

      {recent.length > 0 && (
        <ul className="mt-3 divide-y divide-white/5">
          {recent.map((p) => (
            <li key={p.id} className="flex items-center justify-between py-1.5 text-xs">
              <span className="text-gray-300">
                {metric.kind === 'checkin' ? '✓ done' : `${formatValue(p.value)}${metric.unit ? ' ' + metric.unit : ''}`}
              </span>
              <span className="flex items-center gap-3 text-gray-600">
                {timeAgo(p.ts)}
                <button aria-label="Delete entry" className="hover:text-red-400" onClick={async () => { await metricsApi.deletePoint(p.id!); await onChange(); }}>
                  <Trash2 size={12} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

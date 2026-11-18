/**
 * Public sharing endpoints (one function, three kinds), reached through rewrites in vercel.json:
 *
 *   /badge/:slug/:metric.svg   → kind=badge   SVG badge for READMEs and bios
 *   /badge/:slug.svg           → kind=badge   page-level badge
 *   /og/:slug.png              → kind=og      1200×630 link-preview image
 *   /p/:slug  (crawlers only)  → kind=page    tiny HTML page with Open Graph / Twitter tags
 *
 * Only public data is used: everything is read with the public anon key, so Postgres row level
 * security decides what is visible (private pages simply look "not found"). No secrets involved.
 */

interface Req {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  query: Record<string, string | string[] | undefined>;
}
interface Res {
  status(code: number): Res;
  setHeader(name: string, value: string): Res;
  send(body: string | Uint8Array): void;
}

// ---- small helpers ----------------------------------------------------------------------

const KEY_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const one = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v) ?? '';
const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const clip = (s: string, n: number): string => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);
const safeColor = (c: string | undefined, fallback: string): string => {
  const v = (c ?? '').replace(/^#/, '');
  return /^[0-9a-fA-F]{6}$|^[0-9a-fA-F]{3}$/.test(v) ? '#' + v : fallback;
};
const formatValue = (n: number): string => (Math.abs(n) >= 1000 ? n.toLocaleString('en-US') : String(Math.round(n * 100) / 100));

interface PageRow {
  id: string;
  slug: string;
  is_public: boolean;
  updated_at: string;
  data: {
    ownerName?: string;
    bio?: string;
    seoTitle?: string;
    seoDescription?: string;
    theme?: { accentColor?: string };
    widgets?: { id: string; type: string; config: Record<string, unknown> }[];
  };
}
interface Point {
  ts: string;
  value: number;
}
interface MetricRow {
  key: string;
  label: string;
  kind: 'number' | 'checkin';
  unit: string;
  metric_points: Point[];
}

async function rest<T>(path: string): Promise<T> {
  const base = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;
  if (!base || !anon) throw new Error('not_configured');
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 6000);
  try {
    const r = await fetch(`${base.replace(/\/$/, '')}/rest/v1/${path}`, { headers: { apikey: anon, Authorization: `Bearer ${anon}` }, signal: ctl.signal });
    if (!r.ok) throw new Error(`upstream_${r.status}`);
    return (await r.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

async function loadPage(slug: string): Promise<PageRow | null> {
  const rows = await rest<PageRow[]>(`pages?slug=eq.${encodeURIComponent(slug)}&select=id,slug,is_public,updated_at,data&limit=1`);
  const row = rows[0];
  return row && row.is_public ? row : null; // private pages are never shown, even if RLS lets the owner through
}

async function loadMetrics(pageId: string, key?: string): Promise<MetricRow[]> {
  const filter = key ? `&key=eq.${encodeURIComponent(key)}` : '';
  return rest<MetricRow[]>(
    `metrics?page_id=eq.${encodeURIComponent(pageId)}${filter}&select=key,label,kind,unit,metric_points(ts,value)` +
      `&metric_points.order=ts.desc&metric_points.limit=400`
  );
}

const latest = (m: MetricRow): Point | undefined => m.metric_points[0]; // points arrive newest-first

/** Current streak in UTC days; alive if there is a check-in today or yesterday. */
function streakUtc(m: MetricRow, now = new Date()): number {
  const day = (d: Date) => d.toISOString().slice(0, 10);
  const days = new Set(m.metric_points.filter((p) => p.value > 0).map((p) => day(new Date(p.ts))));
  const cur = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (!days.has(day(cur))) cur.setUTCDate(cur.getUTCDate() - 1);
  let n = 0;
  while (days.has(day(cur))) {
    n++;
    cur.setUTCDate(cur.getUTCDate() - 1);
  }
  return n;
}

function describe(m: MetricRow): string {
  if (m.kind === 'checkin') {
    const n = streakUtc(m);
    return `${n} day${n === 1 ? '' : 's'}`;
  }
  const p = latest(m);
  return p ? `${formatValue(p.value)}${m.unit ? ' ' + m.unit : ''}` : 'no data';
}

function origin(req: Req): string {
  const host = one(req.headers['x-forwarded-host']) || one(req.headers.host) || 'localhost';
  const proto = one(req.headers['x-forwarded-proto']) || (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

// ---- badge ---------------------------------------------------------------------------------

/** Rough text width in px for 11px Verdana-ish text (good enough for badge layout). */
function textWidth(s: string): number {
  let w = 0;
  for (const ch of s) {
    if ('iljt.,:;!|\'` '.includes(ch)) w += 3.4;
    else if ('mwMW@%'.includes(ch)) w += 9.6;
    else if (ch >= 'A' && ch <= 'Z') w += 7.4;
    else w += 6.4;
  }
  return Math.ceil(w);
}

export function badgeSvg(label: string, value: string, color: string, style: 'flat' | 'flat-square'): string {
  const lw = textWidth(label) + 12;
  const rw = textWidth(value) + 12;
  const w = lw + rw;
  const rx = style === 'flat' ? 3 : 0;
  const L = esc(label);
  const V = esc(value);
  const lx = lw / 2;
  const rxm = lw + rw / 2;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="20" role="img" aria-label="${L}: ${V}">` +
    `<title>${L}: ${V}</title>` +
    `<linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>` +
    `<clipPath id="r"><rect width="${w}" height="20" rx="${rx}" fill="#fff"/></clipPath>` +
    `<g clip-path="url(#r)"><rect width="${lw}" height="20" fill="#555"/><rect x="${lw}" width="${rw}" height="20" fill="${color}"/><rect width="${w}" height="20" fill="url(#s)"/></g>` +
    `<g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">` +
    `<text x="${lx}" y="15" fill="#010101" fill-opacity=".3">${L}</text><text x="${lx}" y="14">${L}</text>` +
    `<text x="${rxm}" y="15" fill="#010101" fill-opacity=".3">${V}</text><text x="${rxm}" y="14">${V}</text></g></svg>`
  );
}

async function handleBadge(req: Req, res: Res): Promise<void> {
  const slug = one(req.query.slug).toLowerCase();
  const metricKey = one(req.query.metric).toLowerCase();
  const style = one(req.query.style) === 'flat-square' ? 'flat-square' : 'flat';
  const brand = safeColor(one(req.query.color), '#5c7cfa');
  const customLabel = one(req.query.label).replace(/[\u0000-\u001f]/g, '').slice(0, 30);

  const send = (label: string, value: string, color: string, cache: string) => {
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', cache);
    res.status(200).send(badgeSvg(label, value, color, style));
  };
  const OK = 'public, max-age=300, s-maxage=300, stale-while-revalidate=600';
  const SHORT = 'public, max-age=60, s-maxage=60';

  if (!KEY_RE.test(slug) || slug.length < 2 || slug.length > 40 || (metricKey && (!KEY_RE.test(metricKey) || metricKey.length > 40))) {
    return send('open pages', 'invalid link', '#9ca3af', SHORT);
  }
  try {
    const page = await loadPage(slug);
    if (!page) return send('open pages', 'not found', '#9ca3af', SHORT);
    if (!metricKey) return send(customLabel || 'open pages', `@${page.slug}`, brand, OK);
    const [m] = await loadMetrics(page.id, metricKey);
    if (!m) return send(customLabel || 'open pages', 'metric not found', '#9ca3af', SHORT);
    const label = customLabel || (m.kind === 'checkin' ? `${m.label} streak` : m.label);
    return send(label, describe(m), brand, OK);
  } catch {
    return send('open pages', 'unavailable', '#9ca3af', SHORT);
  }
}

// ---- highlights (shared by og + page) --------------------------------------------------------

export interface Highlight {
  title: string;
  value: string;
}

const NUMERIC = new Set(['counter', 'stat_number', 'streak', 'progress']);

/** Same rule as the app's "Sample data" label (src/utils/sample.ts), kept inline so the function is self-contained. */
function isSample(w: { id: string; type: string; config: Record<string, unknown> }): boolean {
  if (!NUMERIC.has(w.type)) return false;
  if (typeof w.config.metricKey === 'string' && w.config.metricKey) return false;
  if (w.config.sample === false) return false;
  return w.config.sample === true || w.id.startsWith('tpl_');
}

export function pickHighlights(page: PageRow, metrics: MetricRow[], max = 3): Highlight[] {
  const byKey = new Map(metrics.map((m) => [m.key, m]));
  const out: Highlight[] = [];
  for (const w of page.data.widgets ?? []) {
    if (out.length >= max) break;
    if (!NUMERIC.has(w.type) || isSample(w)) continue;
    const title = clip(String(w.config.title ?? ''), 28);
    if (!title) continue;
    const key = typeof w.config.metricKey === 'string' ? w.config.metricKey : '';
    let value: string | null = null;
    if (key) {
      const m = byKey.get(key);
      if (!m || (m.kind === 'number' && !latest(m))) continue; // linked but no data: show nothing, never a placeholder
      if (w.type === 'streak' && m.kind === 'checkin') value = `${streakUtc(m)} days`;
      else if (w.type === 'progress' && m.kind === 'number') value = `${formatValue(latest(m)!.value)} / ${formatValue(Number(w.config.target) || 100)}`;
      else value = describe(m);
    } else if (w.type === 'streak') value = `${Number(w.config.currentDays) || 0} ${String(w.config.unit || 'days')}`;
    else if (w.type === 'progress') value = `${formatValue(Number(w.config.current) || 0)} / ${formatValue(Number(w.config.target) || 100)}`;
    else value = `${typeof w.config.value === 'number' ? formatValue(w.config.value) : String(w.config.value ?? '')}${w.config.unit ? ' ' + String(w.config.unit) : ''}`.trim();
    if (value) out.push({ title, value: clip(value, 18) });
  }
  return out;
}

// ---- og image --------------------------------------------------------------------------------

let fontCache: { name: string; data: Buffer; weight: 400 | 700; style: 'normal' }[] | null = null;
async function fonts() {
  if (fontCache) return fontCache;
  const { readFile } = await import('node:fs/promises');
  const [regular, bold] = await Promise.all([
    readFile(new URL('./_fonts/inter-400.woff', import.meta.url)),
    readFile(new URL('./_fonts/inter-700.woff', import.meta.url)),
  ]);
  fontCache = [
    { name: 'Inter', data: regular, weight: 400, style: 'normal' },
    { name: 'Inter', data: bold, weight: 700, style: 'normal' },
  ];
  return fontCache;
}

type El = { type: string; props: { style?: Record<string, unknown>; children?: unknown } };
const el = (style: Record<string, unknown>, children?: unknown): El => ({ type: 'div', props: { style: { display: 'flex', ...style }, children } });

const initials = (name: string, slug: string): string => {
  const parts = name.replace(/[^\p{L}\p{N} ]/gu, '').trim().split(/\s+/).filter(Boolean);
  const s = parts.length > 1 ? parts[0][0] + parts[1][0] : (parts[0] ?? slug).slice(0, 2);
  return s.toUpperCase();
};

/*
 * Layout note: satori sizes boxes by CONTENT (padding is added on top, like CSS content-box), so
 * every padded box below has explicit pixel sizes that already subtract its own padding.
 * Canvas 1200×630 = outer padding 64/56 → content area 1072×518.
 */
const W = 1200;
const H = 630;
const PAD_X = 64;
const PAD_Y = 56;
const INNER_W = W - PAD_X * 2; // 1072
const INNER_H = H - PAD_Y * 2; // 518

export function ogElement(page: PageRow, highlights: Highlight[], host: string): El {
  const accent = safeColor(page.data.theme?.accentColor, '#5c7cfa');
  const name = clip((page.data.ownerName || page.slug).trim(), 34);
  const bio = clip((page.data.bio || page.data.seoDescription || '').trim(), 130);

  const gap = 20;
  const n = Math.max(1, highlights.length);
  const tileOuter = Math.floor((INNER_W - gap * (n - 1)) / n);
  const tilePadX = 28;
  const tilePadY = 22;
  const tiles = highlights.map((h, i) =>
    el(
      { width: tileOuter - tilePadX * 2, flexDirection: 'column', padding: `${tilePadY}px ${tilePadX}px`, marginLeft: i === 0 ? 0 : gap, borderRadius: 20, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' },
      [el({ fontSize: 52, fontWeight: 700, color: accent, lineHeight: 1.1 }, h.value), el({ fontSize: 24, color: '#9ca3af', marginTop: 8 }, h.title)]
    )
  );

  const header = el({ flexDirection: 'column', width: INNER_W }, [
    el({ alignItems: 'center' }, [
      el({ width: 96, height: 96, borderRadius: 48, background: accent, alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 700, marginRight: 28 }, initials(page.data.ownerName ?? '', page.slug)),
      el({ flexDirection: 'column' }, [el({ fontSize: 60, fontWeight: 700, lineHeight: 1.1 }, name), el({ fontSize: 28, color: '#9ca3af', marginTop: 6 }, `@${page.slug}`)]),
    ]),
    ...(bio ? [el({ fontSize: 30, color: '#d1d5db', marginTop: 28, lineHeight: 1.35, width: 1000 }, bio)] : []),
  ]);
  const middle = tiles.length ? el({ width: INNER_W }, tiles) : el({ width: INNER_W, fontSize: 28, color: '#9ca3af' }, 'Personal metrics, shared openly.');
  const footer = el({ width: INNER_W, justifyContent: 'space-between', alignItems: 'center', fontSize: 24, color: '#9ca3af' }, [
    el({ fontWeight: 700, color: '#ffffff' }, 'Open Pages'),
    el({}, clip(`${host}/p/${page.slug}`, 60)),
  ]);

  return el(
    { width: W, height: H, background: 'linear-gradient(135deg,#0f111a 0%,#1a1d3a 60%,#262b55 100%)', color: '#ffffff', fontFamily: 'Inter' },
    [el({ width: INNER_W, height: INNER_H, padding: `${PAD_Y}px ${PAD_X}px`, flexDirection: 'column', justifyContent: 'space-between' }, [header, middle, footer])]
  );
}

async function handleOg(req: Req, res: Res): Promise<void> {
  const slug = one(req.query.slug).toLowerCase();
  const fail = (code: number, msg: string) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');
    res.status(code).send(msg);
  };
  if (!KEY_RE.test(slug) || slug.length < 2 || slug.length > 40) return fail(400, 'invalid slug');
  try {
    const page = await loadPage(slug);
    if (!page) return fail(404, 'not found');
    const metrics = await loadMetrics(page.id);
    const host = origin(req).replace(/^https?:\/\//, '');
    const [{ default: satori }, { Resvg }, fontList] = await Promise.all([import('satori'), import('@resvg/resvg-js'), fonts()]);
    const svg = await satori(ogElement(page, pickHighlights(page, metrics), host) as never, { width: 1200, height: 630, fonts: fontList });
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(png);
  } catch {
    fail(502, 'could not render preview');
  }
}

// ---- crawler HTML ------------------------------------------------------------------------------

export function pageHtml(page: PageRow | null, slug: string, base: string, highlights: Highlight[]): string {
  const url = `${base}/p/${slug}`;
  const title = page ? (page.data.seoTitle || `${page.data.ownerName || page.slug} on Open Pages`).trim() : 'Open Pages';
  const desc = page
    ? (page.data.seoDescription || page.data.bio || `${page.data.ownerName || page.slug}'s personal metrics, shared openly.`).trim()
    : 'Build and share a personal dashboard of your metrics.';
  const image = page ? `${base}/og/${slug}.png?v=${new Date(page.updated_at).getTime() || 0}` : '';
  const t = esc(clip(title, 90));
  const d = esc(clip(desc, 200));
  const meta = [
    `<title>${t}</title>`,
    `<meta name="description" content="${d}">`,
    `<link rel="canonical" href="${esc(url)}">`,
    `<meta property="og:site_name" content="Open Pages">`,
    `<meta property="og:type" content="profile">`,
    `<meta property="og:title" content="${t}">`,
    `<meta property="og:description" content="${d}">`,
    `<meta property="og:url" content="${esc(url)}">`,
    ...(image
      ? [
          `<meta property="og:image" content="${esc(image)}">`,
          `<meta property="og:image:type" content="image/png">`,
          `<meta property="og:image:width" content="1200">`,
          `<meta property="og:image:height" content="630">`,
          `<meta property="og:image:alt" content="${t}">`,
          `<meta name="twitter:card" content="summary_large_image">`,
          `<meta name="twitter:image" content="${esc(image)}">`,
        ]
      : [`<meta name="twitter:card" content="summary">`]),
    `<meta name="twitter:title" content="${t}">`,
    `<meta name="twitter:description" content="${d}">`,
    ...(page ? [] : ['<meta name="robots" content="noindex">']),
  ].join('\n');
  const items = highlights.map((h) => `<li>${esc(h.title)}: ${esc(h.value)}</li>`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">\n${meta}\n</head><body><h1>${t}</h1><p>${d}</p>${items ? `<ul>${items}</ul>` : ''}<p><a href="${esc(url)}">${esc(url)}</a></p></body></html>`;
}

async function handlePage(req: Req, res: Res): Promise<void> {
  const slug = one(req.query.slug).toLowerCase();
  const base = origin(req);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=300');
  if (!KEY_RE.test(slug) || slug.length < 2 || slug.length > 40) {
    res.status(200).send(pageHtml(null, 'x', base, []));
    return;
  }
  try {
    const page = await loadPage(slug);
    const highlights = page ? pickHighlights(page, await loadMetrics(page.id)) : [];
    res.status(200).send(pageHtml(page, slug, base, highlights));
  } catch {
    res.status(200).send(pageHtml(null, slug, base, [])); // never fail a crawler hard
  }
}

export default async function handler(req: Req, res: Res): Promise<void> {
  const kind = one(req.query.kind);
  if (kind === 'badge') return handleBadge(req, res);
  if (kind === 'og') return handleOg(req, res);
  if (kind === 'page') return handlePage(req, res);
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.status(404).send('not found');
}

/**
 * POST /api/metric — log a value with a per-page API key.
 *
 *   curl -X POST https://YOUR-SITE/api/metric \
 *     -H "Authorization: Bearer op_..." -H "Content-Type: application/json" \
 *     -d '{"metric":"weight","value":72.4}'
 *
 * Body: { metric: string (the metric's key, e.g. "weight"), value?: number, ts?: ISO-8601 string }
 * `value` is optional for check-in metrics (defaults to 1).
 *
 * This function never sees a Supabase service key: it calls the log_metric_with_key() database
 * function with the public anon key, and that function validates the API key itself.
 */

interface Req {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}
interface Res {
  status(code: number): Res;
  setHeader(name: string, value: string): Res;
  json(body: unknown): void;
  end(): void;
}

const STATUS_MAP: Record<string, { http: number; message: string }> = {
  invalid_key: { http: 401, message: 'Invalid API key.' },
  metric_not_found: { http: 404, message: 'No metric with that key on this page. Create it in the Metrics screen first.' },
  bad_value: { http: 400, message: 'Invalid value or timestamp. Check-ins need a positive value; timestamps cannot be in the future.' },
  rate_limited: { http: 429, message: 'Rate limit exceeded (60 requests per minute per key).' },
  limit_reached: { http: 409, message: 'This metric has reached its limit of 5000 entries.' },
};

const header = (req: Req, name: string): string | undefined => {
  const v = req.headers[name];
  return Array.isArray(v) ? v[0] : v;
};

export default async function handler(req: Req, res: Res): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-API-Key');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    res.status(405).json({ error: 'method_not_allowed', message: 'Use POST.' });
    return;
  }

  // --- API key -------------------------------------------------------------
  const auth = header(req, 'authorization') ?? '';
  const key = (auth.startsWith('Bearer ') ? auth.slice(7) : header(req, 'x-api-key') ?? '').trim();
  if (!key) {
    res.status(401).json({ error: 'invalid_key', message: 'Send your key as "Authorization: Bearer <key>".' });
    return;
  }

  // --- Body ----------------------------------------------------------------
  let body: unknown = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = undefined;
    }
  }
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;

  const metric = typeof b.metric === 'string' ? b.metric.trim().toLowerCase() : '';
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(metric) || metric.length > 40) {
    res.status(400).json({ error: 'bad_request', message: '"metric" is required: the metric key, e.g. "weight" or "read-30m".' });
    return;
  }

  let value: number | null = null;
  if (b.value !== undefined && b.value !== null) {
    const n = typeof b.value === 'string' && b.value.trim() !== '' ? Number(b.value) : b.value;
    if (typeof n !== 'number' || !Number.isFinite(n)) {
      res.status(400).json({ error: 'bad_request', message: '"value" must be a number.' });
      return;
    }
    value = n;
  }

  let ts: string | null = null;
  if (b.ts !== undefined && b.ts !== null) {
    const d = typeof b.ts === 'string' ? new Date(b.ts) : new Date(NaN);
    if (Number.isNaN(d.getTime())) {
      res.status(400).json({ error: 'bad_request', message: '"ts" must be an ISO-8601 date string.' });
      return;
    }
    ts = d.toISOString();
  }

  // --- Call the database function -----------------------------------------
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    res.status(500).json({ error: 'server_misconfigured', message: 'Supabase environment variables are not set on the server.' });
    return;
  }

  let rpc: Response;
  try {
    rpc = await fetch(`${url.replace(/\/$/, '')}/rest/v1/rpc/log_metric_with_key`, {
      method: 'POST',
      headers: { apikey: anon, Authorization: `Bearer ${anon}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_key: key, p_metric: metric, p_value: value, p_ts: ts }),
    });
  } catch {
    res.status(502).json({ error: 'upstream_unreachable', message: 'Could not reach the database. Try again.' });
    return;
  }

  if (!rpc.ok) {
    res.status(502).json({ error: 'upstream_error', message: 'The database rejected the request.' });
    return;
  }

  const result = (await rpc.json()) as { status?: string; metric?: string; value?: number };
  if (result.status === 'ok') {
    res.status(201).json({ ok: true, metric: result.metric, value: result.value });
    return;
  }
  const mapped = STATUS_MAP[result.status ?? ''];
  if (mapped) {
    res.status(mapped.http).json({ error: result.status, message: mapped.message });
    return;
  }
  res.status(500).json({ error: 'unknown', message: 'Unexpected response from the database.' });
}

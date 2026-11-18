import { supabase } from '../lib/supabase';

export interface ApiKeyInfo {
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
}

const toHex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
const toBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/** SHA-256 hex of the key; must match the hash computed inside log_metric_with_key(). */
export const hashKey = async (key: string): Promise<string> =>
  toHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key)));

export const generateKey = (): string => 'op_' + toBase64Url(crypto.getRandomValues(new Uint8Array(32)));

export const apiKeys = {
  async get(pageId: string): Promise<ApiKeyInfo | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('page_api_keys')
      .select('key_prefix,created_at,last_used_at')
      .eq('page_id', pageId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? { prefix: data.key_prefix, createdAt: data.created_at, lastUsedAt: data.last_used_at } : null;
  },

  /** Creates (or replaces) the page's key. Returns the plaintext key, which is never stored. */
  async create(pageId: string): Promise<string> {
    if (!supabase) throw new Error('Supabase is not configured');
    const key = generateKey();
    const { error } = await supabase.from('page_api_keys').upsert(
      {
        page_id: pageId,
        key_hash: await hashKey(key),
        key_prefix: key.slice(0, 8),
        created_at: new Date().toISOString(),
        last_used_at: null,
        window_start: null,
        window_count: 0,
      },
      { onConflict: 'page_id' }
    );
    if (error) throw new Error(error.message);
    return key;
  },

  async revoke(pageId: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('page_api_keys').delete().eq('page_id', pageId);
    if (error) throw new Error(error.message);
  },
};

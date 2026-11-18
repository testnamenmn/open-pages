import type { OpenPage } from '../types/schema';
import { supabase } from '../lib/supabase';
import { storage } from './storage';

/**
 * Async persistence layer for published pages.
 * Uses Supabase when configured; otherwise falls back to localStorage (local-only demo mode).
 */

export class SlugTakenError extends Error {
  constructor() {
    super('This URL is already taken. Try a different slug.');
  }
}

interface PageRow {
  id: string;
  client_id: string;
  slug: string;
  is_public: boolean;
  data: OpenPage;
  created_at: string;
  updated_at: string;
}

function fromRow(row: PageRow): OpenPage {
  return {
    ...row.data,
    id: row.client_id,
    dbId: row.id,
    slug: row.slug,
    isPublic: row.is_public,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const pagesApi = {
  /** Public read by slug (works for logged-out visitors). */
  async getPageBySlug(slug: string): Promise<OpenPage | null> {
    if (!supabase) return storage.getPageBySlug(slug);
    const { data, error } = await supabase.from('pages').select('*').eq('slug', slug).maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as PageRow) : null;
  },

  /** Pages owned by the signed-in user. */
  async listMyPages(): Promise<OpenPage[]> {
    if (!supabase) return storage.getAllPages();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return [];
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('owner_id', userData.user.id)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return (data as PageRow[]).map(fromRow);
  },

  /** Create or update (keyed on owner + builder page id). Throws SlugTakenError on conflict. */
  async savePage(page: OpenPage): Promise<OpenPage> {
    if (!supabase) {
      if (storage.getPageBySlug(page.slug)?.id !== undefined && storage.getPageBySlug(page.slug)!.id !== page.id) {
        throw new SlugTakenError();
      }
      storage.savePage(page);
      return page;
    }
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('You need to sign in to publish.');

    const { data, error } = await supabase
      .from('pages')
      .upsert(
        {
          owner_id: userData.user.id,
          client_id: page.id,
          slug: page.slug,
          is_public: page.isPublic,
          data: page,
        },
        { onConflict: 'owner_id,client_id' }
      )
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') throw new SlugTakenError(); // unique violation on slug
      throw error;
    }
    return fromRow(data as PageRow);
  },

  async deletePage(page: OpenPage): Promise<void> {
    if (!supabase) return storage.deletePage(page.id);
    const { error } = await supabase.from('pages').delete().eq('client_id', page.id);
    if (error) throw error;
  },
};

import { OpenPage } from '../types/schema';

const PAGES_KEY = 'openpages_published';
const CURRENT_PAGE_KEY = 'openpages_current';

export const storage = {
  // Save a published page
  savePage(page: OpenPage): void {
    const pages = this.getAllPages();
    const existingIndex = pages.findIndex((p) => p.id === page.id);
    
    if (existingIndex >= 0) {
      pages[existingIndex] = page;
    } else {
      pages.push(page);
    }
    
    localStorage.setItem(PAGES_KEY, JSON.stringify(pages));
  },

  // Get all published pages
  getAllPages(): OpenPage[] {
    const data = localStorage.getItem(PAGES_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Get a page by slug
  getPageBySlug(slug: string): OpenPage | null {
    const pages = this.getAllPages();
    return pages.find((p) => p.slug === slug) || null;
  },

  // Get a page by ID
  getPageById(id: string): OpenPage | null {
    const pages = this.getAllPages();
    return pages.find((p) => p.id === id) || null;
  },

  // Delete a page
  deletePage(id: string): void {
    const pages = this.getAllPages().filter((p) => p.id !== id);
    localStorage.setItem(PAGES_KEY, JSON.stringify(pages));
  },

  // Save current working page (in builder)
  saveCurrentPage(page: OpenPage): void {
    localStorage.setItem(CURRENT_PAGE_KEY, JSON.stringify(page));
  },

  // Get current working page
  getCurrentPage(): OpenPage | null {
    const data = localStorage.getItem(CURRENT_PAGE_KEY);
    return data ? JSON.parse(data) : null;
  },

  // Generate unique slug
  generateSlug(base: string): string {
    const slug = base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    const pages = this.getAllPages();
    let finalSlug = slug;
    let counter = 1;
    
    while (pages.some((p) => p.slug === finalSlug)) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }
    
    return finalSlug;
  },

  // Clear all data (for testing)
  clearAll(): void {
    localStorage.removeItem(PAGES_KEY);
    localStorage.removeItem(CURRENT_PAGE_KEY);
  },
};

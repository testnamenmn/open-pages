/** Public URL for a published page, based on wherever the app is hosted. */
export const pagePath = (slug: string) => `/p/${slug}`;
export const pageUrl = (slug: string) => `${window.location.origin}${pagePath(slug)}`;

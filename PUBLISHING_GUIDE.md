# 🚀 Publishing Flow Guide

This guide explains how users can publish their Open Pages using templates.

## Overview

The publish flow allows users to:
1. Select a pre-built template
2. Customize it with their data
3. Publish to a unique URL
4. Share with the world

All data is stored in **localStorage** (zero backend cost). In future versions, we'll add Supabase for cross-device sync.

---

## Step-by-Step Flow

### 1. Choose a Template

**Route:** `/templates`

Users browse 5 starter packs:
- 🏋️ **Fitness Junkie** — Track workouts, runs, gym streaks
- 💻 **Developer** — Showcase commits, repos, coding consistency
- 📚 **Polymath** — Books, learning, intellectual growth
- 🌱 **Sobriety Journey** — Celebrate milestones, track recovery
- 🎨 **Creative Soul** — Art, music, writing output

**Action:** Click "Use Template" → loads template into builder

---

### 2. Customize in Builder

**Route:** `/builder`

The builder provides:
- **Left Panel:** Widget palette (drag-and-drop or click to add)
- **Center:** Canvas with live preview
- **Right Panel:** Configuration options
  - **Edit tab:** Configure selected widget
  - **Theme tab:** Colors, backgrounds, layouts
  - **Page tab:** Name, bio, slug, SEO settings

**Auto-save:** All changes persist to localStorage automatically

---

### 3. Publish

**Action:** Click "Publish" button in builder top bar

**Publish Modal** appears with:
- **URL Slug:** `openpages.io/your-slug` (auto-generated, editable)
- **SEO Title:** For search engines
- **SEO Description:** For social sharing
- **Public Toggle:** Make page visible to everyone

**Validation:**
- Slug must be lowercase letters, numbers, hyphens only
- Slug must be unique (checks localStorage)
- SEO title and description are optional

**On Publish:**
- Page saved to localStorage with unique ID
- User redirected to `/p/[slug]` (public view)

---

### 4. View Published Page

**Route:** `/p/[slug]`

Public page displays:
- Profile header (avatar, name, bio)
- All widgets in grid layout
- Like button
- Share button (copies URL)
- "Create Your Page" CTA at bottom

**Features:**
- Responsive design
- Animated widget entrance
- Clean, shareable layout

---

### 5. Manage Pages

**Route:** `/my-pages`

Users can:
- **View all published pages** in a list
- **Copy link** to share
- **View** page (opens public view)
- **Edit** page (loads into builder)
- **Delete** page (with confirmation)

**Empty State:** If no pages, shows CTA to create first page

---

## Data Persistence

### localStorage Keys

| Key | Purpose |
|-----|---------|
| `openpages_published` | Array of all published pages |
| `openpages_current` | Current page being edited in builder |

### Page Structure

```typescript
interface OpenPage {
  id: string;              // Unique ID
  slug: string;            // URL slug (e.g., "alex-fitness")
  ownerName: string;       // Display name
  ownerAvatar: string;     // Emoji avatar
  bio: string;             // Page description
  theme: PageTheme;        // Colors, layout, fonts
  widgets: WidgetInstance[]; // Array of widgets
  connectors: ConnectedAccount[]; // API connections
  isPublic: boolean;       // Visibility toggle
  seoTitle: string;        // Meta title
  seoDescription: string;  // Meta description
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
}
```

---

## User Journey Example

### Sarah's Fitness Page

1. **Landing** → Clicks "Start with a Template"
2. **Templates** → Chooses "Fitness Junkie" template
3. **Builder** → 
   - Changes name to "Sarah's Fitness Journey"
   - Updates slug to `sarah-fitness`
   - Customizes accent color to pink
   - Adds her actual streak data
4. **Publish** → Clicks "Publish" button
   - Sets SEO title: "Sarah's Fitness Journey | 365-Day Streak"
   - Makes page public
   - Clicks "Publish"
5. **Public Page** → Redirected to `/p/sarah-fitness`
6. **Share** → Copies link, shares on Instagram bio
7. **My Pages** → Can edit, delete, or create new pages

---

## Future Enhancements (v0.2)

### Backend Integration
- Migrate from localStorage to **Supabase**
- Cross-device sync
- User accounts (email/password or OAuth)
- True public directory

### Social Features
- Follow/unfollow pages
- Comments and reactions
- Activity feed
- Explore page with trending pages

### Advanced Publishing
- Custom domains (e.g., `fitness.sarah.com`)
- Password protection
- Scheduled publishing
- Version history

### Analytics
- Page view counts
- Referrer tracking
- Engagement metrics
- Export data

---

## Technical Notes

### Storage Limits
- localStorage has ~5-10MB limit per domain
- Each page is ~2-5KB (depending on widgets)
- Users can store ~1000+ pages before hitting limits

### Slug Generation
- Auto-generated from page name
- Sanitized: lowercase, hyphens, no special chars
- Uniqueness enforced via localStorage check
- Counter appended if slug taken (e.g., `sarah-fitness-1`)

### Routing
- Public pages use `/p/[slug]` pattern
- SPA routing handled by `vercel.json` / `_redirects`
- 404 page shown if slug not found

---

## Testing the Flow

### Local Testing

1. Start dev server: `npm run dev`
2. Go to http://localhost:5173/templates
3. Pick a template → Customize → Publish
4. Note the slug (e.g., `my-fitness-page`)
5. Visit http://localhost:5173/p/my-fitness-page
6. Go to http://localhost:5173/my-pages to manage

### Browser Storage

Open DevTools → Application → Local Storage → `localhost:5173`

You'll see:
- `openpages_published` — Array of pages
- `openpages_current` — Current builder state

### Clear Data

In browser console:
```javascript
localStorage.clear();
location.reload();
```

---

## Support

For issues or feature requests, see [DEPLOYMENT.md](./DEPLOYMENT.md) or open an issue on GitHub.

**Happy publishing!** 🎉

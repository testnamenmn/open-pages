# Open Pages MVP v0.1

**Build beautiful, personalized data dashboards to track your life — and share them with the world.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/open-pages)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/YOUR_USERNAME/open-pages)
[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/YOUR_USERNAME/open-pages)

---

## 🎯 What is Open Pages?

Open Pages is a modular dashboard builder for personal data. Think of it as a **digital identity page** where you visualize your life metrics — fitness goals, reading lists, sobriety streaks, coding commits, and more — then share it publicly.

Inspired by the evolution of "open pages" from startup revenue transparency to personal data storytelling.

## ✨ MVP v0.1 Features

### 📊 Data Schema
- **10 primitive widget types**: streaks, counters, progress bars, charts, habit grids, activity logs, stat cards, text blocks, badges
- **Schema-driven architecture** — every widget is defined by a typed config

### 🔌 API Connectors (OAuth 2.0)
- **GitHub** — commits, repos, coding streaks
- **Strava** — runs, rides, fitness data
- **Goodreads** — books, reading goals
- **Manual entry** — for custom metrics

### 🎨 Modular Builder
- **Drag-and-drop canvas** — add widgets visually
- **Live preview mode** — see changes instantly
- **Widget configuration panel** — tweak every detail

### 📚 Template Library
- **5 starter packs**: Fitness Junkie, Developer, Polymath, Sobriety Journey, Creative Soul
- **Category filtering** — browse by use case
- **One-click setup** — load template → customize → publish

### 🎭 Customization Engine
- **Accent colors** — pick your brand
- **Background styles** — dark, gradient, minimal
- **Layout options** — grid, masonry, list
- **Border radius** — sm, md, lg

### 🌐 Public Sharing & Publishing
- **Vanity URLs** — `openpages.io/your-name`
- **One-click publish** — from template to live page in 2 minutes
- **My Pages dashboard** — manage all your published pages
- **SEO settings** — meta title, description
- **Social sharing** — Twitter, LinkedIn, copy link
- **Embed code** — iframe for your website
- **Public/private toggle** — control visibility
- **Auto-save** — all changes persist to localStorage

## 🚀 Quick Start

### Local Development
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:5173
```

### Build for Production
```bash
npm run build
npm run preview  # Preview production build
```

## 🗄️ Backend setup (Supabase)

Published pages are stored in Supabase so links work for everyone, not just the publisher's browser. Without these env vars the app falls back to localStorage (local-only demo mode).

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run `supabase/migrations/0001_pages.sql`, then `supabase/migrations/0002_metrics.sql`, then `supabase/migrations/0003_api_keys.sql`, then `supabase/migrations/0004_github_source.sql` (each in its own new query, in that order). Only run each file once, except 0004 which is safe to repeat.
3. In **Authentication → URL Configuration**, set *Site URL* to your deployed URL and add `http://localhost:5173/**` and your Vercel URL to *Redirect URLs* (needed for the magic-link email).
4. Copy `.env.example` to `.env.local` and fill in the project URL + anon key (**Project Settings → API**).
5. On Vercel: add the same two variables under *Project → Settings → Environment Variables* and redeploy.

### Tracking metrics
Publish a page, open **Metrics** (works well on a phone — add it to your home screen), create a metric, log values, then link widgets to it in the builder (select a widget → *Linked metric*). Public pages show the live latest value, charts (30d / 90d / all), streaks and habit grids.

### GitHub integration
In **Metrics → GitHub**, enter a username (or profile link). No login, no tokens: the browser reads GitHub's free public API and stores the results as metrics you can link widgets to: **pushes per day**, **active days** (for a coding streak), **followers**, **stars** and **public repos**.

- After connecting, click **Add GitHub widgets to my page** (on the GitHub card, or in the builder's sidebar) to get a ready-made set: coding streak, pushes per day, followers, stars and public repos. It never adds duplicates; review the layout in the builder, then publish.
- Public data only, about the last 90 days (GitHub's events limit), so it will not match your profile's contribution graph exactly. Pushes are counted from public push events; commit counts are not used because GitHub is trimming push-event payloads.
- Data refreshes when you open Metrics if it is more than 6 hours old, or with **Sync now**. GitHub allows 60 free requests/hour per IP; a sync uses 3-7.
- Pages show a “Public GitHub data · @username” label. It is **not verified** (without OAuth we cannot prove you own the username).

### Logging values via API
In **Metrics → API access**, generate a key (shown once; only its hash is stored). Then:

```bash
curl -X POST https://YOUR-SITE/api/metric \
  -H "Authorization: Bearer op_..." \
  -H "Content-Type: application/json" \
  -d '{"metric":"weight","value":72.4}'
```

- `metric` is the metric's key (name lowercased, spaces → hyphens: "Read 30m" → `read-30m`). Create the metric in the app first.
- `value` is optional for check-in metrics. Optional `ts` (ISO date) backdates an entry.
- Responses: `201` ok, `400` bad input, `401` bad key, `404` unknown metric, `429` over 60 requests/minute/key, `409` metric full (5000 entries).
- Works from iOS Shortcuts ("Get Contents of URL", method POST, JSON body) and any automation tool.
- The endpoint (`api/metric.ts`) needs no extra secrets: it reuses the same two Supabase variables.

The anon key is safe to expose; access is enforced by row-level security (public pages are readable by anyone, only owners can write).

## 🌍 Deploy to Production (Zero Cost)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guides on:
- **Vercel** (recommended) — 2-minute deploy
- **Netlify** — drag-and-drop or Git
- **Cloudflare Pages** — unlimited bandwidth
- **GitHub Pages** — free with Actions

### One-Click Deploy
Click a button above to deploy instantly, or follow the manual steps in the deployment guide.

## 🏗️ Tech Stack

- **React 18** + **TypeScript** — UI framework
- **Vite** — blazing fast build tool
- **Tailwind CSS 4** — utility-first styling
- **Framer Motion** — smooth animations
- **React Router** — client-side routing
- **Recharts** — data visualization
- **Lucide React** — beautiful icons

## 📁 Project Structure

```
src/
├── types/
│   └── schema.ts              # Data schema (widget primitives)
├── data/
│   ├── connectors.ts          # OAuth connectors
│   └── templates.ts           # Starter pack templates
├── store/
│   └── BuilderContext.tsx     # Global state (React Context)
├── components/
│   ├── Navbar.tsx             # Navigation
│   └── builder/
│       ├── WidgetRenderer.tsx      # Renders widgets
│       └── WidgetConfigPanel.tsx   # Configures widgets
└── pages/
    ├── Landing.tsx            # Home / marketing
    ├── Templates.tsx          # Template library
    ├── Builder.tsx            # Drag-and-drop canvas
    ├── Connectors.tsx         # OAuth connection UI
    └── Share.tsx              # Vanity URL + sharing
```

## 🎨 Design Philosophy

- **Schema-driven** — every widget is a typed data structure
- **Modular** — mix and match primitives to tell your story
- **Accessible** — no coding required to build a page
- **Social** — share your journey, inspire others
- **Privacy-first** — you control what's public

## 🛣️ Roadmap (v0.2 → v1.0)

### v0.2 — Real Data
- [ ] Implement actual OAuth flows with backend
- [ ] Fetch live data from GitHub/Strava/Goodreads APIs
- [ ] Auto-refresh widgets on schedule
- [ ] Webhook support for real-time updates

### v0.3 — Social Features
- [ ] User accounts (Supabase Auth)
- [ ] Follow / unfollow pages
- [ ] Comments and reactions
- [ ] Activity feed

### v0.4 — Advanced Widgets
- [ ] Custom chart types (pie, radar, heatmap)
- [ ] Embed external content (YouTube, Spotify)
- [ ] API webhook widgets (Zapier-style)
- [ ] Image/gallery widgets

### v1.0 — Platform
- [ ] Community directory
- [ ] Search and discovery
- [ ] Analytics dashboard for page owners
- [ ] Monetization (Pro tier, custom domains)

## 🤝 Contributing

This is an MVP — feedback and contributions welcome!

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License — feel free to use this for your own projects.

## 🙏 Acknowledgments

Inspired by:
- **Strava** — social fitness tracking
- **GitHub** — contribution graphs
- **Indie Hackers** — open revenue pages
- **Notion** — modular block-based editing

---

**Built with ❤️ for the quantified self community.**

[Live Demo](https://open-pages.vercel.app) • [Documentation](./DEPLOYMENT.md) • [Report Bug](https://github.com/YOUR_USERNAME/open-pages/issues)

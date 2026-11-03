# 🚀 Deploy Open Pages MVP v0.1 — Zero Cost

This guide walks you through deploying your Open Pages app for **free** on three platforms. Pick the one you like best.

| Platform | Free Tier | Custom Domain | Deploy Time |
|----------|-----------|---------------|-------------|
| **Vercel** | Unlimited | ✅ | ~2 minutes |
| **Netlify** | 100 GB/mo | ✅ | ~3 minutes |
| **Cloudflare Pages** | Unlimited | ✅ | ~5 minutes |
| **GitHub Pages** | Unlimited | ✅ | ~10 minutes |

---

## 🏆 Option 1: Vercel (Recommended)

**Why Vercel?** Zero-config Vite support, automatic HTTPS, instant deploys from Git.

### Steps:

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Open Pages MVP v0.1"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/open-pages.git
   git push -u origin main
   ```

2. **Go to [vercel.com](https://vercel.com)** → Sign up with GitHub

3. **Click "Add New Project"** → Import your GitHub repo

4. Vercel auto-detects Vite. Confirm settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

5. **Click "Deploy"** → Wait ~60 seconds

6. ✅ Your site is live at `https://your-project.vercel.app`

### Custom Domain (Free):
- Go to Project Settings → Domains
- Add your domain (e.g., `openpages.io`)
- Update DNS records as shown
- SSL certificate is auto-provisioned

---

## 🌐 Option 2: Netlify

### Steps:

1. **Push to GitHub** (same as above)

2. **Go to [netlify.com](https://netlify.com)** → Sign up with GitHub

3. **Click "Add new site" → "Import an existing project"**

4. **Select your GitHub repo**

5. **Configure build settings:**
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node version:** 18

6. **Click "Deploy site"**

7. ✅ Live at `https://random-name.netlify.app`

### Custom Domain:
- Site settings → Domain management → Add custom domain
- Free SSL via Let's Encrypt

### Drag-and-Drop Alternative:
```bash
npm run build
```
Then drag the `dist/` folder onto [app.netlify.com/drop](https://app.netlify.com/drop). Done in 30 seconds.

---

## ⚡ Option 3: Cloudflare Pages

**Why Cloudflare?** Unlimited bandwidth, 300+ edge locations, fastest global CDN.

### Steps:

1. **Push to GitHub** (same as above)

2. **Go to [pages.cloudflare.com](https://pages.cloudflare.com)** → Sign up

3. **Click "Create a project" → "Connect to Git"**

4. **Select your repo**

5. **Configure build:**
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`

6. **Click "Save and Deploy"**

7. ✅ Live at `https://your-project.pages.dev`

### Custom Domain:
- Custom domains → Set up a custom domain
- If using Cloudflare DNS, it's instant
- Free SSL + DDoS protection included

---

## 📦 Option 4: GitHub Pages

### Steps:

1. **Install gh-pages:**
   ```bash
   npm install -D gh-pages
   ```

2. **Update `package.json` scripts:**
   ```json
   {
     "scripts": {
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Update `vite.config.js`:**
   ```js
   export default defineConfig({
     base: '/your-repo-name/',  // ← add this
     // ... rest of config
   })
   ```

4. **Deploy:**
   ```bash
   npm run build
   npm run deploy
   ```

5. ✅ Live at `https://YOUR_USERNAME.github.io/your-repo-name/`

### Enable GitHub Actions (auto-deploy on push):

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## 🎯 Quick Comparison

| Feature | Vercel | Netlify | Cloudflare | GitHub Pages |
|---------|--------|---------|------------|--------------|
| HTTPS | ✅ Free | ✅ Free | ✅ Free | ✅ Free |
| Custom domain | ✅ | ✅ | ✅ | ✅ |
| Auto-deploys on push | ✅ | ✅ | ✅ | ✅ (with Actions) |
| Preview deploys (PRs) | ✅ | ✅ | ✅ | ❌ |
| Edge functions | ✅ (paid) | ✅ (paid) | ✅ (free!) | ❌ |
| Bandwidth | Unlimited | 100 GB/mo | Unlimited | 100 GB/mo |
| Build minutes/mo | 6000 | 300 | 500 | 2000 |

---

## 🔐 Environment Variables (for future API keys)

When you add real OAuth credentials later, set them as env vars:

**Vercel:** Project Settings → Environment Variables
**Netlify:** Site settings → Environment variables
**Cloudflare:** Settings → Environment variables

Example:
```
VITE_GITHUB_CLIENT_ID=your_client_id
VITE_STRAVA_CLIENT_ID=your_client_id
VITE_GOODREADS_CLIENT_ID=your_client_id
```

⚠️ **Never commit `.env` files with secrets.** Add `.env` to `.gitignore`.

---

## 📝 Post-Deploy Checklist

- [ ] Test all routes work (`/`, `/builder`, `/templates`, `/connectors`, `/share`)
- [ ] Verify mobile responsiveness
- [ ] Check page load speed (aim for < 2s)
- [ ] Set up custom domain (optional)
- [ ] Add favicon (replace in `public/`)
- [ ] Configure analytics (Plausible, Umami — both free + privacy-friendly)
- [ ] Set up error monitoring (Sentry free tier)

---

## 🆘 Troubleshooting

**Blank page after deploy?**
- Check browser console for errors
- Ensure SPA rewrite rules are in place (`vercel.json` or `_redirects`)

**Assets not loading?**
- Verify `base` in `vite.config.js` matches your deployment path
- GitHub Pages needs `base: '/repo-name/'`

**Routing broken on refresh?**
- The SPA rewrite config handles this — make sure `vercel.json` or `_redirects` was deployed

**Build fails?**
```bash
# Test locally first
npm run build
npm run typecheck
```

---

## 💡 Pro Tips

1. **Use Vercel for fastest iteration** — preview deploys on every PR are invaluable
2. **Use Cloudflare Pages for production** — best performance + unlimited bandwidth
3. **Set up a custom domain early** — free via Namecheap/Cloudflare (~$10/year)
4. **Add a favicon** — drop `favicon.ico` in `public/`
5. **Monitor with Plausible** — privacy-friendly, free self-hosted or $9/mo hosted

---

## 🎉 You're Live!

Share your Open Page URL on:
- Twitter/X: "Just built my Open Page with @OpenPages 🚀"
- LinkedIn: Post about your data journey
- Personal bio: Link to your vanity URL

**Happy shipping!** 🛠️

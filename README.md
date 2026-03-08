# Amora Insights

**China Innovation & Future Industries Intelligence Platform**

## 🚀 Quick Deploy to Vercel

### Step 1: Push to GitHub

```bash
cd amorainsights
git init
git add .
git commit -m "Initial commit - Amora Insights"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/amorainsights.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click **"Add New Project"**
3. Import your GitHub repository (`amorainsights`)
4. Keep default settings and click **"Deploy"**
5. Wait ~1 minute for deployment to complete!

### Step 3: Connect Your Domain

1. In Vercel dashboard, go to **Project Settings → Domains**
2. Add `amorainsights.com` and `www.amorainsights.com`
3. Vercel will show you the DNS records to add

### Step 4: Update DNS at GoDaddy

1. Log in to your GoDaddy account
2. Go to **DNS Management** for `amorainsights.com`
3. Add/update these records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | www | cname.vercel-dns.com | 1 hour |
| ALIAS/ANAME | @ | amorainsights.com (or use Vercel's IP) | 1 hour |

**Note:** For the root domain (@), GoDaddy may not support ALIAS records. In that case:
- Use Vercel's nameservers instead, OR
- Set up URL forwarding from root to www

### Step 5: Enable HTTPS

Vercel automatically provisions SSL certificates. Once DNS propagates (can take up to 48 hours, usually faster), your site will be live at:
- https://amorainsights.com
- https://www.amorainsights.com

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
amorainsights/
├── src/
│   ├── app/
│   │   ├── about/          # About page
│   │   ├── industries/     # Industries overview
│   │   ├── login/          # Login page
│   │   ├── signup/         # Signup page
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Homepage
│   └── components/         # Reusable components
├── public/                 # Static assets
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🎨 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Deployment:** Vercel
- **Future additions:**
  - Authentication: NextAuth.js
  - Database: PostgreSQL (via Vercel Postgres or Supabase)
  - Payments: Stripe
  - Email: Resend
  - CMS: Sanity or MDX

---

## 📝 Next Steps (Phase 2)

- [ ] Set up authentication (NextAuth.js)
- [ ] Create database schema for enterprises
- [ ] Build admin dashboard for content management
- [ ] Integrate Stripe for subscriptions
- [ ] Set up email newsletter (Resend)
- [ ] Create blog/report publishing system

---

## 📄 License

© 2026 Amora Insights. All rights reserved.

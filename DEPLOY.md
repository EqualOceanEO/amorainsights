# 🚀 Deploy Amora Insights to Vercel

**Follow these steps to get your site live!**

---

## Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) and log in
2. Click the **"+"** icon → **"New repository"**
3. Name it: `amorainsights`
4. Keep it **Public** or **Private** (your choice)
5. **Don't** initialize with README (we already have code)
6. Click **"Create repository"**

---

## Step 2: Push Code to GitHub

Open your terminal and run these commands:

```bash
cd C:\Users\iyiou\.openclaw\workspace\amorainsights

# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/amorainsights.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Note:** You may need to authenticate with GitHub. Follow the prompts.

---

## Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** (use your GitHub account — easiest!)
3. After logging in, click **"Add New Project"**
4. Select **"Import Git Repository"**
5. Find `amorainsights` in your repositories list
6. Click **"Import"**
7. Keep all default settings
8. Click **"Deploy"**

⏱️ Wait about 1-2 minutes for the build to complete!

---

## Step 4: Test Your Live Site

Vercel will give you a preview URL like:
```
https://amorainsights-xxxx.vercel.app
```

Click it to see your live site! 🎉

---

## Step 5: Connect Your GoDaddy Domain

### In Vercel:

1. Go to **Project Settings → Domains**
2. Add these domains:
   - `amorainsights.com`
   - `www.amorainsights.com`
3. Vercel will show DNS configuration instructions

### In GoDaddy:

1. Log in to [godaddy.com](https://godaddy.com)
2. Go to **My Products → Domains → amorainsights.com**
3. Click **"DNS"** or **"Manage DNS"**
4. Add/Update these records:

**For www subdomain:**
| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | www | cname.vercel-dns.com | 1 hour |

**For root domain (@):**

Option A (if GoDaddy supports ALIAS):
| Type | Name | Value | TTL |
|------|------|-------|-----|
| ALIAS | @ | amorainsights.com | 1 hour |

Option B (use Vercel nameservers - recommended):
1. In Vercel: Project Settings → Domains → Click "..." → "Update Nameservers"
2. Copy the nameserver addresses
3. In GoDaddy: DNS → Nameservers → Change to Custom
4. Paste Vercel's nameservers

---

## Step 6: Wait for DNS Propagation

DNS changes can take **up to 48 hours** to propagate globally, but usually it's much faster (1-2 hours).

Once done, your site will be live at:
- ✅ https://amorainsights.com
- ✅ https://www.amorainsights.com

Vercel automatically handles HTTPS/SSL — no extra setup needed!

---

## 🎉 You're Live!

Your Amora Insights website is now deployed and accessible worldwide!

### Next Steps:

1. **Add content** - Create your first research report or blog post
2. **Set up authentication** - Add user login/signup (NextAuth.js)
3. **Add database** - Store enterprise data (Vercel Postgres or Supabase)
4. **Set up payments** - Stripe for subscriptions
5. **Email newsletter** - Resend for subscriber emails

---

## 📞 Need Help?

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Next.js Docs: [nextjs.org/docs](https://nextjs.org/docs)
- GoDaddy DNS Guide: [godaddy.com/help](https://godaddy.com/help)

Good luck, 彬哥！🚀✨

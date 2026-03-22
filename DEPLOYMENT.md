# Deployment Guide - PR-Based Vercel Deployments

This project deploys to Vercel **only via GitHub Pull Requests**, not on every push. This gives you full control over what gets deployed and when.

## 🚀 Quick Start

1. **Set up Vercel Project** (one-time)
2. **Configure GitHub Secrets** (one-time)
3. **Create a PR** → Auto-deploys preview
4. **Merge to main** → Manually trigger production deployment

---

## Step 1: Create GitHub Repository

```bash
# 1. Create a new repo on GitHub (don't initialize with README)
# 2. Add the remote
git remote add origin https://github.com/YOUR_USERNAME/household.git

# 3. Commit all changes
git add .
git commit -m "Initial commit: Complete household task manager

- Next.js 16 with TypeScript
- Supabase Auth + PostgreSQL
- Drizzle ORM with VARCHAR enums
- React Query for data fetching
- Shadcn UI with custom theme
- Mobile-first design

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# 4. Push to GitHub
git push -u origin initial-setup
```

---

## Step 2: Set Up Vercel Project

### 2.1 Create Vercel Project

1. Go to https://vercel.com
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. **IMPORTANT:** Configure these settings:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

### 2.2 Disable Auto-Deployments

In Vercel project settings:
1. Go to **Settings** → **Git**
2. **Uncheck** "Automatically deploy the default branch"
3. **Uncheck** "Automatically deploy all branches"
4. Save changes

This ensures deployments only happen via GitHub Actions.

### 2.3 Add Environment Variables

In Vercel project settings, go to **Settings** → **Environment Variables** and add:

| Variable | Value | Environments |
|----------|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |
| `DATABASE_URL` | Your Supabase database URL (with pooler, port 6543) | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | Production, Preview, Development |

**Where to find Supabase credentials:**
- Go to https://app.supabase.com
- Select your project
- **Settings** → **API**
  - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon/public key
  - `SUPABASE_SERVICE_ROLE_KEY` = service_role key (⚠️ keep secret!)
- **Settings** → **Database** → **Connection string** → **Transaction pooler**
  - `DATABASE_URL` = Connection string (port 6543)

### 2.4 Get Vercel Project IDs

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Get your IDs (save these for GitHub secrets)
cat .vercel/project.json
```

You'll see:
```json
{
  "orgId": "team_xxxxx",
  "projectId": "prj_xxxxx"
}
```

---

## Step 3: Configure GitHub Secrets

Go to your GitHub repo: **Settings** → **Secrets and variables** → **Actions**

Add these **Repository Secrets**:

| Secret Name | Value | Where to get it |
|-------------|-------|-----------------|
| `VERCEL_TOKEN` | Your Vercel token | https://vercel.com/account/tokens (create new) |
| `VERCEL_ORG_ID` | From `.vercel/project.json` | The `orgId` value |
| `VERCEL_PROJECT_ID` | From `.vercel/project.json` | The `projectId` value |

---

## Step 4: Configure Supabase Auth Redirect URLs

In Supabase: **Authentication** → **URL Configuration**

Add these URLs:

**Site URL:**
```
https://your-project.vercel.app
```

**Redirect URLs:** (add all of these)
```
http://localhost:3000/auth/callback
https://your-project.vercel.app/auth/callback
https://your-project-*.vercel.app/auth/callback
```

The wildcard `*` allows preview deployments to work.

---

## 🎯 Deployment Workflows

### Preview Deployment (Automatic on PR)

```bash
# 1. Create a feature branch
git checkout -b feature/my-feature

# 2. Make changes and commit
git add .
git commit -m "Add my feature"

# 3. Push and create PR
git push origin feature/my-feature
# Then create PR on GitHub

# ✅ GitHub Actions automatically:
# - Builds your project
# - Deploys to Vercel preview URL
# - Comments the preview URL on your PR
```

### Production Deployment (Manual Trigger)

Production deployments are **manual only** for safety:

1. **Merge PR to main:**
   ```bash
   # After PR is approved and merged
   git checkout main
   git pull origin main
   ```

2. **Trigger production deployment:**
   - Go to GitHub: **Actions** → **Vercel Deployment**
   - Click **"Run workflow"**
   - Select **"main"** branch
   - Click **"Run workflow"**

3. **Verify deployment:**
   - Check Actions tab for deployment status
   - Visit https://your-project.vercel.app

---

## 🔍 Monitoring Deployments

### View Deployment Status

**GitHub Actions:**
- Go to **Actions** tab in your repo
- See all deployment runs
- Click a run to see logs

**Vercel Dashboard:**
- Go to https://vercel.com/dashboard
- Select your project
- See all deployments (preview + production)

### Preview URLs

Each PR gets a unique URL:
```
https://household-pr-123-your-name.vercel.app
```

The URL is automatically commented on your PR.

---

## 🛡️ Security Best Practices

✅ **DO:**
- Keep `SUPABASE_SERVICE_ROLE_KEY` in Vercel environment variables only
- Never commit `.env.local` to Git
- Use Vercel's environment variable encryption
- Review preview deployments before merging

❌ **DON'T:**
- Don't enable auto-deployments in Vercel
- Don't commit secrets to GitHub
- Don't share service role keys

---

## 🐛 Troubleshooting

### Deployment Fails with "Missing Environment Variables"

**Solution:** Verify all environment variables are set in Vercel:
```bash
vercel env ls
```

### Preview Deployment Fails

**Solution:** Check GitHub Actions logs:
1. Go to **Actions** tab
2. Click the failed run
3. Expand the failed step
4. Fix the error and push again

### Auth Doesn't Work on Preview

**Solution:** Add wildcard redirect URL in Supabase:
```
https://your-project-*.vercel.app/auth/callback
```

### Database Connection Fails

**Solution:** Verify `DATABASE_URL` uses port **6543** (transaction pooler):
```
postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

---

## 📝 Quick Reference

### Common Commands

```bash
# Create PR (triggers preview deployment)
git checkout -b feature/my-feature
git add .
git commit -m "Description"
git push origin feature/my-feature

# Deploy to production (manual)
# Go to GitHub Actions → Run workflow

# View deployment logs
vercel logs your-project.vercel.app

# Check deployment status
vercel ls
```

### Useful Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **GitHub Actions:** https://github.com/YOUR_USERNAME/household/actions
- **Supabase Dashboard:** https://app.supabase.com
- **Production URL:** https://your-project.vercel.app

---

## 🎉 You're Done!

Your deployment pipeline is now set up:

1. ✅ PRs auto-deploy to preview URLs
2. ✅ Production deployments are manual and controlled
3. ✅ Environment variables are secure
4. ✅ Full deployment history in GitHub Actions

Happy deploying! 🚀

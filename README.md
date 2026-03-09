# TSOA PMS — Production Deployment Guide

**TSOA Technologies · Packaging Management System**  
Stack: React 18 + Vite 5 + Supabase + Vercel

---

## 1 · Supabase Setup (Database)

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Note your **Project URL** and **anon public key** (Settings → API)
3. Go to **SQL Editor → New Query**, paste the full contents of `schema.sql`, click **Run**
4. Enable Realtime: **Database → Replication** → add `tsoa_problems`, `tsoa_reports`, `tsoa_documents`

---

## 2 · Local Development

```bash
# Install dependencies
npm install

# Copy env template and fill in your keys
cp .env.example .env
# Edit .env with your Supabase URL and anon key

# Start dev server
npm run dev
# → http://localhost:5173
```

---

## 3 · Deploy to Vercel

### Option A — Vercel CLI (recommended)

```bash
npm install -g vercel

# Login
vercel login

# Deploy (follow prompts — select your project)
vercel

# Add environment variables
vercel env add VITE_SUPABASE_URL
# paste your Supabase project URL when prompted

vercel env add VITE_SUPABASE_ANON_KEY
# paste your anon key when prompted

# Deploy to production
vercel --prod
```

### Option B — Vercel Dashboard (GitHub)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import from GitHub
3. Framework: **Vite** (auto-detected)
4. Add Environment Variables:
   - `VITE_SUPABASE_URL` → your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` → your anon public key
5. Click **Deploy**

---

## 4 · Demo Login Credentials

| Username        | Password     | Role                     |
|-----------------|--------------|--------------------------|
| james.mutua     | Tsoa@1234    | Senior Packaging Engineer|
| sarah.wanjiru   | Tsoa@2345    | QA Technician            |
| david.ochieng   | Tsoa@3456    | Electrical Technician    |
| grace.akinyi    | Tsoa@4567    | Process Engineer         |
| admin           | Admin@0000   | System Administrator     |

---

## 5 · What Gets Stored in the Database

| Table            | What's stored                         | Who can see  |
|------------------|---------------------------------------|--------------|
| `tsoa_problems`  | Action tracker / problem log entries  | Everyone     |
| `tsoa_reports`   | Weekly packaging reports              | Everyone     |
| `tsoa_documents` | Document metadata (title, cat, rev)   | Everyone     |

> **Note:** Actual file binaries are not uploaded to Supabase Storage in this version — document entries store metadata only. File upload to Storage can be added by enabling the `storage` bucket in Supabase and wiring the `file_url` column.

---

## 6 · Environment Variables Reference

| Variable                | Where to get it                            |
|-------------------------|--------------------------------------------|
| `VITE_SUPABASE_URL`     | Supabase → Settings → API → Project URL   |
| `VITE_SUPABASE_ANON_KEY`| Supabase → Settings → API → anon public   |

---

## 7 · Project Structure

```
tsoa-pms/
├── src/
│   ├── App.jsx          ← Complete application (single file)
│   └── main.jsx         ← React entry point
├── index.html           ← HTML shell
├── schema.sql           ← Run once in Supabase SQL Editor
├── package.json
├── vite.config.js
├── vercel.json          ← Vercel SPA config + security headers
├── .env.example         ← Copy to .env and fill in keys
└── .gitignore
```

---

## 8 · Realtime Sync

All logged-in users see live updates. When any user:
- Logs a new problem → all other users see it instantly
- Adds a report → appears on everyone's Reports page immediately  
- Uploads a document → visible to everyone right away

This is powered by Supabase Realtime subscriptions.

---

*Built by TynovA Technologies*

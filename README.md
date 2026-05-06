# Sushant Pupneja — Portfolio Website

Multi-page portfolio with an AI recruiter chat agent, hosted on Netlify.

---

## Project Structure

```
sushant-portfolio/
├── index.html                   ← Home page
├── projects.html                ← Projects page
├── skills.html                  ← Skills page
├── chat.html                    ← AI Chat page (calls Netlify Function)
├── netlify.toml                 ← Netlify config (functions dir + security headers)
├── netlify/
│   └── functions/
│       └── chat.js              ← Secure server-side Claude API proxy
└── README.md
```

---

## How the AI Chat Works (Securely)

```
Browser (chat.html)
      │
      │  POST /.netlify/functions/chat
      │  { messages: [...] }
      ▼
Netlify Function (chat.js)   ← your API key lives HERE, server-side only
      │
      │  POST https://api.anthropic.com/v1/messages
      │  x-api-key: $ANTHROPIC_API_KEY
      ▼
Claude API
```

Your API key is **never** in the browser or in any HTML file.

---

## Deployment Steps

### Step 1 — Get an Anthropic API Key

1. Go to https://console.anthropic.com
2. Sign up / log in
3. Go to **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-...`) — save it somewhere safe

### Step 2 — Push to GitHub

1. Go to https://github.com and create a **new repository** (e.g. `sushant-portfolio`)
2. Make it **Private** (recommended) or Public
3. Upload all files from this folder into the repo root
   - You can drag-and-drop files via the GitHub web interface
   - Or use Git:
     ```bash
     git init
     git add .
     git commit -m "Initial portfolio"
     git remote add origin https://github.com/YOUR_USERNAME/sushant-portfolio.git
     git push -u origin main
     ```

### Step 3 — Deploy on Netlify

1. Go to https://netlify.com and sign up / log in
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** → authorize Netlify → select your repository
4. On the build settings page:
   - **Build command**: *(leave blank)*
   - **Publish directory**: `.` (just a dot)
5. Click **"Deploy site"**

### Step 4 — Add Your API Key as an Environment Variable

This is the critical security step — your key goes here, not in any file.

1. In your Netlify site dashboard → **"Site configuration"**
2. Go to **"Environment variables"** → **"Add a variable"**
3. Set:
   - **Key**: `ANTHROPIC_API_KEY`
   - **Value**: `sk-ant-...` (your key from Step 1)
4. Click **Save**
5. Go to **Deploys** → **"Trigger deploy"** → **"Deploy site"** to redeploy with the new env var

### Step 5 — Rename Your Site URL (Optional)

1. **Site configuration** → **Site details** → **"Change site name"**
2. Set it to e.g. `sushant-pupneja` → your URL becomes `https://sushant-pupneja.netlify.app`

### Step 6 — Custom Domain (Optional)

1. Buy a domain at https://namecheap.com or https://cloudflare.com (e.g. `sushantpupneja.dev`)
2. In Netlify → **Domain management** → **"Add custom domain"**
3. Add a CNAME record at your DNS provider pointing to your Netlify URL
4. Netlify auto-provisions a free SSL certificate

---

## Updating the Site

Since it's connected to GitHub, any file you update and push automatically redeploys:

```bash
# Edit a file, then:
git add .
git commit -m "Added new project"
git push
# Netlify auto-deploys in ~30 seconds
```

---

## Adding New Projects / Skills

Just tell Claude (in your portfolio chat session) what to add. Claude keeps your full resume context and will update the relevant HTML files.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Chat says "API key not configured" | Add `ANTHROPIC_API_KEY` to Netlify env vars and redeploy |
| Chat returns 401 | Double-check the API key value, no extra spaces |
| Functions not found | Make sure `netlify.toml` is in the root of your repo |
| Site shows old version | Go to Deploys → Trigger deploy |

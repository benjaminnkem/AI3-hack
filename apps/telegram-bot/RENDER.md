# Deploy Mesh Telegram bot on Render (free Web Service)

Local polling works on your laptop. On free Render you must use a **Web Service + webhook**, not a Background Worker.

## Why local worked but Render failed (common)

1. **Start used `tsx`**, which is a devDependency (often missing in production). Fixed: `build` → `node dist/index.js`.
2. **Local bot still running** while Render also uses the same token (Telegram conflicts).
3. **`MESH_API_BASE_URL=http://localhost:4000`** on Render (API must be a public HTTPS URL).
4. **Webhook mode not active** or wrong public URL.
5. Free service **asleep** / first request cold start.

---

## Before you start

### A. Stop every local bot

On your machine:

```bash
pkill -f "telegram-bot" 2>/dev/null || true
pkill -f "tsx src/index.ts" 2>/dev/null || true
```

Only **one** process may own the bot token.

### B. Deploy Mesh API first (required)

The bot only calls your API. On Render, `localhost` is not your laptop.

You need a public API like:

```text
https://mesh-api-xxxx.onrender.com
```

Health check should work in a browser:

```text
https://YOUR-API.onrender.com/api/v1/health
```

Also deploy web if you want passport links to open for judges:

```text
https://YOUR-WEB.onrender.com
```

### C. Commit and push the bot code

Render deploys from GitHub. Push the latest `apps/telegram-bot` (including the production `start` script).

---

## Step-by-step: free Web Service

### 1. Create the service

1. [Render Dashboard](https://dashboard.render.com) → **New +** → **Web Service**
2. Connect the **proofmesh** GitHub repo
3. Choose the branch you pushed (usually `master` / `main`)

### 2. Service settings (exact)

| Field | Value |
|--------|--------|
| **Name** | `mesh-telegram-bot` (or any name) |
| **Region** | same region as your API if possible |
| **Root Directory** | leave **empty** (monorepo root) |
| **Runtime** | **Node** |
| **Build Command** | see below |
| **Start Command** | see below |
| **Instance type** | **Free** |
| **Health Check Path** | `/health` |

**Build Command:**

```bash
corepack enable && corepack prepare pnpm@9.1.0 --activate && pnpm install --frozen-lockfile --filter @mesh/telegram-bot... && pnpm --filter @mesh/telegram-bot build
```

If `--frozen-lockfile` fails after dependency changes, use:

```bash
corepack enable && corepack prepare pnpm@9.1.0 --activate && pnpm install --filter @mesh/telegram-bot... && pnpm --filter @mesh/telegram-bot build
```

**Start Command:**

```bash
pnpm --filter @mesh/telegram-bot start
```

### 3. Environment variables

In **Environment** → add:

| Key | Value | Notes |
|-----|--------|--------|
| `TELEGRAM_BOT_TOKEN` | your BotFather token | secret |
| `TELEGRAM_MODE` | `webhook` | **required** on free Web Service |
| `TELEGRAM_WEBHOOK_PATH` | `/telegram/webhook` | keep default |
| `TELEGRAM_WEBHOOK_SECRET` | long random string | e.g. `openssl rand -hex 24` |
| `MESH_API_BASE_URL` | `https://YOUR-API.onrender.com` | **no** trailing slash, **not** localhost |
| `MESH_WEB_BASE_URL` | `https://YOUR-WEB.onrender.com` | passport links |
| `MESH_API_PREFIX` | `api/v1` | |
| `MESH_REQUEST_TIMEOUT_MS` | `180000` | long verifications |
| `NODE_VERSION` | `20` | optional but recommended |

**Do not set** `TELEGRAM_MODE=polling` on free Web Service.

**Do not set** `MESH_API_BASE_URL=http://localhost:4000`.

`PORT` and `RENDER_EXTERNAL_URL` are set by Render automatically.  
If webhook registration fails, set explicitly:

```text
TELEGRAM_WEBHOOK_URL=https://mesh-telegram-bot.onrender.com
```

(use your real service URL, no path)

### 4. Deploy

Click **Create Web Service** / **Manual Deploy**.

Wait until status is **Live**.

### 5. Verify health

Open in browser:

```text
https://YOUR-BOT-SERVICE.onrender.com/health
```

Expected:

```json
{"ok":true,"service":"mesh-telegram-bot","mode":"webhook"}
```

If this fails, the process is not listening (build/start/env error). Check **Logs**.

### 6. Check logs (good signs)

You should see lines like:

```text
Mode: webhook (async, free-web-service friendly)
HTTP server listening on 0.0.0.0:10000
Webhook registered: https://....onrender.com/telegram/webhook
Bot @mesh_passport_bot is online
```

Bad signs:

| Log / symptom | Fix |
|---------------|-----|
| `tsx: not found` | Rebuild with latest package.json (`start` uses `node dist`) |
| `TELEGRAM_BOT_TOKEN is required` | Add env var, redeploy |
| `localhost` / connection refused to API | Set public `MESH_API_BASE_URL` |
| `Failed to register Telegram webhook` | Stop local bot; set correct `TELEGRAM_WEBHOOK_URL` |
| 409 Conflict | Another bot instance still polling |
| Sleeps / no reply first time | Free tier cold start: open `/health` first |

### 7. Test Telegram

1. Open `/health` once (wake free instance)
2. Message `@mesh_passport_bot` a short claim
3. Expect “Working on your…” then a verdict (API must be awake too)

---

## Debug checklist if it still fails

### 1) Confirm webhook is set in Telegram

From your laptop (replace token):

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo"
```

You want `"url":"https://YOUR-BOT.onrender.com/telegram/webhook"` and ideally no `last_error_message`.

Clear bad webhook:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/deleteWebhook?drop_pending_updates=true"
```

Then **redeploy** the Render service so it calls `setWebhook` again.

### 2) Confirm API is reachable from the public internet

```bash
curl -s "https://YOUR-API.onrender.com/api/v1/health"
```

### 3) Confirm bot can reach API path

```bash
curl -s -X POST "https://YOUR-API.onrender.com/api/v1/verifications" \
  -H "content-type: application/json" \
  -d '{"inputType":"TEXT","content":"The sky is blue."}'
```

### 4) Only one bot process

- Stop local `pnpm --filter @mesh/telegram-bot dev`
- Only one Render service using that token

### 5) Free-tier sleep

Before a demo:

1. Hit bot `/health`
2. Hit API `/api/v1/health`
3. Then message the bot

---

## Local vs Render modes

| Where | Mode | Command |
|--------|------|---------|
| Laptop | polling | `pnpm --filter @mesh/telegram-bot dev` |
| Render free | webhook | `pnpm --filter @mesh/telegram-bot start` after `build` |

Never run both at once with the same token.

---

## Minimal env copy-paste (Render)

```bash
TELEGRAM_BOT_TOKEN=
TELEGRAM_MODE=webhook
TELEGRAM_WEBHOOK_PATH=/telegram/webhook
TELEGRAM_WEBHOOK_SECRET=
MESH_API_BASE_URL=https://YOUR-API.onrender.com
MESH_WEB_BASE_URL=https://YOUR-WEB.onrender.com
MESH_API_PREFIX=api/v1
MESH_REQUEST_TIMEOUT_MS=180000
NODE_VERSION=20
```

Fill the blanks, deploy, open `/health`, then test in Telegram.

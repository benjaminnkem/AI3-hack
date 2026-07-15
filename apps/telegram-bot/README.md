# Mesh Telegram Bot

Thin Telegram reference client for Mesh Evidence Passports.

The bot does **not** reimplement verification. It calls the Mesh API and replies with a Truth Score plus a public passport link.

## Local setup (free, best for development)

```bash
cp apps/telegram-bot/.env.example apps/telegram-bot/.env
# fill TELEGRAM_BOT_TOKEN, MESH_API_BASE_URL, MESH_WEB_BASE_URL

pnpm install
pnpm --filter @mesh/api dev
pnpm --filter @mesh/web dev
pnpm --filter @mesh/telegram-bot dev
```

Local default mode is **long polling** (no public URL required).

For a live phone demo without paid hosting, keep the laptop online and run the bot locally.

## Usage

Message the bot:

- plain text claim
- a URL
- a photo / image document

---

## Free hosting (no paid Background Worker)

Render **Background Workers are paid**. Use a free **Web Service + webhook** instead.

### Render free Web Service + webhook

1. Deploy Mesh **API** and **web** somewhere public first (or also free web services).  
   The bot cannot use `localhost` from Render.
2. Render → **New Web Service** → this repo.
3. Settings:

| Field | Value |
|--------|--------|
| Root Directory | _(empty / monorepo root)_ |
| Runtime | Node |
| Build Command | `pnpm install --filter @mesh/telegram-bot...` |
| Start Command | `pnpm --filter @mesh/telegram-bot start` |
| Instance type | Free |
| Health check path | `/health` |

4. Environment variables:

```bash
TELEGRAM_BOT_TOKEN=...
TELEGRAM_MODE=webhook
# RENDER_EXTERNAL_URL is auto-injected by Render (used as webhook base)
TELEGRAM_WEBHOOK_PATH=/telegram/webhook
TELEGRAM_WEBHOOK_SECRET=long-random-string
MESH_API_BASE_URL=https://YOUR-PUBLIC-API.onrender.com
MESH_WEB_BASE_URL=https://YOUR-PUBLIC-WEB.onrender.com
MESH_API_PREFIX=api/v1
MESH_REQUEST_TIMEOUT_MS=180000
PORT=10000
```

5. Deploy once, open the service URL in a browser (`/health`) to wake it, then message the bot.

### Free-tier limitations (important)

- Free Render services **sleep** after idle time. First message after sleep can take 30–60s to wake.
- Before a judge demo, open the bot health URL once to warm it.
- Mesh verification can take up to ~1–2 minutes. The bot answers Telegram’s webhook **immediately**, then processes in the background so free proxy timeouts do not kill the job.
- Free API/web services can also sleep; warm them too before demo.
- Do **not** run a local bot with the same token while Render is live (Telegram 409 conflict).

### Other free options

| Option | Cost | Notes |
|--------|------|--------|
| **Laptop + local bot** | Free | Most reliable for hackathon day |
| **Render free Web Service** | Free | Webhook; cold starts |
| **Fly.io free allowance** | Free tier | Small always-on VM if quota remains |
| **Oracle Cloud Always Free VM** | Free | Long polling; more setup |
| **ngrok free + local bot** | Free | Temporary public tunnel for demo only |

For the hackathon, **local bot during the pitch** is often better than fighting free-tier sleep.

---

## Modes

| Mode | When |
|------|------|
| `TELEGRAM_MODE=polling` | Local laptop, always-on VM |
| `TELEGRAM_MODE=webhook` | Free Render Web Service |
| unset | webhook if `RENDER_EXTERNAL_URL` / `TELEGRAM_WEBHOOK_URL` exists, else polling |

## Optional allowlist

```bash
TELEGRAM_ALLOWED_CHAT_IDS=123456789
```

## Security

- Never commit `.env` or bot tokens.
- If a token was shared in chat, revoke it in BotFather and rotate it.

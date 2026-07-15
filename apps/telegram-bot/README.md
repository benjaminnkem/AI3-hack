# Mesh Telegram Bot

Thin Telegram reference client for Mesh Evidence Passports.

The bot does **not** reimplement verification. It calls the Mesh API and replies with a Truth Score plus a public passport link.

## Setup

1. Create a bot with [@BotFather](https://t.me/BotFather) and copy the token.
2. Copy env file:

```bash
cp apps/telegram-bot/.env.example apps/telegram-bot/.env
```

3. Fill:

```bash
TELEGRAM_BOT_TOKEN=...
MESH_API_BASE_URL=http://localhost:4000
MESH_WEB_BASE_URL=http://localhost:3000
```

4. Install deps from repo root:

```bash
pnpm install
```

5. Run API (and ideally web) first, then:

```bash
pnpm --filter @mesh/telegram-bot dev
```

## Usage

Message the bot:

- plain text claim
- a single URL
- a photo / image document

Reply format:

- verdict
- truth score / confidence
- short summary
- passport URL

## Notes

- Long polling is used for local/hackathon demos (no public webhook required).
- Default rate limit: 90 seconds per chat.
- Optional allowlist: `TELEGRAM_ALLOWED_CHAT_IDS=123,456`
- Image path uses OCR + text verification on the API when Gonka rejects native image blocks.
- Never commit `.env` or real bot tokens.

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { Bot, Context } from 'grammy';
import type { Update } from 'grammy/types';
import { env, passportUrl, webhookUrl } from './config';
import { MeshPassportResult, verifyImage, verifyText, verifyUrl } from './mesh-api';

const URL_RE = /https?:\/\/[^\s<>"')\]]+/i;
const lastRequestAt = new Map<number, number>();
const inFlight = new Set<number>();

const bot = new Bot(env.telegramToken);

function isAllowed(ctx: Context): boolean {
  if (env.allowedChatIds.size === 0) return true;
  const chatId = ctx.chat?.id;
  return typeof chatId === 'number' && env.allowedChatIds.has(String(chatId));
}

function rateLimitMessage(chatId: number): string | null {
  const now = Date.now();
  const previous = lastRequestAt.get(chatId) ?? 0;
  const waitMs = env.rateLimitSeconds * 1000 - (now - previous);
  if (waitMs > 0) {
    const seconds = Math.ceil(waitMs / 1000);
    return `Please wait ${seconds}s before another verification. Gonka multi-model review is expensive.`;
  }
  return null;
}

function markRequested(chatId: number) {
  lastRequestAt.set(chatId, Date.now());
}

function helpText(): string {
  return [
    'Mesh turns digital claims into portable Evidence Passports.',
    '',
    'Send me one of:',
    '• a text claim',
    '• a URL (https://...)',
    '• a screenshot / image',
    '',
    'I call the Mesh API, run multi-model verification, and reply with a Truth Score + public passport link.',
    '',
    'Commands:',
    '/start - intro',
    '/help - usage',
    '/verify - short how-to',
  ].join('\n');
}

function formatResult(result: MeshPassportResult): string {
  const link = passportUrl(result.publicId);
  const summary = result.summary
    ? result.summary.length > 500
      ? `${result.summary.slice(0, 500)}...`
      : result.summary
    : 'No summary returned.';

  return [
    `Verdict: ${result.verdict}`,
    `Truth score: ${Math.round(result.truthScore)}/100`,
    `Confidence: ${Math.round(result.confidenceScore)}/100`,
    '',
    summary,
    '',
    `Passport: ${link}`,
    `ID: ${result.publicId}`,
  ].join('\n');
}

async function guard(ctx: Context): Promise<boolean> {
  if (!isAllowed(ctx)) {
    await ctx.reply('This Mesh demo bot is restricted to allowlisted chats right now.');
    return false;
  }
  const chatId = ctx.chat?.id;
  if (typeof chatId !== 'number') return false;
  if (inFlight.has(chatId)) {
    await ctx.reply(
      'A verification is already running in this chat. Please wait for it to finish.',
    );
    return false;
  }
  const limited = rateLimitMessage(chatId);
  if (limited) {
    await ctx.reply(limited);
    return false;
  }
  return true;
}

async function runVerification(
  ctx: Context,
  work: () => Promise<MeshPassportResult>,
  label: string,
) {
  const chatId = ctx.chat?.id;
  if (typeof chatId !== 'number') return;

  const ok = await guard(ctx);
  if (!ok) return;

  inFlight.add(chatId);
  markRequested(chatId);

  const status = await ctx.reply(
    `Working on your ${label}. Multi-model review can take up to a minute. Keep this chat open.`,
  );

  try {
    const result = await work();
    await ctx.api.editMessageText(chatId, status.message_id, formatResult(result), {
      link_preview_options: { is_disabled: true },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.name === 'AbortError'
          ? 'Mesh API timed out. Try again with a shorter claim or check that the API is running.'
          : error.message
        : 'Unknown verification failure';
    await ctx.api.editMessageText(chatId, status.message_id, `Verification failed\n${message}`);
  } finally {
    inFlight.delete(chatId);
  }
}

bot.command('start', async (ctx) => {
  if (!isAllowed(ctx)) {
    await ctx.reply('This Mesh demo bot is restricted to allowlisted chats right now.');
    return;
  }
  await ctx.reply(
    [
      'Mesh Telegram client',
      '',
      'Every digital claim deserves a verifiable Evidence Passport.',
      '',
      helpText(),
    ].join('\n'),
  );
});

bot.command(['help', 'verify'], async (ctx) => {
  if (!isAllowed(ctx)) {
    await ctx.reply('This Mesh demo bot is restricted to allowlisted chats right now.');
    return;
  }
  await ctx.reply(helpText());
});

bot.on('message:text', async (ctx) => {
  const text = ctx.message.text.trim();
  if (!text || text.startsWith('/')) return;

  const urlMatch = text.match(URL_RE);
  if (urlMatch && text.replace(urlMatch[0], '').trim().length === 0) {
    await runVerification(ctx, () => verifyUrl(urlMatch[0]), 'URL');
    return;
  }

  if (urlMatch && text.length <= 300) {
    await runVerification(ctx, () => verifyUrl(urlMatch[0]), 'URL');
    return;
  }

  if (text.length < 3) {
    await ctx.reply('Send a claim with at least 3 characters, a URL, or an image.');
    return;
  }

  if (text.length > 10000) {
    await ctx.reply('Text is too long. Mesh accepts up to 10,000 characters.');
    return;
  }

  await runVerification(ctx, () => verifyText(text), 'text claim');
});

bot.on('message:photo', async (ctx) => {
  const photos = ctx.message.photo;
  const best = photos[photos.length - 1];
  if (!best) {
    await ctx.reply('Could not read that photo.');
    return;
  }

  await runVerification(
    ctx,
    async () => {
      const file = await ctx.api.getFile(best.file_id);
      if (!file.file_path) throw new Error('Telegram did not return a file path for this image.');
      const fileUrl = `https://api.telegram.org/file/bot${env.telegramToken}/${file.file_path}`;
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Failed to download image from Telegram.');
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (bytes.byteLength > 5 * 1024 * 1024) {
        throw new Error('Image exceeds the 5MB Mesh limit.');
      }
      return verifyImage(bytes, 'telegram-photo.jpg', 'image/jpeg');
    },
    'image',
  );
});

bot.on('message:document', async (ctx) => {
  const doc = ctx.message.document;
  if (!doc.mime_type?.startsWith('image/')) {
    await ctx.reply('Send an image file (PNG, JPEG, or WebP), a text claim, or a URL.');
    return;
  }
  if ((doc.file_size ?? 0) > 5 * 1024 * 1024) {
    await ctx.reply('Image exceeds the 5MB Mesh limit.');
    return;
  }

  await runVerification(
    ctx,
    async () => {
      const file = await ctx.api.getFile(doc.file_id);
      if (!file.file_path)
        throw new Error('Telegram did not return a file path for this document.');
      const fileUrl = `https://api.telegram.org/file/bot${env.telegramToken}/${file.file_path}`;
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Failed to download image from Telegram.');
      const bytes = new Uint8Array(await response.arrayBuffer());
      const name = doc.file_name || 'telegram-image';
      return verifyImage(bytes, name, doc.mime_type || 'image/jpeg');
    },
    'image',
  );
});

bot.catch((err) => {
  const error = err.error as { error_code?: number; description?: string; message?: string };
  if (
    error?.error_code === 409 ||
    String(error?.description || error?.message || '').includes('409')
  ) {
    console.error(
      'Telegram 409 conflict: another bot process is already long-polling this token. Stop other instances and retry.',
    );
    process.exit(1);
  }
  console.error('Bot error', err.error);
});

async function startPolling() {
  console.log('Mode: long polling');
  await bot.api.deleteWebhook({ drop_pending_updates: true });
  await bot.start({
    drop_pending_updates: true,
    onStart: (info) => {
      console.log(`Bot @${info.username} is online`);
    },
  });
}

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
}

async function startWebhook() {
  const url = webhookUrl();
  const path = env.webhookPath.startsWith('/') ? env.webhookPath : `/${env.webhookPath}`;
  console.log('Mode: webhook (async, free-web-service friendly)');
  console.log(`Webhook URL: ${url}`);

  const server = createServer(async (req, res) => {
    try {
      const pathname = req.url?.split('?')[0] || '/';

      if (req.method === 'GET' && (pathname === '/' || pathname === '/health')) {
        sendJson(res, 200, { ok: true, service: 'mesh-telegram-bot', mode: 'webhook' });
        return;
      }

      if (req.method === 'POST' && pathname === path) {
        if (env.webhookSecret) {
          const header = req.headers['x-telegram-bot-api-secret-token'];
          if (header !== env.webhookSecret) {
            sendJson(res, 401, { ok: false, message: 'Invalid webhook secret' });
            return;
          }
        }

        const update = (await readJsonBody(req)) as Update;
        // Reply immediately so free-tier reverse proxies do not time out during long Mesh runs.
        sendJson(res, 200, { ok: true });

        void bot.handleUpdate(update).catch((error) => {
          console.error('Failed to handle Telegram update', error);
        });
        return;
      }

      sendJson(res, 404, { ok: false, message: 'Not found' });
    } catch (error) {
      console.error('HTTP handler error', error);
      if (!res.headersSent) {
        sendJson(res, 500, { ok: false, message: 'Internal error' });
      }
    }
  });

  await new Promise<void>((resolve) => {
    server.listen(env.port, () => resolve());
  });

  await bot.init();

  await bot.api.setWebhook(url, {
    drop_pending_updates: true,
    secret_token: env.webhookSecret || undefined,
  });

  const me = await bot.api.getMe();
  console.log(`Bot @${me.username} is online on port ${env.port}`);
}

async function main() {
  console.log('Mesh Telegram bot starting...');
  console.log(`API: ${env.apiBaseUrl}/${env.apiPrefix}`);
  console.log(`Web: ${env.webBaseUrl}`);
  if (env.allowedChatIds.size > 0) {
    console.log(`Allowlist: ${[...env.allowedChatIds].join(', ')}`);
  } else {
    console.log('Allowlist: open (all chats)');
  }

  if (env.mode === 'webhook') {
    await startWebhook();
  } else {
    await startPolling();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('409') || message.includes('Conflict')) {
    console.error(
      'Telegram 409 conflict: only one long-polling instance can run per bot token. Kill other `telegram-bot` processes and start again.',
    );
  } else {
    console.error(error);
  }
  process.exit(1);
});

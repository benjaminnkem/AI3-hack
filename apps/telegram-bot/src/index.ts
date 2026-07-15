import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { Bot, Context, InlineKeyboard } from 'grammy';
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
    return `⏳ <b>Cooldown active</b>\n\nPlease wait <b>${seconds}s</b> before another verification.\nMulti-model AI review is resource-intensive.`;
  }
  return null;
}

function markRequested(chatId: number) {
  lastRequestAt.set(chatId, Date.now());
}

function scoreBar(score: number): string {
  const filled = Math.round(score / 10);
  const empty = 10 - filled;
  return '▓'.repeat(filled) + '░'.repeat(empty);
}

function verdictEmoji(verdict: string): string {
  const v = verdict.toUpperCase();
  if (v.includes('TRUE') || v.includes('VERIFIED') || v.includes('CONFIRM')) return '✅';
  if (v.includes('FALSE') || v.includes('DEBUNK') || v.includes('REFUT')) return '❌';
  if (v.includes('PARTIAL') || v.includes('MIXED') || v.includes('MISLEAD')) return '⚠️';
  if (v.includes('UNVERIF') || v.includes('INCONC') || v.includes('UNKNOWN')) return '❔';
  return '🔍';
}

function scoreEmoji(score: number): string {
  if (score >= 80) return '🟢';
  if (score >= 60) return '🟡';
  if (score >= 40) return '🟠';
  return '🔴';
}

function helpText(): string {
  return [
    '🛡️ <b>Mesh Evidence Passports</b>',
    '',
    'Turn any digital claim into a verifiable, portable Evidence Passport — powered by multi-model AI verification.',
    '',
    '━━━━━━━━━━━━━━━━━━',
    '',
    '📝 <b>What can I verify?</b>',
    '',
    '  📄 <b>Text claim</b> — paste any statement',
    '  🔗 <b>URL</b> — send a link to an article or post',
    '  📸 <b>Image</b> — upload a screenshot or photo',
    '',
    '━━━━━━━━━━━━━━━━━━',
    '',
    '⚡ <b>Commands</b>',
    '',
    '  /start — Welcome \u0026 intro',
    '  /help — This guide',
    '  /verify — Quick how-to',
    '',
    '━━━━━━━━━━━━━━━━━━',
    '',
    '💡 <i>Just send your claim directly — no command needed!</i>',
  ].join('\n');
}

function verifyHowTo(): string {
  return [
    '⚡ <b>Quick Verification Guide</b>',
    '',
    '<b>Step 1:</b> Send me a claim',
    '  → Text, URL, or image',
    '',
    '<b>Step 2:</b> Wait for AI review',
    '  → Multiple AI models cross-check your claim',
    '  → This usually takes 30–60 seconds',
    '',
    '<b>Step 3:</b> Get your results',
    '  → Truth Score, Confidence, Verdict',
    '  → A shareable Evidence Passport link',
    '',
    '━━━━━━━━━━━━━━━━━━',
    '',
    '🧪 <b>Try it now!</b> Paste a claim below 👇',
  ].join('\n');
}

function formatResult(result: MeshPassportResult): string {
  const link = passportUrl(result.publicId);
  const emoji = verdictEmoji(result.verdict);
  const truthScore = Math.round(result.truthScore);
  const confidenceScore = Math.round(result.confidenceScore);

  const summary = result.summary
    ? result.summary.length > 500
      ? `${result.summary.slice(0, 500)}…`
      : result.summary
    : 'No summary available.';

  return [
    `${emoji} <b>Verification Complete</b>`,
    '',
    '━━━━━━━━━━━━━━━━━━',
    '',
    `📋 <b>Verdict:</b> ${result.verdict}`,
    '',
    `${scoreEmoji(truthScore)} <b>Truth Score</b>`,
    `   ${scoreBar(truthScore)}  <b>${truthScore}</b>/100`,
    '',
    `🎯 <b>Confidence</b>`,
    `   ${scoreBar(confidenceScore)}  <b>${confidenceScore}</b>/100`,
    '',
    '━━━━━━━━━━━━━━━━━━',
    '',
    `💬 <b>Summary</b>`,
    summary,
    '',
    '━━━━━━━━━━━━━━━━━━',
    '',
    `🆔 <code>${result.publicId}</code>`,
  ].join('\n');
}

function resultKeyboard(publicId: string): InlineKeyboard {
  const link = passportUrl(publicId);
  return new InlineKeyboard()
    .url('🔗 View Passport', link)
    .row()
    .text('🔄 Verify Another', 'verify_another');
}

async function guard(ctx: Context): Promise<boolean> {
  if (!isAllowed(ctx)) {
    await ctx.reply('🔒 This Mesh bot is currently restricted to allowlisted chats.', {
      parse_mode: 'HTML',
    });
    return false;
  }
  const chatId = ctx.chat?.id;
  if (typeof chatId !== 'number') return false;
  if (inFlight.has(chatId)) {
    await ctx.reply(
      '⏳ A verification is already in progress.\nPlease wait for it to finish before starting another.',
      { parse_mode: 'HTML' },
    );
    return false;
  }
  const limited = rateLimitMessage(chatId);
  if (limited) {
    await ctx.reply(limited, { parse_mode: 'HTML' });
    return false;
  }
  return true;
}

const loadingFrames = [
  '🔬 Analyzing with multiple AI models…',
  '🧠 Cross-referencing sources…',
  '📊 Calculating truth score…',
  '📝 Generating evidence summary…',
];

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

  await ctx.replyWithChatAction('typing');

  const labelEmoji =
    label === 'URL' ? '🔗' : label === 'image' ? '📸' : '📄';

  const status = await ctx.reply(
    [
      `${labelEmoji} <b>Verifying your ${label}…</b>`,
      '',
      `${loadingFrames[0]}`,
      '',
      '<i>This typically takes 30–60 seconds.</i>',
    ].join('\n'),
    { parse_mode: 'HTML' },
  );

  let frameIndex = 0;
  const animationInterval = setInterval(async () => {
    frameIndex = (frameIndex + 1) % loadingFrames.length;
    try {
      await ctx.replyWithChatAction('typing');
      await ctx.api.editMessageText(
        chatId,
        status.message_id,
        [
          `${labelEmoji} <b>Verifying your ${label}…</b>`,
          '',
          `${loadingFrames[frameIndex]}`,
          '',
          '<i>This typically takes 30–60 seconds.</i>',
        ].join('\n'),
        { parse_mode: 'HTML' },
      );
    } catch {
      /* Telegram may reject edits if content is identical or too fast */
    }
  }, 8000);

  try {
    const result = await work();
    clearInterval(animationInterval);
    await ctx.api.editMessageText(chatId, status.message_id, formatResult(result), {
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
      reply_markup: resultKeyboard(result.publicId),
    });
  } catch (error) {
    clearInterval(animationInterval);
    const message =
      error instanceof Error
        ? error.name === 'AbortError'
          ? 'The Mesh API timed out. Try a shorter claim or check that the API is online.'
          : error.message
        : 'Unknown verification failure';
    await ctx.api.editMessageText(
      chatId,
      status.message_id,
      [
        '❌ <b>Verification Failed</b>',
        '',
        `${message}`,
        '',
        '<i>Try again or send a different claim.</i>',
      ].join('\n'),
      { parse_mode: 'HTML' },
    );
  } finally {
    inFlight.delete(chatId);
  }
}

bot.command('start', async (ctx) => {
  if (!isAllowed(ctx)) {
    await ctx.reply('🔒 This Mesh bot is currently restricted to allowlisted chats.', {
      parse_mode: 'HTML',
    });
    return;
  }

  const name = ctx.from?.first_name || 'there';
  await ctx.reply(
    [
      `👋 Hey <b>${name}</b>!`,
      '',
      '🛡️ Welcome to <b>Mesh</b> — the Evidence Passport engine.',
      '',
      'Every digital claim deserves a verifiable, portable proof.',
      'Send me a claim and I\'ll run <b>multi-model AI verification</b>, then give you a shareable passport.',
      '',
      '━━━━━━━━━━━━━━━━━━',
      '',
      '🚀 <b>Get started:</b> Just send me any claim!',
      '',
      '  📄 Text — <i>"The Earth is 4.5 billion years old"</i>',
      '  🔗 URL — <i>paste an article link</i>',
      '  📸 Image — <i>upload a screenshot</i>',
      '',
      'Type /help for the full guide.',
    ].join('\n'),
    { parse_mode: 'HTML' },
  );
});

bot.command('help', async (ctx) => {
  if (!isAllowed(ctx)) {
    await ctx.reply('🔒 This Mesh bot is currently restricted to allowlisted chats.', {
      parse_mode: 'HTML',
    });
    return;
  }
  await ctx.reply(helpText(), { parse_mode: 'HTML' });
});

bot.command('verify', async (ctx) => {
  if (!isAllowed(ctx)) {
    await ctx.reply('🔒 This Mesh bot is currently restricted to allowlisted chats.', {
      parse_mode: 'HTML',
    });
    return;
  }
  await ctx.reply(verifyHowTo(), { parse_mode: 'HTML' });
});

bot.callbackQuery('verify_another', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    [
      '🔄 <b>Ready for another verification!</b>',
      '',
      'Send me a text claim, URL, or image.',
    ].join('\n'),
    { parse_mode: 'HTML' },
  );
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
    await ctx.reply(
      '✏️ That\'s too short — send a claim with at least <b>3 characters</b>, a URL, or an image.',
      { parse_mode: 'HTML' },
    );
    return;
  }

  if (text.length > 10000) {
    await ctx.reply(
      '📏 That\'s too long — Mesh accepts up to <b>10,000 characters</b>. Try shortening your claim.',
      { parse_mode: 'HTML' },
    );
    return;
  }

  await runVerification(ctx, () => verifyText(text), 'text claim');
});

bot.on('message:photo', async (ctx) => {
  const photos = ctx.message.photo;
  const best = photos[photos.length - 1];
  if (!best) {
    await ctx.reply('📸 Couldn\'t read that photo. Please try again with a clearer image.', {
      parse_mode: 'HTML',
    });
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
        throw new Error('Image exceeds the 5 MB Mesh limit. Try a smaller file.');
      }
      return verifyImage(bytes, 'telegram-photo.jpg', 'image/jpeg');
    },
    'image',
  );
});

bot.on('message:document', async (ctx) => {
  const doc = ctx.message.document;
  if (!doc.mime_type?.startsWith('image/')) {
    await ctx.reply(
      '📎 That file type isn\'t supported.\n\nSend an <b>image</b> (PNG, JPEG, WebP), a <b>text claim</b>, or a <b>URL</b>.',
      { parse_mode: 'HTML' },
    );
    return;
  }
  if ((doc.file_size ?? 0) > 5 * 1024 * 1024) {
    await ctx.reply('📏 Image exceeds the <b>5 MB</b> Mesh limit. Try a smaller file.', {
      parse_mode: 'HTML',
    });
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

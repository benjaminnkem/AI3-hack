import { config as loadEnv } from 'dotenv';
import { resolve } from 'node:path';

loadEnv({ path: resolve(__dirname, '../.env') });
loadEnv();

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function optional(name: string, fallback = ''): string {
  const value = process.env[name]?.trim();
  return value || fallback;
}

const allowed = optional('TELEGRAM_ALLOWED_CHAT_IDS')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const renderExternalUrl = optional('RENDER_EXTERNAL_URL').replace(/\/$/, '');
const webhookBase =
  optional('TELEGRAM_WEBHOOK_URL').replace(/\/$/, '') ||
  optional('WEBHOOK_URL').replace(/\/$/, '') ||
  renderExternalUrl;

const modeEnv = optional('TELEGRAM_MODE').toLowerCase();
const mode: 'polling' | 'webhook' =
  modeEnv === 'webhook' || modeEnv === 'polling'
    ? modeEnv
    : webhookBase
      ? 'webhook'
      : 'polling';

export const env = {
  telegramToken: required('TELEGRAM_BOT_TOKEN'),
  apiBaseUrl: optional('MESH_API_BASE_URL', 'http://localhost:4000').replace(/\/$/, ''),
  webBaseUrl: optional('MESH_WEB_BASE_URL', 'http://localhost:3000').replace(/\/$/, ''),
  apiPrefix: optional('MESH_API_PREFIX', 'api/v1').replace(/^\/|\/$/g, ''),
  allowedChatIds: new Set(allowed),
  rateLimitSeconds: Math.max(15, Number(optional('TELEGRAM_RATE_LIMIT_SECONDS', '90')) || 90),
  requestTimeoutMs: Math.max(
    30_000,
    Number(optional('MESH_REQUEST_TIMEOUT_MS', '180000')) || 180_000,
  ),
  mode,
  port: Number(optional('PORT', '8080')) || 8080,
  webhookBase,
  webhookPath: optional('TELEGRAM_WEBHOOK_PATH', '/telegram/webhook') || '/telegram/webhook',
  webhookSecret: optional('TELEGRAM_WEBHOOK_SECRET'),
};

export function apiUrl(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${env.apiBaseUrl}/${env.apiPrefix}${clean}`;
}

export function passportUrl(publicId: string): string {
  return `${env.webBaseUrl}/passport/${publicId}`;
}

export function webhookUrl(): string {
  if (!env.webhookBase) {
    throw new Error('TELEGRAM_WEBHOOK_URL or RENDER_EXTERNAL_URL is required in webhook mode');
  }
  const path = env.webhookPath.startsWith('/') ? env.webhookPath : `/${env.webhookPath}`;
  return `${env.webhookBase}${path}`;
}

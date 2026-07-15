import { config as loadEnv } from 'dotenv';
import { resolve } from 'node:path';

loadEnv({ path: resolve(__dirname, '../.env') });
loadEnv();

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function optional(name: string, fallback: string): string {
  const value = process.env[name]?.trim();
  return value || fallback;
}

const allowed = optional('TELEGRAM_ALLOWED_CHAT_IDS', '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

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
};

export function apiUrl(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${env.apiBaseUrl}/${env.apiPrefix}${clean}`;
}

export function passportUrl(publicId: string): string {
  return `${env.webBaseUrl}/passport/${publicId}`;
}

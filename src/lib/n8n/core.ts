/**
 * @fileOverview Shared core for all n8n webhook delivery.
 *
 * Resolution order (highest wins):
 *   1. Per-event environment variable  (NEXT_PUBLIC_N8N_URL_*)
 *   2. Per-event Firestore override    (settings/branding.webhookUrl*)
 *   3. Firestore base URL              (settings/branding.n8nWebhookUrl)
 *   4. NEXT_PUBLIC_N8N_BASE_URL        (build-time env)
 *   5. Built-in production default
 *
 * Delivery: JSON POST with AbortController timeout + exponential
 * backoff retry (only for network errors / 5xx — 4xx is a config error
 * and is returned immediately with a human-readable hint).
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

export type WebhookEvent =
  | 'volta-booking'
  | 'car-added'
  | 'driver-added'
  | 'volta-user-register'
  | 'payment-verified'
  | 'booking-status-updated'
  | 'telegram-webhook'
  // automation.ts extras
  | 'booking-completed'
  | 'risk-alert'
  | 'pricing-strategy';

export interface N8NResult {
  ok: boolean;
  status: number | 'ERR';
  attempts: number;
  url?: string;
  durationMs: number;
  error?: string;
  data?: any;
}

/** Production path — test webhooks only fire while n8n "Listen for test event" is armed. */
const PRODUCTION_DEFAULT_BASE =
  'https://mwijay-automation.duckdns.org/webhook/volta-booking';

const ENV_SPECIFIC: Record<string, string | undefined> = {
  'volta-booking': process.env.NEXT_PUBLIC_N8N_URL_BOOKING,
  'payment-verified': process.env.NEXT_PUBLIC_N8N_URL_PAYMENT,
  'booking-status-updated': process.env.NEXT_PUBLIC_N8N_URL_STATUS,
  'car-added': process.env.NEXT_PUBLIC_N8N_URL_CAR,
  'driver-added': process.env.NEXT_PUBLIC_N8N_URL_DRIVER,
  'volta-user-register': process.env.NEXT_PUBLIC_N8N_URL_USER,
  'telegram-webhook': process.env.NEXT_PUBLIC_N8N_URL_TELEGRAM,
};

const FIRESTORE_SPECIFIC: Record<string, string> = {
  'volta-booking': 'webhookUrlBooking',
  'payment-verified': 'webhookUrlPayment',
  'booking-status-updated': 'webhookUrlStatus',
  'car-added': 'webhookUrlCar',
  'driver-added': 'webhookUrlDriver',
  'volta-user-register': 'webhookUrlUser',
  'telegram-webhook': 'webhookUrlTelegram',
};

/** Derive the concrete webhook URL for an event from a base URL or full path. */
export function resolveWebhookTarget(base: string, event: string): string {
  const input = (base || '').trim().replace(/\/+$/, '');

  let webhookType: 'webhook' | 'webhook-test' = 'webhook';
  if (input.includes('webhook-test')) webhookType = 'webhook-test';
  else if (input.includes('/webhook/') || input.endsWith('/webhook')) webhookType = 'webhook';

  let baseDomain = '';
  try {
    const parsed = new URL(input);
    baseDomain = `${parsed.protocol}//${parsed.host}`;
  } catch {
    const match = input.match(/^(https?:\/\/[^/]+)/);
    baseDomain = match ? match[1] : input;
  }

  const path = event === 'telegram-webhook'
    ? 'volta-tg-bot/webhook'
    : `volta-booking/${event}`;
  return `${baseDomain}/${webhookType}/${path}`;
}

export async function resolveWebhookUrl(
  event: string,
): Promise<{ url: string; companyName: string; source: 'env' | 'firestore-specific' | 'firestore-base' | 'env-base' | 'default' }> {
  let companyName = 'VoltaShowroom Tanzania';
  let fsSpecific = '';
  let fsBase = '';

  // Environment-specific override wins outright (no Firestore round-trip).
  const envSpecific = (ENV_SPECIFIC[event] || '').trim();
  if (envSpecific) return { url: envSpecific, companyName, source: 'env' };

  try {
    const snap = await getDoc(doc(db, 'settings', 'branding'));
    if (snap.exists()) {
      const data = snap.data();
      companyName = data.companyName || companyName;
      fsSpecific = data[FIRESTORE_SPECIFIC[event] || ''] || '';
      fsBase = data.n8nWebhookUrl || '';
    }
  } catch {
    // Firestore unreachable (offline / rules) — fall through to env base/default.
  }

  if (fsSpecific.trim()) return { url: fsSpecific.trim(), companyName, source: 'firestore-specific' };

  const envBase = (process.env.NEXT_PUBLIC_N8N_BASE_URL || '').trim();
  if (fsBase.trim()) return { url: resolveWebhookTarget(fsBase, event), companyName, source: 'firestore-base' };
  if (envBase) return { url: resolveWebhookTarget(envBase, event), companyName, source: 'env-base' };
  return { url: resolveWebhookTarget(PRODUCTION_DEFAULT_BASE, event), companyName, source: 'default' };
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export interface PostOptions {
  timeoutMs?: number;
  retries?: number; // number of retries AFTER the first attempt
}

export async function postJsonWithRetry(
  url: string,
  payload: unknown,
  opts: PostOptions = {},
): Promise<N8NResult> {
  const timeoutMs = opts.timeoutMs ?? 12_000;
  const retries = opts.retries ?? 2;
  const started = Date.now();
  let lastStatus: number | 'ERR' = 'ERR';
  let lastError = 'Unknown error';

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Volta-Event': String((payload as any)?.event ?? ''),
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timer);

      let data: any = null;
      try {
        const ct = res.headers.get('content-type') || '';
        data = ct.includes('application/json') ? await res.json() : await res.text();
      } catch { /* non-JSON body is fine */ }

      if (res.ok) {
        return { ok: true, status: res.status, attempts: attempt, url, durationMs: Date.now() - started, data };
      }

      lastStatus = res.status;
      lastError = res.status === 404
        ? 'HTTP 404 — webhook not registered. Activate the n8n workflow (production /webhook/) or arm "Listen for test event" (/webhook-test/).'
        : `HTTP ${res.status}`;

      // 4xx → configuration/client error, retrying won't help.
      if (res.status >= 400 && res.status < 500) {
        return { ok: false, status: res.status, attempts: attempt, url, durationMs: Date.now() - started, error: lastError, data };
      }
    } catch (e: any) {
      clearTimeout(timer);
      lastStatus = 'ERR';
      lastError = e?.name === 'AbortError'
        ? `Timeout after ${timeoutMs}ms`
        : e?.message || 'Network error (check n8n host reachability / CORS)';
    }

    if (attempt <= retries) {
      // 600ms → 1200ms → 2400ms … plus jitter
      await sleep(600 * 2 ** (attempt - 1) + Math.random() * 250);
    }
  }

  return { ok: false, status: lastStatus, attempts: retries + 1, url, durationMs: Date.now() - started, error: lastError };
}

/** Resolve URL, wrap in the standard envelope, deliver with retry. Never throws. */
export async function sendEnvelope(
  event: string,
  payload: Record<string, any>,
  opts: PostOptions = {},
): Promise<N8NResult> {
  try {
    const { url, companyName } = await resolveWebhookUrl(event);
    const envelope = {
      timestamp: new Date().toISOString(),
      companyName,
      companyId: payload.companyId || 'volta001',
      event,
      ...payload,
    };
    const result = await postJsonWithRetry(url, envelope, opts);
    if (!result.ok) {
      console.warn(`[n8n] ${event} delivery failed after ${result.attempts} attempt(s): ${result.error}`);
    }
    return result;
  } catch (e: any) {
    // Absolute last resort — automation must never break the user flow.
    console.error(`[n8n] ${event} unexpected failure:`, e);
    return { ok: false, status: 'ERR', attempts: 0, durationMs: 0, error: e?.message || 'Unexpected failure' };
  }
}

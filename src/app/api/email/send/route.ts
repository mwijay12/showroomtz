/**
 * @fileOverview POST /api/email/send — transactional email dispatcher.
 * Kinds: welcome | booking | payment
 * Public endpoint (fired from client flows) — hardened with:
 *   • strict allow-list of kinds + payload shape validation
 *   • HTML escaping in templates (templates.ts)
 *   • per-IP+recipient in-memory rate limiting (best-effort, serverless)
 *   • no PII in logs beyond message id
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendMail, isEmailConfigured } from '@/lib/email/mailer';
import {
  welcomeTemplate,
  bookingConfirmationTemplate,
  paymentReceiptTemplate,
} from '@/lib/email/templates';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Kind = 'welcome' | 'booking' | 'payment';

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 6; // per ip+recipient
const globalStore = globalThis as unknown as { __emailRateLimit?: Map<string, number[]> };
if (!globalStore.__emailRateLimit) globalStore.__emailRateLimit = new Map();
const rateLimit = globalStore.__emailRateLimit;

function rateLimited(ip: string, recipient: string): boolean {
  const key = `${ip}|${recipient.toLowerCase()}`;
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const hits = (rateLimit.get(key) || []).filter((t) => t > windowStart);
  if (hits.length >= MAX_PER_WINDOW) {
    rateLimit.set(key, hits);
    return true;
  }
  hits.push(now);
  rateLimit.set(key, hits);
  // Hygiene: keep the map bounded
  if (rateLimit.size > 5000) {
    for (const [k, v] of rateLimit) {
      const kept = v.filter((t) => t > windowStart);
      if (kept.length === 0) rateLimit.delete(k); else rateLimit.set(k, kept);
    }
  }
  return false;
}

const isEmail = (v: unknown): v is string =>
  typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length <= 254;

const str = (v: unknown, max = 200): string =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  // Honeypot: real clients never send `company` — bots do.
  if (body && typeof body === 'object' && str(body.company, 100)) {
    return NextResponse.json({ ok: true }); // silently accept, send nothing
  }

  const kind = str(body?.kind, 20) as Kind;
  if (!['welcome', 'booking', 'payment'].includes(kind)) {
    return NextResponse.json({ ok: false, error: 'invalid_kind' }, { status: 400 });
  }

  const to = str(body?.to, 254).toLowerCase();
  if (!isEmail(to)) {
    return NextResponse.json({ ok: false, error: 'invalid_recipient' }, { status: 400 });
  }

  const ip =
    (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  if (rateLimited(ip, to)) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  let rendered: { subject: string; html: string };
  try {
    if (kind === 'welcome') {
      rendered = welcomeTemplate({ name: str(body?.name, 120) });
    } else if (kind === 'booking') {
      rendered = bookingConfirmationTemplate({
        name: str(body?.name, 120),
        vehicleName: str(body?.vehicleName, 160),
        reference: str(body?.reference, 60),
        showroomName: str(body?.showroomName, 160),
        preferredDate: str(body?.preferredDate, 80),
        city: str(body?.city, 80),
      });
    } else {
      const rawAmount = body?.amount;
      const amount = typeof rawAmount === 'number' ? rawAmount : Number(String(rawAmount ?? '').replace(/[^0-9.]/g, ''));
      rendered = paymentReceiptTemplate({
        name: str(body?.name, 120),
        amount: Number.isFinite(amount) ? amount : 0,
        bookingCode: str(body?.bookingCode, 60),
        vehicleName: str(body?.vehicleName, 160),
        reference: str(body?.reference, 80),
        method: str(body?.method, 60),
      });
    }
  } catch (e: any) {
    console.error('[email] template render failed:', e?.message);
    return NextResponse.json({ ok: false, error: 'template_error' }, { status: 500 });
  }

  const result = await sendMail({ to, subject: rendered.subject, html: rendered.html });

  if (!result.configured) {
    // Not an error the user flow cares about — client logs quietly.
    return NextResponse.json({ ok: false, configured: false, error: 'email_not_configured' }, { status: 503 });
  }
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error || 'send_failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true, messageId: result.messageId });
}

// Helpful for uptime checks / setup verification (no secrets leaked)
export async function GET() {
  return NextResponse.json({ ok: true, configured: isEmailConfigured(), kinds: ['welcome', 'booking', 'payment'] });
}

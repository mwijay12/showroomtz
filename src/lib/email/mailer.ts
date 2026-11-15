/**
 * @fileOverview Nodemailer transport for ShowroomTZ transactional email.
 * Reads SMTP_* env vars. Never throws into request handlers — callers get
 * a typed result object instead. Safe to import in route handlers only
 * (server-side; uses nodemailer + process.env secrets).
 */

import nodemailer, { type Transporter } from 'nodemailer';

export interface SendResult {
  ok: boolean;
  /** false when SMTP_* env vars are missing/placeholder — caller decides whether to surface this. */
  configured: boolean;
  messageId?: string;
  error?: string;
}

let cachedTransport: Transporter | null = null;

export function isEmailConfigured(): boolean {
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();
  // Treat empty strings and obvious placeholders as not-configured
  if (!user || !pass) return false;
  if (/^(your|changeme|xxx|placeholder)/i.test(user) || /^(your|changeme|xxx|placeholder)/i.test(pass)) return false;
  return true;
}

function getTransport(): Transporter {
  if (cachedTransport) return cachedTransport;

  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const port = Number(process.env.SMTP_PORT || '465');
  const secure = (process.env.SMTP_SECURE ?? (port === 465 ? 'true' : 'false')).toString().toLowerCase() !== 'false';

  cachedTransport = nodemailer.createTransport({
    host,
    port: Number.isFinite(port) ? port : 465,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
    pool: true,
    maxConnections: 3,
    maxMessages: 50,
  });
  return cachedTransport;
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<SendResult> {
  if (!isEmailConfigured()) {
    return { ok: false, configured: false, error: 'SMTP_USER / SMTP_PASS are not configured.' };
  }
  if (!opts.to || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(opts.to)) {
    return { ok: false, configured: true, error: 'Invalid recipient address.' };
  }

  const fromName = (process.env.SMTP_FROM_NAME || 'ShowroomTZ').trim();
  const fromAddr = (process.env.SMTP_FROM || process.env.SMTP_USER || '').trim();

  try {
    const info = await getTransport().sendMail({
      from: `"${fromName.replace(/"/g, '')}" <${fromAddr}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo || fromAddr,
    });
    return { ok: true, configured: true, messageId: info.messageId };
  } catch (e: any) {
    // Drop pooled connections on auth errors so a config fix doesn't need a restart
    const code = e?.code || '';
    if (code === 'EAUTH' || code === 'ESOCKET' || code === 'ECONNECTION') {
      cachedTransport = null;
    }
    console.error('[email] sendMail failed:', code, e?.message);
    return { ok: false, configured: true, error: e?.message || 'SMTP send failed.' };
  }
}

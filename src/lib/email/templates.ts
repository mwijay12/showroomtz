/**
 * @fileOverview Transactional email templates for ShowroomTZ.
 * Inline CSS, table-safe HTML, dark-header crimson brand block.
 * ALL dynamic values must pass through `esc()` before interpolation.
 */

const BRAND = '#D42B1E';   // ShowroomTZ crimson
const INK = '#0B0B0F';
const MUTED = '#6B7280';

export function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Plain-text subject values: strip CR/LF (header safety) and collapse whitespace. */
function escText(value: unknown): string {
  return String(value ?? '').replace(/[\r\n]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
}


function shell(opts: { title: string; preheader: string; body: string }) {
  const { title, preheader, body } = opts;
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background:#0B0B0F;font-family:Inter,Arial,Helvetica,sans-serif;">
<!-- Preheader (hidden preview text) -->
<div style="display:none!important;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${esc(preheader)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#0B0B0F;">
  <tr>
    <td align="center" style="padding:32px 12px 40px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.45);">
        <!-- Brand bar -->
        <tr>
          <td style="background:${INK};padding:26px 32px;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="vertical-align:middle;">
                  <span style="display:inline-block;width:38px;height:38px;border-radius:10px;background:${BRAND};color:#FFFFFF;font-weight:900;font-size:20px;line-height:38px;text-align:center;vertical-align:middle;">S</span>
                  <span style="display:inline-block;vertical-align:middle;margin-left:12px;color:#FFFFFF;font-weight:900;font-size:20px;letter-spacing:2px;">SHOWROOM<span style="color:${BRAND};">TZ</span></span>
                </td>
                <td align="right" style="vertical-align:middle;">
                  <span style="color:#9CA3AF;font-size:10px;letter-spacing:3px;font-weight:700;">TANZANIA</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:32px 32px 8px 32px;">${body}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px 28px;border-top:1px solid #EEF0F3;">
            <p style="margin:0;color:${MUTED};font-size:11px;line-height:1.7;">
              <strong style="color:#111827;">ShowroomTZ Tanzania</strong> · Mikocheni Area, Dar es Salaam<br />
              WhatsApp: +255 700 000 000 · <a href="https://voltashowroom.co.tz" style="color:${BRAND};text-decoration:none;font-weight:700;">voltashowroom.co.tz</a><br />
              <span style="font-size:10px;">You received this email because this address was used on voltashowroom.co.tz. Questions? Reply to this email or WhatsApp us.</span>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

const btn = (href: string, label: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
     <tr><td style="border-radius:14px;background:${BRAND};">
       <a href="${esc(href)}" style="display:inline-block;padding:16px 34px;color:#FFFFFF;font-size:12px;font-weight:800;letter-spacing:2px;text-decoration:none;border-radius:14px;">${esc(label)}</a>
     </td></tr>
   </table>`;

const h1 = (text: string) =>
  `<h1 style="margin:0 0 6px 0;color:#111827;font-size:26px;line-height:1.15;font-weight:900;letter-spacing:-0.5px;">${esc(text)}</h1>`;
const p = (text: string) =>
  `<p style="margin:12px 0 0 0;color:#374151;font-size:14px;line-height:1.7;">${text}</p>`;
const table = (rows: Array<[string, string]>) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:18px 0;border:1px solid #EEF0F3;border-radius:14px;overflow:hidden;">
     ${rows.map(([k, v]) => `<tr>
        <td style="padding:12px 16px;background:#F9FAFB;color:${MUTED};font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;border-bottom:1px solid #EEF0F3;width:42%;">${esc(k)}</td>
        <td style="padding:12px 16px;color:#111827;font-size:13px;font-weight:700;border-bottom:1px solid #EEF0F3;">${esc(v)}</td>
      </tr>`).join('')}
   </table>`;

// ── 1) Welcome ────────────────────────────────────────────────────────────────
export function welcomeTemplate(input: { name?: string | null }) {
  const firstName = (input.name || 'mtu wangu').trim().split(/\s+/)[0];
  const name = esc(firstName);
  const preheader = `Karibu ShowroomTZ — your account is live. Browse verified motors now.`;
  const body = `
    ${h1(`Karibu, ${name}! 🚗`)}
    ${p(`Asante kwa kujiunga na <strong>ShowroomTZ</strong> — Tanzania's home for verified, duty-cleared vehicles from trusted showroom dealers across Dar es Salaam, Arusha and Zanzibar.`)}
    ${p(`Your account is active. Here is what you can do right now:`)}
    <ul style="margin:14px 0 0 18px;padding:0;color:#374151;font-size:14px;line-height:1.9;">
      <li><strong>Browse</strong> 500+ verified vehicles (SUVs, sedans, vans & luxury marques)</li>
      <li><strong>Book a viewing / test drive</strong> directly with the showroom</li>
      <li><strong>Use Find-My-Car</strong> — our AI matcher narrows the list for you</li>
      <li><strong>Compare</strong> up to 3 vehicles side by side</li>
    </ul>
    ${btn('https://voltashowroom.co.tz/cars', 'BROWSE VEHICLES')}
    ${p(`<span style="color:${MUTED};font-size:12px;">Need help? Just reply to this email — a human at the showroom desk reads every message.</span>`)}
  `;
  return { subject: `Karibu ShowroomTZ, ${escText(firstName)}! 🚗 Your account is live`, html: shell({ title: 'Welcome to ShowroomTZ', preheader, body }) };
}

// ── 2) Booking / inquiry confirmation ────────────────────────────────────────
export function bookingConfirmationTemplate(input: {
  name?: string | null;
  vehicleName?: string;
  reference?: string;
  showroomName?: string;
  preferredDate?: string;
  city?: string;
}) {
  const firstName = (input.name || 'customer').trim().split(/\s+/)[0];
  const preheader = `Your inquiry ${input.reference || ''} is confirmed — the showroom will reach out shortly.`;
  const body = `
    ${h1(`Inquiry received, ${esc(firstName)}.`)}
    ${p(`We have sent your request straight to the showroom. Expect a call / WhatsApp within <strong>2 working hours</strong> (Mon–Sat, 8:00–18:00 EAT).`)}
    ${table([
      ['Reference', input.reference || 'PENDING'],
      ['Vehicle', input.vehicleName || 'Selected vehicle'],
      ['Showroom', input.showroomName || 'ShowroomTZ Partner Showroom'],
      ...(input.city ? [['Preferred City', input.city] as [string, string]] : []),
      ...(input.preferredDate ? [['Preferred Date', input.preferredDate] as [string, string]] : []),
    ])}
    ${btn('https://voltashowroom.co.tz/cars', 'BROWSE MORE VEHICLES')}
    ${p(`<span style="color:${MUTED};font-size:12px;">Save the reference code — you will need it when you visit or call the showroom.</span>`)}
  `;
  return { subject: `Showroom received your inquiry${input.reference ? ` — ${escText(input.reference)}` : ''}`, html: shell({ title: 'Inquiry Confirmation', preheader, body }) };
}

// ── 3) Payment receipt ───────────────────────────────────────────────────────
export function paymentReceiptTemplate(input: {
  name?: string | null;
  amount?: number | string;
  bookingCode?: string;
  vehicleName?: string;
  reference?: string;
  method?: string;
}) {
  const firstName = (input.name || 'customer').trim().split(/\s+/)[0];
  const amountNum = Number(input.amount || 0);
  const amountFmt = `TSh ${Number.isFinite(amountNum) ? amountNum.toLocaleString('en-TZ') : esc(String(input.amount ?? '0'))}`;
  const preheader = `Payment of ${amountFmt} received — showroom booking is confirmed.`;
  const body = `
    ${h1(`Payment received — asante, ${esc(firstName)}.`)}
    ${p(`We have received your payment. Your booking is now <strong>CONFIRMED</strong> and the showroom has been notified automatically.`)}
    ${table([
      ['Amount', amountFmt],
      ...(input.bookingCode ? [['Booking Code', input.bookingCode] as [string, string]] : []),
      ...(input.vehicleName ? [['Vehicle', input.vehicleName] as [string, string]] : []),
      ...(input.method ? [['Method', input.method] as [string, string]] : []),
      ...(input.reference ? [['Reference', input.reference] as [string, string]] : []),
    ])}
    ${btn('https://voltashowroom.co.tz/dashboard', 'OPEN MY BOOKINGS')}
    ${p(`<span style="color:${MUTED};font-size:12px;">Bring this receipt (or the booking code) and your ID / passport to the showroom for handover. EFD fiscal receipt will be issued at delivery.</span>`)}
  `;
  return { subject: `Payment confirmed — ${escText(amountFmt)}${input.bookingCode ? ` (${escText(input.bookingCode)})` : ''}`, html: shell({ title: 'Payment Receipt', preheader, body }) };
}

# ShowroomTZ — Premium Upgrade Playbook

> Branch: `arena/8b1f1664-showroomtz` · Nov 2026 · Companion to the Super Admin → **Premium Studio** (`/super-admin/settings/premium`)

This document covers: (1) what shipped, (2) where to learn the craft (repos worth studying), (3) how an admin controls it, (4) how n8n actually works now, (5) how to ship to Vercel.

---

## 1. What shipped

| Layer | File(s) | Notes |
|---|---|---|
| WebGL/GLSL hero shader | `src/components/effects/WebGLShaderBackground.tsx` | Procedural Three.js + hand-written GLSL fbm domain-warping. Three programs: `aurora` (house default), `liquid`, `starfield`. No textures/assets. DPR-capped, pauses on hidden tab, `prefers-reduced-motion` safe, silent fallback without WebGL. |
| Film grain overlay | `src/components/effects/GrainOverlay.tsx` | SVG turbulence 35mm grain, pointer-events free. |
| GSAP ScrollTrigger FX | `src/components/effects/GsapScrollFX.tsx` | `data-gsap="reveal|scrub|zoom"` declarative attributes. Mounted on homepage + campaign pages. Reverts on route change. |
| Homepage integration | `src/app/page.tsx` | Shader behind hero (screen-blended), grain above, announcement ribbon, admin-overridable kicker/headline/CTA labels. |
| Premium Studio (Admin) | `src/app/super-admin/settings/premium/page.tsx` | Toggle WebGL, pick shader style, intensity slider 0–100, grain toggle, hero copy + CTA overrides, announcement ribbon. Live shader preview inside the page. Saves to Firestore `settings/branding`. |
| Campaign landing pages | `/landing`, `/landing/luxury`, `/landing/corporate` (`src/app/landing/**`, `src/components/landing/CampaignPage.tsx`) | Cinematic standalone pages: full-bleed shader, GSAP reveals, featured seed inventory, WhatsApp CTA (reads live `whatsappNumber` from branding), EFD/TRA-compliant messaging. |
| n8n core (rewritten) | `src/lib/n8n/core.ts` | Env → Firestore per-event → Firestore base → env base → production default resolution. `AbortController` timeout (12s), exponential backoff with jitter (600→1200→2400ms), **no retry on 4xx** (config errors), 404 gets a human-readable hint (test vs production webhook). Shared by client + admin test harness. |
| n8n wrappers | `src/lib/n8nWebhook.ts`, `src/lib/automation.ts` | Same public API, zero duplicated fetch logic. |
| Super Admin test harness | `src/app/super-admin/settings/page.tsx` | Test buttons now use the exact shared resolver + timeout — tests reflect production delivery semantics. |
| SEO hygiene | `src/app/sitemap.ts` (rewritten, build-safe, dynamic Firestore dependency removed), stale rental-era `public/sitemap.xml` deleted (wrong domain `voltarentals.co.tz` was shadowing the app route), `robots.txt` + `manifest.json` repointed to voltashowroom.co.tz. |

**Not shipped (deliberately):** Nodemailer welcome emails (deferred by owner), Firebase Admin SDK server proxy for n8n (not required — n8n webhooks accept cross-origin browser posts; see §4).

### Branding type additions (`src/lib/types.ts`)
`webglEnabled`, `webglStyle`, `webglOpacity` (0–100), `grainEnabled`, `heroKicker`, `heroHeadlineLine1`, `heroHeadlineLine2`, `heroCtaPrimary`, `heroCtaSecondary`, `announcementText` — all optional, merged into `settings/branding`.

---

## 2. Repos worth studying (WebGL / GLSL / GSAP / Barba / Anime / Tween)

> Steal patterns, not pixels. License-check (MIT/Apache preferred) before copying assets.

**Awwwards-style builds (GSAP + scroll)**
- `Fullstack-Empire/GSAP-Awwwards-Website` — React + Tailwind + GSAP ScrollTrigger, SOTD-style build. https://github.com/Fullstack-Empire/GSAP-Awwwards-Website
- `Prince-Elie/Spylt-awward-clone` — clone of an Awwwards SOTD using GSAP. https://github.com/Prince-Elie/Spylt-awward-clone
- `sherzodartikbayev/Awwwards-Winning` — React + Tailwind + GSAP, live demo on Vercel. https://github.com/sherzodartikbayev/Awwwards-Winning
- `manish-850/gentlerain.ai` — Gentlerain clone: GSAP + Three.js + Lenis. https://github.com/manish-850/gentlerain.ai
- `jaydickinson/free-gsap-effects` — MIT-licensed drop-in GSAP effects/components. https://github.com/jaydickinson/free-gsap-effects
- `Ibaliqbal/gsap-collection` — GSAP plugin study notebook. https://github.com/Ibaliqbal/gsap-collection

**Three.js / GLSL / WebGL**
- `XFN52/immersive-webgl-water-site` (NIVIS) — React 19 + custom GLSL + Lenis. https://github.com/XFN52/immersive-webgl-water-site
- `Rynia/RyniaStudioSite` — Three.js + GLSL + GSAP + Lenis showcase. https://github.com/Rynia/RyniaStudioSite
- `AETumiApp/aetumi-3d-web-examples` — production Three.js/R3F/Next.js example gallery. https://github.com/AETumiApp/aetumi-3d-web-examples
- `laynesquare/layne-chen-portfolio` — Next.js + Three.js + GSAP. https://github.com/laynesquare/layne-chen-portfolio
- `VMASPAD/ogl-editor` — browser GLSL editor with IntelliSense (great for shader prototyping). https://github.com/VMASPAD/ogl-editor

**Libraries (npm)**
- GSAP (`gsap`) — now in `package.json`. ScrollTrigger is the plugin we use.
- Three.js (`three`) — now in `package.json`.
- Barba.js — page transitions; this repo instead ships `src/components/effects/PageTransition.tsx` (AnimatePresence). Swap-in candidate if you want Barba semantics later.
- Anime.js — lighter tween engine; good for counter/SVG stroke flourishes (we use framer-motion + GSAP).
- Tween.js — minimal tweening; largely superseded by GSAP for our use.
- Lenis — already in the repo (`lenis`) and wired globally for smooth scroll.

**Study order for an AI-assisted workflow:** GSAP ScrollTrigger demos → `gsap-collection` → NIVIS water site (GLSL discipline) → aetumi examples (Next.js integration) → this repo’s `WebGLShaderBackground.tsx`.

---

## 3. Admin controls (no redeploy required)

**Super Admin → Premium Studio** (`/super-admin/settings/premium`, sidebar: "Premium Studio" ✦)

| Control | Effect |
|---|---|
| WebGL Shader toggle | On: GLSL canvas renders behind hero. Off: pure image/video hero. |
| Shader style | `aurora` · `liquid` · `starfield` — switch instantly, preview live in-page. |
| Shader Intensity | 0–100% opacity of the shader layer (blend is `screen`, so black = invisible). |
| 35mm Film Grain | Animated SVG turbulence overlay on the hero. |
| Kicker Pill | Small uppercase line above headline (default "Ready 2026"). |
| Headline Line 1 / 2 | Overrides split of company name. Blank = brand fallback. |
| Primary / Secondary CTA | Button labels. Blank = "Explore Showroom" / "Find My Car". |
| Announcement Ribbon | Site-wide ribbon above the hero; empty = hidden. |

Saves to Firestore `settings/branding` (merged). Existing **Theme Studio** handles palette/fonts/sounds; **Global Protocols** handles n8n/payments/compliance — Premium Studio is purely the cinematic layer.

**Live-update note:** BrandingProvider reads `settings/branding` on mount; already-open tabs pick changes up on reload.

---

## 4. n8n — how it works now

### 4.1 URL resolution (highest priority wins)
1. `NEXT_PUBLIC_N8N_URL_{BOOKING|PAYMENT|STATUS|CAR|DRIVER|USER|TELEGRAM}` (build-time env)
2. Per-event Firestore override (`settings/branding.webhookUrlBooking` …) — set in Global Protocols → Automation
3. Firestore base `settings/branding.n8nWebhookUrl` (e.g. `https://your-host/webhook` or `/webhook-test`)
4. `NEXT_PUBLIC_N8N_BASE_URL` (build-time env)
5. Production default: `https://mwijay-automation.duckdns.org/webhook/volta-booking/<event>` (telegram → `/volta-tg-bot/webhook`)

### 4.2 Test vs production webhooks — the #1 cause of "n8n hai-fanyi kazi"
- `/webhook-test/...` **only fires while the n8n editor has “Listen for test event” armed**, and delivers one call.
- `/webhook/...` fires always, requires the workflow **Active** toggle.
- A 404 from n8n now returns: `HTTP 404 — webhook not registered. Activate the n8n workflow (production /webhook/) or arm "Listen for test event" (/webhook-test/).`

### 4.3 Envelope (every event)
```json
{
  "timestamp": "2026-11-15T…Z",
  "companyName": "ShowroomTZ",
  "companyId": "volta001",
  "event": "volta-booking",
  "...eventSpecificFields": "…"
}
```
(`automation.ts` adds AI fields: `aiPersonalityTag`, `geminiInsight`, `riskStatus`, `riskReason`, `balanceDue`, reminders, `contractUrl` — accounting-sheet ready.)

### 4.4 Delivery guarantees
- 12s `AbortController` timeout per attempt.
- Up to 3 attempts, 600→1200→2400 ms backoff + jitter. **4xx never retried** (it’s config).
- Failures are logged, never thrown — bookings never block on n8n.
- The admin test harness uses the *same* resolver and timeout, so a green test ≈ a working production path.

### 4.5 Browser → n8n CORS
Default deployments work (n8n webhook nodes don’t block cross-origin browser posts for simple JSON). If you front n8n with a reverse proxy that strips/omits CORS headers, either enable them on the proxy or route through a Next.js API route (not included — ask before adding server proxy; requires Firebase Admin SDK credentials).

### 4.6 Android-style checklist for “it just works”
1. n8n workflow = **Active**. 2. Webhook node path matches `/volta-booking/<event>`. 3. Global Protocols → Automation: leave per-event URLs **empty** to use the base, or paste full per-event URLs. 4. Save. 5. Press the test button — you should see HTTP 200 + body in the response viewer. 6. If 404 → §4.2. If timeout → check `duckdns.org` reachability/TLS from the client’s network.

---

## 5. Vercel deployment

Repo is Vercel-ready (Next.js 16, no custom server). Steps:

```bash
# one-time
npm i -g vercel && vercel login
vercel link            # select/create project (e.g. "voltashowroom")

# deploy current branch as a PREVIEW first
vercel deploy

# production (after you review the preview)
vercel deploy --prod
```

**Environment variables** (Vercel → Project → Settings → Environment Variables): none are strictly required — Firebase client config is hardcoded in `src/firebase/config.ts` and n8n has a production default. Recommended overrides:

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_N8N_BASE_URL` | e.g. `https://mwijay-automation.duckdns.org/webhook` (production mode!) |
| `NEXT_PUBLIC_N8N_URL_BOOKING` … `_TELEGRAM` | Per-event full URLs (optional, overrides base) |
| `NEXT_PUBLIC_GA_ID` | Analytics (if used) |

**Domain:** point `voltashowroom.co.tz` → Vercel (A `76.76.21.21` or CNAME to `cname.vercel-dns.com`) after `vercel --prod`. SSL is automatic.

**Known sandbox quirk:** `next/font/google` (Inter) cannot be fetched from an offline sandbox — the build fails *only* at font fetch. Vercel builds fine (full network). For offline builds, temporarily swap `Inter` for a local/system stack, then restore.

---

## 6. Verification log (this branch)

- `tsc --noEmit` — clean.
- `next build` — green; routes include `/`, `/landing`, `/landing/luxury`, `/landing/corporate`, `/super-admin/settings/premium`, `/sitemap.xml`.
- Prod server smoke tests — `/`, `/landing*`, `/sitemap.xml`, `/robots.txt` all HTTP 200; `/super-admin/settings/premium` correctly 307→`/auth` when logged out.

---

## 7. Nodemailer transactional email (welcome / booking / payment)

Transactional email is server-side only via `nodemailer` — no Firebase Admin SDK required.

**Env vars (Vercel → Project → Settings → Environment Variables):**

| Var | Example |
|---|---|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `465` |
| `SMTP_SECURE` | `true` (465) / `false` (587+STARTTLS) |
| `SMTP_USER` | your `*.gmail.com` address |
| `SMTP_PASS` | Gmail **App Password** (16 chars, not your normal password) |
| `SMTP_FROM` | defaults to `SMTP_USER` |
| `SMTP_FROM_NAME` | defaults to `ShowroomTZ` |

**Gmail setup:** enable 2FA → myaccount.google.com/apppasswords → create password → paste into `SMTP_PASS`.

**Endpoint:** `POST /api/email/send` with `{ "kind": "welcome"|"booking"|"payment", "to": "...", ... }`.
`GET /api/email/send` reports `{ configured: bool }` (no secrets). Implements HTML-escaped
templates, per-IP+recipient in-memory rate limiting (6 per 10 min, best-effort serverless), a
`company` honeypot, and returns `503 email_not_configured` instead of crashing the client when
SMTP is missing — client flows (signup, inquiry, payment) never block on email.

**Wired at:**
- `src/app/auth/page.tsx` → `welcome` after signup (Google + email paths).
- `src/components/booking-form-client.tsx` → `booking` confirmation after showroom inquiry submit.
- `src/components/payments/PesapalPayButton.tsx` → `payment` receipt after successful demo/Pesapal payment (both success paths).

**Templates:** `src/lib/email/templates.ts` — dark-header crimson ShowroomTZ shell, table-safe inline CSS,
welcome (karibu message), booking confirmation (reference code + showroom details), payment receipt
(amount + booking code). All user input is HTML-escaped.

---

## 8. ShowroomTZ brand mark + 3D hero (React Three Fiber)

**Problem addressed:** production looked identical to yesterday for visitors, the PWA served stale shell (`voltarentals-v1`), icons still read "SHOWROOMTZ RENTALS" (navy/amber rental-era tile), navbar used the legacy Volta lightning `<Zap>`, accent emerald clashed with the crimson/gold identity, and the "WebGL shader" was a dark-on-dark fbm plane that stayed invisible.

**3D Hero (`src/components/three/HeroScene.tsx`)** — React Three Fiber + Drei + GSAP, zero external assets:
- Procedural GT coupé: 2D silhouette → `ExtrudeGeometry` (bevelled), `MeshPhysicalMaterial` clearcoat paint, separate gloss greenhouse slab, crimson side spears, rear wing, emissive head/taillights, crimson underglow point light
- Blurred planar reflections via `<MeshReflectorMaterial>` floor; local `<Environment frames={1}>` + `<Lightformer>` rig (warm key / crimson rim / cool fill) — **no HDR downloads**
- GSAP timeline on mount: drive-in from off-camera (`expo.out`), wheel spin-down, headlight flash; idle breathing yaw; pointer-parallax camera (`MathUtils.damp`); `Sparkles` gold dust; `fog` depth; DPR capped at 1.6
- `prefers-reduced-motion` respected; WebGL-less devices get the `fallback` prop (hero image or CSS crimson halo) — never a black screen
- Toggled by the existing admin key `webglEnabled`; intensity slider drives scene opacity (Premium Studio → "3D Hero Engine" section, which now previews the *same* scene live)
- Hero image is used only when the 3D scene is switched off **or** WebGL is unavailable

**Brand mark (`src/components/ui/ShowroomMark.tsx`)** — dark espresso tile, champagne italic-serif "S", crimson road-dash (matches `public/icons/icon-192x192.svg` / `icon-512x512.svg`, regenerated). Applied to navbar, footer, mobile menu, splash screen. Old navy/amber rental icons deleted.

**Palette** — dark theme shifted from cold navy-charcoal (`222 47% 4%`) to warm espresso charcoal (`24 10% 4%`); emerald accent replaced with champagne `36 55% 58%`; primary crimson kept; `theme_color`/`background_color` warmed to `#0D0B0A`; service worker cache bumped `showroomtz-v3` so returning visitors actually receive the new shell.

**Deps added:** `@react-three/fiber@^9`, `@react-three/drei@^10` (three `^0.187` already present).

'use client';

/**
 * Stickers — the hand-drawn badge layer.
 *
 * A set of stamped, slightly-irreverent SVG marks that break up the big
 * type and give the site its "workshop paperwork" character: auction
 * seals, duty stamps, doodles of steering wheels, wrenches and road
 * curves, plus speed-line flourishes.
 *
 * Everything is `currentColor`-driven so a sticker can be champagne on
 * dark, crimson on light, or white on a photo, without new assets.
 * Rotation/floating comes from the CSS utilities in globals.css
 * (`animate-float-y`, `orbit-spin`, `animate-tilt`) and is disabled for
 * reduced-motion users automatically.
 */

import { useId } from 'react';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────────────────
   AuctionSeal — circular rotating stamp with text on a path
   ───────────────────────────────────────────────────────────────────── */
export function AuctionSeal({
  className,
  size = 140,
  top = 'JAPAN AUCTION · GRADE 4.5 · VERIFIED · ',
  center = '4.5',
  label = 'GRADE',
  spin = true,
}: {
  className?: string;
  size?: number;
  top?: string;
  center?: string;
  label?: string;
  spin?: boolean;
}) {
  const id = useId().replace(/[:]/g, '');
  const path = `seal-${id}`;

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={cn('select-none', className)}
      fill="none"
      role="img"
      aria-label={`${center} ${label} auction seal`}
    >
      <defs>
        <path
          id={path}
          d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0"
        />
      </defs>

      <circle cx="100" cy="100" r="96" stroke="currentColor" strokeOpacity="0.22" strokeWidth="1" />
      <circle cx="100" cy="100" r="88" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="3 5" />

      <g className={spin ? 'orbit-c' : undefined} style={{ transformOrigin: '100px 100px' }}>
        <text
          fill="currentColor"
          fontSize="13"
          fontWeight="800"
          letterSpacing="3.4"
          fontFamily="Inter, system-ui, sans-serif"
        >
          <textPath href={`#${path}`} startOffset="0">
            {top}
          </textPath>
        </text>
      </g>

      <text
        x="100"
        y="104"
        textAnchor="middle"
        fill="currentColor"
        fontSize="46"
        fontWeight="900"
        letterSpacing="-2"
        fontFamily="Inter, system-ui, sans-serif"
      >
        {center}
      </text>
      <text
        x="100"
        y="126"
        textAnchor="middle"
        fill="currentColor"
        fontSize="10"
        fontWeight="800"
        letterSpacing="4"
        opacity="0.65"
        fontFamily="Inter, system-ui, sans-serif"
      >
        {label}
      </text>
      <path d="M66 138h68" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Stamp — rubber-stamp rectangle (DUTY CLEARED / TRA VERIFIED …)
   ───────────────────────────────────────────────────────────────────── */
export function Stamp({
  text = 'DUTY CLEARED',
  sub,
  className,
  tone = 'currentColor',
}: {
  text?: string;
  sub?: string;
  className?: string;
  tone?: string;
}) {
  return (
    <div
      className={cn(
        'inline-flex select-none flex-col items-center justify-center gap-1 rounded-xl border-[1.5px] px-4 py-2 backdrop-blur-sm',
        className
      )}
      style={{ borderColor: tone, color: tone }}
    >
      <span className="text-[10px] font-black uppercase tracking-[0.24em] leading-none">{text}</span>
      {sub && (
        <span className="text-[7px] font-bold uppercase tracking-[0.3em] opacity-60 leading-none">{sub}</span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Doodles — loose single-weight line drawings
   ───────────────────────────────────────────────────────────────────── */
export function SteeringDoodle({ className, size = 64 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={cn('select-none', className)} fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="32" cy="32" r="7" stroke="currentColor" strokeWidth="2.2" />
      <path d="M32 25V10M25 34l-14 6M39 34l14 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M12 44c6 5 13 7 20 7s14-2 20-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

export function WrenchDoodle({ className, size = 64 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={cn('select-none', className)} fill="none" aria-hidden="true">
      <path
        d="M39 9a12 12 0 0 0-9.6 19.2L14 43.6a4.8 4.8 0 1 0 6.8 6.8l15.4-15.4A12 12 0 1 0 39 9Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M36 15l7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function RoadDoodle({ className, width = 160 }: { className?: string; width?: number }) {
  return (
    <svg viewBox="0 0 160 48" width={width} height={width * 0.3} className={cn('select-none', className)} fill="none" aria-hidden="true">
      <path d="M2 40C26 40 22 8 48 8s22 32 48 32 26-32 62-32" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M2 40C26 40 22 8 48 8s22 32 48 32 26-32 62-32" stroke="currentColor" strokeWidth="1.4" strokeDasharray="4 8" opacity="0.55" transform="translate(0 6)" />
    </svg>
  );
}

export function SpeedLines({ className, width = 120, count = 4 }: { className?: string; width?: number; count?: number }) {
  return (
    <svg viewBox="0 0 120 40" width={width} height={width / 3} className={cn('select-none', className)} fill="none" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <line
          key={i}
          x1={4 + i * 6}
          y1={8 + i * 8}
          x2={116 - i * 18}
          y2={8 + i * 8}
          stroke="currentColor"
          strokeWidth={2.4 - i * 0.4}
          strokeLinecap="round"
          opacity={1 - i * 0.18}
        />
      ))}
    </svg>
  );
}

export function SparkDoodle({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className={cn('select-none', className)} fill="none" aria-hidden="true">
      <path d="M20 2v10M20 28v10M2 20h10M28 20h10M8 8l7 7M25 25l7 7M32 8l-7 7M15 25l-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Japan → Tanzania provenance stamp: two flags and an arrow. */
export function ProvenanceSticker({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'inline-flex select-none items-center gap-3 rounded-full border border-white/20 bg-black/40 px-4 py-2 backdrop-blur-md',
        className
      )}
    >
      {/* Japan flag — white field, crimson disc */}
      <svg viewBox="0 0 30 20" width="30" height="20" className="ring-1 ring-black/30" aria-label="Japan" role="img">
        <clipPath id="flag-jp-clip"><rect width="30" height="20" rx="2" /></clipPath>
        <g clipPath="url(#flag-jp-clip)">
          <rect width="30" height="20" fill="#FFFFFF" />
          <circle cx="15" cy="10" r="6" fill="#BC002D" />
        </g>
      </svg>
      <span className="text-[9px] font-black uppercase tracking-[0.24em] text-white/70">JP</span>
      <svg viewBox="0 0 40 12" width="34" height="10" fill="none" aria-hidden="true">
        <path d="M1 6h30" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="text-white/40" />
        <path d="M31 6l-6-4v8l6-4Z" fill="currentColor" className="text-white/40" />
        <circle cx="37" cy="6" r="2" fill="currentColor" className="text-secondary" />
      </svg>
      {/* Tanzania flag — gold-edged black diagonal from lower hoist to upper fly,
          green above / blue below (the old horizontal-stripe render was wrong) */}
      <svg viewBox="0 0 30 20" width="30" height="20" className="ring-1 ring-black/30" aria-label="Tanzania" role="img">
        <clipPath id="flag-tz-clip"><rect width="30" height="20" rx="2" /></clipPath>
        <g clipPath="url(#flag-tz-clip)">
          <rect width="30" height="20" fill="#1EB53A" />
          <polygon points="0,20 30,0 30,20" fill="#00A3DD" />
          <line x1="-6" y1="26" x2="36" y2="-6" stroke="#FCD116" strokeWidth="5.6" />
          <line x1="-6" y1="26" x2="36" y2="-6" stroke="#000000" strokeWidth="3.4" />
        </g>
      </svg>
      <span className="text-[9px] font-black uppercase tracking-[0.24em] text-white/70">TZ</span>
    </div>
  );
}

/** Rotating outline word-ring, used behind hero art. */
export function WordRing({
  words = 'SHOWROOM TZ · VERIFIED · DUTY CLEARED · ',
  className,
  size = 260,
  duration = 26,
}: {
  words?: string;
  className?: string;
  size?: number;
  duration?: number;
}) {
  const id = useId().replace(/[:]/g, '');
  const path = `ring-${id}`;

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={cn('select-none', className)}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <path id={path} d="M100,100 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0" />
      </defs>
      <g style={{ animation: `orbit-spin ${duration}s linear infinite`, transformOrigin: '100px 100px' }}>
        <text fill="currentColor" fontSize="11" fontWeight="900" letterSpacing="4.2" fontFamily="Inter, system-ui, sans-serif">
          <textPath href={`#${path}`}>{words}</textPath>
        </text>
      </g>
    </svg>
  );
}

'use client';

/**
 * CarParts — a small library of animated automotive SVGs.
 *
 * These are hand-built vector components rather than icon-font glyphs, so each
 * one can move like the real thing: an alloy wheel with spokes and a brake
 * caliper behind it, a crankshaft driving a piston, a meshing gear pair, a
 * vented disc, a turbo spooling up, a coil spring compressing.
 *
 * All motion is CSS/SMIL driven (no rAF loops), tinted with `currentColor`
 * plus the theme accent, and it all stops for `prefers-reduced-motion`.
 */

import { useId } from 'react';

type PartProps = {
  size?: number;
  className?: string;
  /** seconds per revolution / cycle */
  speed?: number;
};

/* ── helpers ─────────────────────────────────────────────────────────── */

function gearPath(cx: number, cy: number, rOuter: number, rInner: number, teeth: number) {
  const step = (Math.PI * 2) / teeth;
  const pts: [number, number][] = [];
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const ring: [number, number, number][] = [
      [a, rOuter, 0],
      [a + step * 0.3, rOuter, 0],
      [a + step * 0.36, rInner, 0],
      [a + step * 0.64, rInner, 0],
      [a + step * 0.7, rOuter, 0],
    ];
    for (const [ang, r] of ring) pts.push([cx + Math.cos(ang) * r, cy + Math.sin(ang) * r]);
  }
  return (
    'M' +
    pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L') +
    'Z'
  );
}

function Spokes({ count = 10, inner = 12, outer = 36 }: { count?: number; inner?: number; outer?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const a = (360 / count) * i;
        return (
          <path
            key={i}
            d={`M60 60 L${60 + inner} 55.5 L${60 + outer} 57.4 L${60 + outer} 62.6 L${60 + inner} 64.5 Z`}
            fill="currentColor"
            opacity={0.9}
            transform={`rotate(${a} 60 60)`}
          />
        );
      })}
    </>
  );
}

/* ── 1. Alloy wheel ──────────────────────────────────────────────────── */

export function AlloyWheel({ size = 96, className = '', speed = 14 }: PartProps) {
  const uid = useId().replace(/[:]/g, '');
  return (
    <svg data-part="wheel" viewBox="0 0 120 120" width={size} height={size} className={className} fill="none" aria-hidden="true">
      <defs>
        <radialGradient id={`${uid}-tire`} cx="42%" cy="35%" r="70%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.16" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.04" />
        </radialGradient>
      </defs>

      {/* brake disc + caliper stay still while the wheel spins */}
      <circle cx="60" cy="60" r="31" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1.5" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (Math.PI * 2 * i) / 12;
        return (
          <circle
            key={i}
            cx={(60 + Math.cos(a) * 24).toFixed(1)}
            cy={(60 + Math.sin(a) * 24).toFixed(1)}
            r="1.6"
            fill="currentColor"
            opacity="0.4"
          />
        );
      })}
      <path
        d="M60 22 A38 38 0 0 1 92 40 L86 47 A30 30 0 0 0 60 32 Z"
        fill="hsl(var(--primary))"
        opacity="0.85"
      />

      <g className="part-spin" style={{ ['--part-speed' as string]: `${speed}s` }}>
        {/* tyre */}
        <circle cx="60" cy="60" r="52" stroke={`url(#${uid}-tire)`} strokeWidth="13" />
        <circle cx="60" cy="60" r="52" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1" />
        <circle cx="60" cy="60" r="45" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1" />
        {Array.from({ length: 36 }).map((_, i) => {
          const a = (Math.PI * 2 * i) / 36;
          return (
            <line
              key={i}
              x1={(60 + Math.cos(a) * 47).toFixed(1)}
              y1={(60 + Math.sin(a) * 47).toFixed(1)}
              x2={(60 + Math.cos(a) * 57).toFixed(1)}
              y2={(60 + Math.sin(a) * 57).toFixed(1)}
              stroke="currentColor"
              strokeOpacity="0.22"
              strokeWidth="1.4"
            />
          );
        })}

        {/* rim */}
        <circle cx="60" cy="60" r="38" stroke="currentColor" strokeWidth="2.4" />
        <circle cx="60" cy="60" r="35" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
        <Spokes />
        <circle cx="60" cy="60" r="12" fill="none" stroke="currentColor" strokeWidth="2.4" />
        <circle cx="60" cy="60" r="7" fill="currentColor" opacity="0.14" />
        {Array.from({ length: 5 }).map((_, i) => {
          const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          return (
            <circle
              key={i}
              cx={(60 + Math.cos(a) * 8.6).toFixed(1)}
              cy={(60 + Math.sin(a) * 8.6).toFixed(1)}
              r="1.8"
              fill="currentColor"
            />
          );
        })}
      </g>
    </svg>
  );
}

/* ── 2. Meshing gears ────────────────────────────────────────────────── */

export function GearPair({ size = 96, className = '', speed = 9 }: PartProps) {
  return (
    <svg data-part="gears" viewBox="0 0 120 120" width={size} height={size} className={className} fill="none" aria-hidden="true">
      <g className="part-spin" style={{ ['--part-speed' as string]: `${speed}s`, transformOrigin: '46px 74px' }}>
        <path d={gearPath(46, 74, 34, 28, 14)} fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" />
        <circle cx="46" cy="74" r="13" stroke="currentColor" strokeWidth="2" />
        <circle cx="46" cy="74" r="4.5" fill="currentColor" opacity="0.6" />
        {Array.from({ length: 5 }).map((_, i) => {
          const a = (Math.PI * 2 * i) / 5;
          return (
            <circle
              key={i}
              cx={(46 + Math.cos(a) * 20).toFixed(1)}
              cy={(74 + Math.sin(a) * 20).toFixed(1)}
              r="4.6"
              stroke="currentColor"
              strokeOpacity="0.45"
            />
          );
        })}
      </g>

      <g
        className="part-spin-rev"
        style={{ ['--part-speed' as string]: `${speed * 0.62}s`, transformOrigin: '90px 38px' }}
      >
        <path d={gearPath(90, 38, 23, 18.5, 9)} fill="hsl(var(--primary))" fillOpacity="0.18" stroke="hsl(var(--primary))" strokeWidth="2" />
        <circle cx="90" cy="38" r="8" stroke="hsl(var(--primary))" strokeWidth="2" />
        <circle cx="90" cy="38" r="2.8" fill="hsl(var(--primary))" />
      </g>
    </svg>
  );
}

/* ── 3. Piston on a crank ────────────────────────────────────────────── */

export function Piston({ size = 96, className = '', speed = 2.2 }: PartProps) {
  return (
    <svg data-part="piston" viewBox="0 0 120 120" width={size} height={size} className={className} fill="none" aria-hidden="true">
      {/* bore */}
      <path d="M38 14 h44 v62 h-6 V20 H44 v56 h-6 Z" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.8" />
      <line x1="34" y1="14" x2="86" y2="14" stroke="currentColor" strokeWidth="3" />

      {/* spark */}
      <g className="part-pulse" style={{ ['--part-speed' as string]: `${speed * 2}s` }}>
        <path d="M60 4 l4 8 l-3 0 l4 8" stroke="hsl(var(--secondary))" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* piston */}
      <g className="part-piston" style={{ ['--part-speed' as string]: `${speed}s`, transformOrigin: '60px 40px' }}>
        <rect x="44" y="26" width="32" height="30" rx="3" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" />
        <line x1="44" y1="32" x2="76" y2="32" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1.4" />
        <line x1="44" y1="37" x2="76" y2="37" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1.4" />
        <line x1="44" y1="42" x2="76" y2="42" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1.4" />
        <circle cx="60" cy="50" r="3.4" stroke="currentColor" strokeWidth="1.6" />
      </g>

      {/* conrod */}
      <g className="part-conrod" style={{ ['--part-speed' as string]: `${speed}s` }}>
        <path d="M56.5 48 L63.5 48 L64.5 82 L55.5 82 Z" fill="currentColor" fillOpacity="0.24" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="60" cy="48" r="3.6" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="60" cy="82" r="4.6" stroke="currentColor" strokeWidth="1.6" />
      </g>

      {/* crank */}
      <g className="part-spin" style={{ ['--part-speed' as string]: `${speed * 2}s`, transformOrigin: '60px 92px' }}>
        <circle cx="60" cy="92" r="17" stroke="currentColor" strokeWidth="2" />
        <circle cx="60" cy="92" r="5" fill="currentColor" fillOpacity="0.5" />
        <circle cx="60" cy="78" r="4.6" fill="hsl(var(--primary))" />
        <line x1="60" y1="92" x2="60" y2="78" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.6" />
      </g>
    </svg>
  );
}

/* ── 4. Vented brake disc ────────────────────────────────────────────── */

export function BrakeDisc({ size = 96, className = '', speed = 12 }: PartProps) {
  const uid = useId().replace(/[:]/g, '');
  return (
    <svg data-part="disc" viewBox="0 0 120 120" width={size} height={size} className={className} fill="none" aria-hidden="true">
      <defs>
        <radialGradient id={`${uid}-heat`} cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="44" fill={`url(#${uid}-heat)`} className="part-pulse" style={{ ['--part-speed' as string]: '3s' }} />
      <g className="part-spin" style={{ ['--part-speed' as string]: `${speed}s` }}>
        <circle cx="60" cy="60" r="42" stroke="currentColor" strokeOpacity="0.35" strokeWidth="2" />
        <circle cx="60" cy="60" r="38" stroke="currentColor" strokeWidth="2.6" />
        <circle cx="60" cy="60" r="24" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1.6" />
        {Array.from({ length: 18 }).map((_, i) => {
          const a = (Math.PI * 2 * i) / 18;
          return (
            <circle
              key={i}
              cx={(60 + Math.cos(a) * 31).toFixed(1)}
              cy={(60 + Math.sin(a) * 31).toFixed(1)}
              r="2"
              fill="currentColor"
              fillOpacity="0.55"
            />
          );
        })}
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (Math.PI * 2 * i) / 6 + 0.2;
          const r = 34;
          return (
            <line
              key={i}
              x1={(60 + Math.cos(a) * (r - 5)).toFixed(1)}
              y1={(60 + Math.sin(a) * (r - 5)).toFixed(1)}
              x2={(60 + Math.cos(a + 0.32) * r).toFixed(1)}
              y2={(60 + Math.sin(a + 0.32) * r).toFixed(1)}
              stroke="currentColor"
              strokeOpacity="0.3"
              strokeWidth="2"
            />
          );
        })}
        <circle cx="60" cy="60" r="15" stroke="currentColor" strokeWidth="2" />
        {Array.from({ length: 5 }).map((_, i) => {
          const a = (Math.PI * 2 * i) / 5 - 0.4;
          return (
            <circle
              key={i}
              cx={(60 + Math.cos(a) * 9.5).toFixed(1)}
              cy={(60 + Math.sin(a) * 9.5).toFixed(1)}
              r="2"
              fill="currentColor"
            />
          );
        })}
      </g>
      {/* caliper */}
      <path
        d="M60 10 a50 50 0 0 1 34 14 l-8 9 a38 38 0 0 0 -26 -10 Z"
        fill="hsl(var(--primary))"
        fillOpacity="0.9"
      />
    </svg>
  );
}

/* ── 5. Turbocharger ─────────────────────────────────────────────────── */

export function Turbo({ size = 96, className = '', speed = 1.4 }: PartProps) {
  return (
    <svg data-part="turbo" viewBox="0 0 120 120" width={size} height={size} className={className} fill="none" aria-hidden="true">
      {/* volute housing */}
      <circle cx="54" cy="64" r="30" fill="currentColor" fillOpacity="0.09" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="54" cy="64" r="23" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.4" />
      {/* outlet pipe (tangential) */}
      <path
        d="M70 44 C 86 40, 96 46, 98 60"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
        opacity="0.35"
      />
      <path d="M70 44 C 86 40, 96 46, 98 60" stroke="currentColor" strokeWidth="1.8" fill="none" opacity="0.5" />
      {/* inlet flange */}
      <rect x="16" y="55" width="10" height="18" rx="3" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.12" />
      <line x1="26" y1="64" x2="34" y2="64" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.6" />

      {/* turbine */}
      <g className="part-spin" style={{ ['--part-speed' as string]: `${speed}s`, transformOrigin: '54px 64px' }}>
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (360 / 8) * i;
          return (
            <g key={i} transform={`rotate(${a} 54 64)`}>
              <path
                d="M54 64 C 57 55, 63 49, 70 47"
                stroke="hsl(var(--primary))"
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M54 64 C 58 56, 64 51, 70 50"
                stroke="hsl(var(--secondary))"
                strokeOpacity="0.45"
                strokeWidth="1.2"
                fill="none"
              />
            </g>
          );
        })}
        <circle cx="54" cy="64" r="7" fill="currentColor" fillOpacity="0.85" />
        <circle cx="54" cy="64" r="2.6" fill="hsl(var(--secondary))" />
      </g>

      {/* boost */}
      <g stroke="hsl(var(--secondary))" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 6" opacity="0.8">
        <path d="M92 76 C 100 68, 104 56, 100 44">
          <animate attributeName="stroke-dashoffset" from="0" to="-40" dur="1.6s" repeatCount="indefinite" />
        </path>
        <path d="M86 84 C 96 78, 102 68, 102 56">
          <animate attributeName="stroke-dashoffset" from="0" to="-40" dur="1.6s" begin="0.3s" repeatCount="indefinite" />
        </path>
      </g>
    </svg>
  );
}

/* ── 6. Headlight beam ───────────────────────────────────────────────── */

export function Headlight({ size = 96, className = '' }: PartProps) {
  const uid = useId().replace(/[:]/g, '');
  return (
    <svg data-part="headlight" viewBox="0 0 120 120" width={size} height={size} className={className} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-beam`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity="0.28" />
          <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* housing */}
      <path
        d="M18 44 C 34 34, 52 32, 62 36 L64 84 C 50 90, 32 88, 18 78 Z"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="38" cy="60" r="17" stroke="currentColor" strokeWidth="2" />
      <circle cx="38" cy="60" r="11" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.4" />
      <circle cx="38" cy="60" r="5" fill="hsl(var(--secondary))" className="part-pulse" style={{ ['--part-speed' as string]: '2.8s' }} />
      {/* LED strip */}
      {[40, 44, 48].map((y, i) => (
        <line key={y} x1="52" y1={y + 8} x2="60" y2={y + 8} stroke="hsl(var(--secondary))" strokeWidth="2" strokeLinecap="round" opacity={0.9 - i * 0.2} />
      ))}
      {/* beam */}
      <path d="M56 46 L118 30 L118 90 L56 74 Z" fill={`url(#${uid}-beam)`} className="part-beam" opacity="0.55" />
    </svg>
  );
}

/* ── 7. Coil-over suspension ─────────────────────────────────────────── */

export function Suspension({ size = 96, className = '', speed = 2.8 }: PartProps) {
  return (
    <svg data-part="suspension" viewBox="0 0 120 120" width={size} height={size} className={className} fill="none" aria-hidden="true">
      {/* top mount */}
      <rect x="38" y="8" width="44" height="9" rx="3" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="46" cy="12.5" r="2" fill="currentColor" />
      <circle cx="74" cy="12.5" r="2" fill="currentColor" />
      <line x1="60" y1="17" x2="60" y2="34" stroke="currentColor" strokeWidth="2.4" />

      {/* coil */}
      <g className="part-spring" style={{ ['--part-speed' as string]: `${speed}s`, transformOrigin: '60px 18px' }}>
        {[36, 43, 50, 57, 64, 71].map((cy) => (
          <ellipse key={cy} cx="60" cy={cy} rx="15" ry="4.6" stroke="currentColor" strokeWidth="2.4" />
        ))}
        <line x1="60" y1="18" x2="60" y2="34" stroke="currentColor" strokeWidth="2.2" />
        <line x1="60" y1="72" x2="60" y2="80" stroke="currentColor" strokeWidth="2.2" />
      </g>

      {/* damper body */}
      <rect x="54" y="68" width="12" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.12" />
      {/* bottom mount + arm */}
      <rect x="41" y="84" width="38" height="7" rx="3" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1.8" />
      <path d="M45 91 L38 99 M75 91 L82 99" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />

      {/* wheel */}
      <g className="part-spin" style={{ ['--part-speed' as string]: '3s', transformOrigin: '60px 104px' }}>
        <circle cx="60" cy="104" r="10" stroke="currentColor" strokeWidth="2.4" />
        <circle cx="60" cy="104" r="3.6" fill="currentColor" />
        <line x1="60" y1="94" x2="60" y2="114" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.4" />
        <line x1="50" y1="104" x2="70" y2="104" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.4" />
      </g>
    </svg>
  );
}

/* ── 8. Key fob ──────────────────────────────────────────────────────── */

export function KeyFob({ size = 96, className = '' }: PartProps) {
  return (
    <svg data-part="keyfob" viewBox="0 0 120 120" width={size} height={size} className={className} fill="none" aria-hidden="true">
      {/* transmitter waves */}
      <g stroke="hsl(var(--secondary))" strokeWidth="2" strokeLinecap="round" fill="none">
        <path d="M84 26 a10 10 0 0 1 0 14" opacity="0.85">
          <animate attributeName="opacity" values="0.9;0.15;0.9" dur="2.2s" repeatCount="indefinite" />
        </path>
        <path d="M90 20 a18 18 0 0 1 0 26" opacity="0.5">
          <animate attributeName="opacity" values="0.2;0.9;0.2" dur="2.2s" repeatCount="indefinite" />
        </path>
      </g>

      {/* fob body */}
      <rect x="22" y="24" width="52" height="72" rx="14" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2.2" />
      <rect x="32" y="36" width="32" height="12" rx="5" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1.5" />
      <rect x="32" y="54" width="32" height="12" rx="5" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1.5" />
      <path d="M32 74 h32" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.4" />
      <circle cx="48" cy="84" r="3.4" fill="hsl(var(--secondary))" className="part-pulse" style={{ ['--part-speed' as string]: '2.6s' }} />

      {/* key blade */}
      <g stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.14">
        <path d="M74 52 h24 v4 l-5 3 l5 3 v4 l-5 3 l5 3 v4 H74 Z" />
      </g>
      <line x1="78" y1="52" x2="78" y2="76" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.4" />
    </svg>
  );
}

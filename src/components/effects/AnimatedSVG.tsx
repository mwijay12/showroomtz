'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * AnimatedSVG — hand-drawn SVG set animated with Anime.js v4.
 *
 * Anime's `svg.createDrawable()` converts stroke geometry into a single
 * normalised `draw` property ('0 0' → '0 1'), so paths, circles and
 * polylines all self-draw with the same timing — no stroke-dash hacks.
 *
 * Every component is decorative-but-labelled, respects reduced motion, and
 * falls back to a fully drawn (static) state if the animation library can't
 * load.
 */

type DrawOpts = {
  duration?: number;
  delay?: number;
  loop?: boolean;
  ease?: string;
};

/** Shared driver: draws every stroke inside `ref` when it scrolls into view. */
function useDraw(
  ref: React.RefObject<SVGSVGElement | null>,
  { duration = 1600, delay = 0, loop = false, ease = 'inOutQuad' }: DrawOpts = {}
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === 'undefined') return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let anim: { pause: () => void } | undefined;
    let cancelled = false;

    const io = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting || cancelled) return;
        io.disconnect();
        try {
          const { animate, svg } = await import('animejs');
          const drawables = svg.createDrawable(el.querySelectorAll('path, circle, line, polyline, ellipse'));
          if (!drawables.length) return;

          anim = animate(drawables as any, {
            draw: ['0 0', '0 1'],
            duration,
            delay,
            loop,
            ease,
          } as any) as any;
        } catch {
          /* progressive enhancement */
        }
      },
      { threshold: 0.25 }
    );

    io.observe(el);

    return () => {
      cancelled = true;
      io.disconnect();
      anim?.pause();
    };
  }, [ref, duration, delay, loop, ease]);
}

/* ─────────────────────────────────────────────────────────────────────
   1 · DrawMark — the brand "S monogram in a diamond" drawn as one line
   ───────────────────────────────────────────────────────────────────── */
export function DrawMark({ className, size = 96 }: { className?: string; size?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  useDraw(ref, { duration: 2000 });

  return (
    <svg
      ref={ref}
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={cn('text-primary', className)}
      fill="none"
      role="img"
      aria-label="ShowroomTZ monogram"
    >
      <path
        d="M60 8 L108 60 L60 112 L12 60 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.45"
      />
      <path
        d="M74 42c-3.6-6.4-11-9.4-17.6-7.4-7 2.1-10.4 9.9-6.8 16.2 3 5.2 9.6 6.4 15 7.4 5.4 1 10.8 3.2 11.4 9.2.6 6.6-5.6 11.6-12.4 11.6-6.2 0-11.6-3.4-14-8.6"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path d="M40 96h40" stroke="hsl(var(--secondary))" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   2 · SpeedGauge — campaign stat dial with arc, ticks and live needle
   ───────────────────────────────────────────────────────────────────── */
export function SpeedGauge({
  value = 72,
  label = 'Fleet readiness',
  className,
  size = 220,
}: {
  value?: number;
  label?: string;
  className?: string;
  size?: number;
}) {
  const arcRef = useRef<SVGSVGElement>(null);
  useDraw(arcRef, { duration: 2200 });

  const clamped = Math.max(0, Math.min(100, value));
  // -120° → +120° sweep
  const angle = -120 + (clamped / 100) * 240;

  const R = 78;
  const cx = 100;
  const cy = 100;
  const polar = (deg: number, r = R) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };
  const start = polar(-120);
  const end = polar(120);
  const arcPath = `M ${start.x} ${start.y} A ${R} ${R} 0 1 1 ${end.x} ${end.y}`;

  return (
    <div className={cn('relative inline-flex flex-col items-center', className)}>
      <svg
        ref={arcRef}
        viewBox="0 0 200 200"
        width={size}
        height={size}
        fill="none"
        role="img"
        aria-label={`${label}: ${clamped}%`}
      >
        <defs>
          <linearGradient id="gauge-stroke" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(var(--primary) / 0.35)" />
            <stop offset="55%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" />
          </linearGradient>
        </defs>

        {/* track */}
        <path d={arcPath} stroke="hsl(var(--border))" strokeWidth="7" strokeLinecap="round" />
        {/* live arc */}
        <path
          d={arcPath}
          stroke="url(#gauge-stroke)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${(clamped / 100) * 2 * Math.PI * R * 0.667} 999`}
          className="svg-draw"
          style={{ ['--dash-length' as any]: `${(clamped / 100) * 2 * Math.PI * R * 0.667}` }}
        />

        {/* ticks */}
        {Array.from({ length: 13 }).map((_, i) => {
          const deg = -120 + (i * 240) / 12;
          const a = polar(deg, R - 16);
          const b = polar(deg, R - 22);
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="hsl(var(--muted-foreground) / 0.45)"
              strokeWidth="1.4"
            />
          );
        })}

        {/* needle */}
        <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: '100px 100px', transition: 'transform 1.2s cubic-bezier(.22,1,.36,1)' }}>
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="40"
            stroke="hsl(var(--secondary))"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
        <circle cx="100" cy="100" r="5" fill="hsl(var(--secondary))" />
        <circle cx="100" cy="100" r="11" stroke="hsl(var(--secondary) / 0.35)" strokeWidth="1" />
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-10">
        <span className="text-3xl font-black tracking-tighter text-foreground">{clamped}%</span>
        <span className="mt-1 max-w-[120px] text-center text-[8px] font-black uppercase tracking-[0.24em] text-muted-foreground">
          {label}
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   3 · OrbitalRings — ambient decorative system (no lib, pure CSS)
   ───────────────────────────────────────────────────────────────────── */
export function OrbitalRings({ className, size = 320 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 240 240"
      width={size}
      height={size}
      className={cn('pointer-events-none select-none', className)}
      fill="none"
      aria-hidden="true"
    >
      <circle cx="120" cy="120" r="112" stroke="hsl(var(--primary) / 0.18)" strokeDasharray="2 8" className="orbit-a" style={{ transformOrigin: '120px 120px' }} />
      <circle cx="120" cy="120" r="88" stroke="hsl(var(--primary) / 0.3)" strokeDasharray="46 30" className="orbit-b" style={{ transformOrigin: '120px 120px' }} />
      <circle cx="120" cy="120" r="62" stroke="hsl(var(--secondary) / 0.28)" strokeDasharray="4 10" className="orbit-c" style={{ transformOrigin: '120px 120px' }} />
      <g className="orbit-b" style={{ transformOrigin: '120px 120px' }}>
        <circle cx="120" cy="32" r="3.5" fill="hsl(var(--secondary))" />
        <circle cx="120" cy="32" r="9" fill="hsl(var(--secondary) / 0.16)" />
      </g>
      <g className="orbit-a" style={{ transformOrigin: '120px 120px' }}>
        <circle cx="208" cy="120" r="2.5" fill="hsl(var(--primary))" />
      </g>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   4 · Sparkline — drawn trend line with gradient area
   ───────────────────────────────────────────────────────────────────── */
export function Sparkline({
  points = [12, 26, 18, 34, 28, 46, 40, 58, 52, 74],
  className,
  width = 260,
  height = 90,
}: {
  points?: number[];
  className?: string;
  width?: number;
  height?: number;
}) {
  const ref = useRef<SVGSVGElement>(null);
  useDraw(ref, { duration: 1900 });

  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const stepX = width / Math.max(1, points.length - 1);

  const coords = points.map((p, i) => ({
    x: i * stepX,
    y: height - ((p - min) / span) * (height - 12) - 6,
  }));

  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ');
  const area = `${line} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn('overflow-visible', className)}
      fill="none"
      role="img"
      aria-label="Trend"
    >
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.28" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spark-fill)" stroke="none" />
      <path d={line} stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {coords.map((c, i) =>
        i === coords.length - 1 ? (
          <circle key={i} cx={c.x} cy={c.y} r="4" fill="hsl(var(--secondary))" stroke="hsl(var(--background))" strokeWidth="2" />
        ) : null
      )}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   5 · RouteTrace — delivery route with a vehicle travelling the path
   ───────────────────────────────────────────────────────────────────── */
export function RouteTrace({ className, width = 420, height = 180 }: { className?: string; width?: number; height?: number }) {
  const pathRef = useRef<SVGPathElement>(null);
  const markerRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let anim: { pause: () => void } | undefined;
    let cancelled = false;

    (async () => {
      try {
        const { animate, svg } = await import('animejs');
        if (cancelled || !pathRef.current || !markerRef.current) return;
        anim = animate(markerRef.current, {
          ...svg.createMotionPath(pathRef.current),
          duration: 5200,
          loop: true,
          ease: 'inOutSine',
        } as any) as any;
      } catch {
        /* noop */
      }
    })();

    return () => {
      cancelled = true;
      anim?.pause();
    };
  }, []);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn('overflow-visible', className)}
      fill="none"
      role="img"
      aria-label="Delivery route across Tanzania"
    >
      <defs>
        <linearGradient id="route-stroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(var(--primary) / 0.2)" />
          <stop offset="50%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--secondary))" />
        </linearGradient>
      </defs>

      <path
        ref={pathRef}
        id="tz-route"
        d="M18 150 C 70 60, 120 170, 176 110 S 270 30, 320 88 S 380 140, 404 52"
        stroke="url(#route-stroke)"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="svg-draw"
        style={{ ['--dash-length' as any]: 620 }}
      />

      {/* waypoints */}
      {[
        { x: 18, y: 150, l: 'DSM' },
        { x: 176, y: 110, l: 'DOD' },
        { x: 320, y: 88, l: 'ARU' },
        { x: 404, y: 52, l: 'MWZ' },
      ].map((p) => (
        <g key={p.l}>
          <circle cx={p.x} cy={p.y} r="4" fill="hsl(var(--background))" stroke="hsl(var(--secondary))" strokeWidth="2" />
          <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="8" fontWeight="800" fill="hsl(var(--muted-foreground))" letterSpacing="1">
            {p.l}
          </text>
        </g>
      ))}

      <circle ref={markerRef} cx="0" cy="0" r="5" fill="hsl(var(--secondary))" />
    </svg>
  );
}

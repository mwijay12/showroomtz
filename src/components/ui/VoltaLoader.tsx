'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShowroomMark } from '@/components/ui/ShowroomMark';
import { cn } from '@/lib/utils';

/**
 * VoltaLoader — branded loading experience for ShowroomTZ.
 *
 * Composition:
 *   · the brand mark, floating with a slow breathing glow
 *   · a hand-drawn SVG orbital system (two dashed rings + travelling comet)
 *   · a determinate progress rail when a `progress` value is supplied,
 *     otherwise an indeterminate shimmer rail
 *   · rotating status captions so long waits feel intentional
 *
 * Pure SVG/CSS motion — no layout thrash, and it degrades to a static
 * composition for prefers-reduced-motion users.
 */

const CAPTIONS = [
  'Synchronizing Registry…',
  'Verifying Showroom Nodes…',
  'Calibrating Fleet Telemetry…',
  'Almost there…',
];

export function VoltaLoader({
  fullPage = false,
  size = 'md',
  caption,
  progress,
  className,
}: {
  fullPage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  caption?: string;
  progress?: number;
  className?: string;
}) {
  const [idx, setIdx] = useState(0);
  const [pct, setPct] = useState(progress ?? 0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % CAPTIONS.length), 2200);
    return () => clearInterval(t);
  }, []);

  // Indeterminate mode: creep towards 90% and wait for the route to mount.
  useEffect(() => {
    if (progress !== undefined) {
      setPct(progress);
      return;
    }
    const t = setInterval(() => {
      setPct((p) => (p >= 90 ? 90 : p + Math.max(1, (90 - p) * 0.08)));
    }, 180);
    return () => clearInterval(t);
  }, [progress]);

  const mark = size === 'lg' ? 'h-16 w-16' : size === 'sm' ? 'h-8 w-8' : 'h-12 w-12';
  const box = size === 'lg' ? 'h-36 w-36' : size === 'sm' ? 'h-20 w-20' : 'h-28 w-28';

  const content = (
    <div className={cn('flex flex-col items-center gap-7', className)}>
      <div className={cn('relative flex items-center justify-center', box)}>
        {/* breathing halo */}
        <div
          className="animate-glow absolute inset-2 rounded-full bg-primary/25"
          aria-hidden="true"
        />

        {/* orbital SVG */}
        <svg
          viewBox="0 0 120 120"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="volta-comet" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity="0" />
              <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="1" />
            </linearGradient>
          </defs>

          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="1"
            strokeDasharray="2 6"
            className="orbit-a"
            style={{ transformOrigin: '60px 60px' }}
          />
          <circle
            cx="60"
            cy="60"
            r="44"
            fill="none"
            stroke="hsl(var(--primary) / 0.55)"
            strokeWidth="1.5"
            strokeDasharray="70 40"
            className="orbit-b"
            style={{ transformOrigin: '60px 60px' }}
          />
          <circle
            cx="60"
            cy="60"
            r="34"
            fill="none"
            stroke="hsl(var(--primary) / 0.22)"
            strokeWidth="1"
            className="orbit-c"
            style={{ transformOrigin: '60px 60px' }}
          />

          {/* travelling comet */}
          <g className="orbit-c" style={{ transformOrigin: '60px 60px' }}>
            <circle cx="60" cy="26" r="3" fill="hsl(var(--secondary))" />
            <circle cx="60" cy="26" r="7" fill="hsl(var(--secondary) / 0.18)" />
          </g>
        </svg>

        {/* brand mark */}
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative"
        >
          <ShowroomMark className={cn(mark, 'rounded-2xl shadow-2xl')} />
        </motion.div>
      </div>

      <div className="w-full max-w-[220px] space-y-3 text-center">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-foreground">
          Showroom<span className="text-primary italic">TZ</span>
        </p>

        {/* progress rail */}
        <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-border/70">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background:
                'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))',
            }}
            animate={{ width: `${Math.min(100, Math.round(pct))}%` }}
            transition={{ ease: 'easeOut', duration: 0.4 }}
          />
          <div
            className="absolute inset-y-0 w-1/3 rounded-full opacity-70"
            style={{
              background:
                'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.8), transparent)',
              animation: 'skeleton-sweep 1.8s ease-in-out infinite',
            }}
            aria-hidden="true"
          />
        </div>

        <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-[0.28em] text-muted-foreground">
          <span className="truncate pr-2">{caption ?? CAPTIONS[idx]}</span>
          <span className="tabular-nums text-primary">{Math.round(pct)}%</span>
        </div>
      </div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/85 backdrop-blur-md">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(60% 45% at 50% 45%, hsl(var(--primary) / 0.12), transparent 70%)',
          }}
          aria-hidden="true"
        />
        {content}
      </div>
    );
  }

  return content;
}

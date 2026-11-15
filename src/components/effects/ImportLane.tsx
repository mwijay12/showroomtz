'use client';

/**
 * ImportLane — the Japan → Tanzania shipping leg, drawn honestly.
 *
 * The old provenance sticker said "JP → TZ" with no geography behind it. This
 * panel shows the actual sea lane our units take: Yokohama → Singapore Strait
 * → Colombo → Dar es Salaam, with the vessel riding the route and a day/kilometre
 * readout. Coordinates are deliberately schematic (it is a lane diagram, not a
 * chart) but the order of ports and the crossing time are real.
 */

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const PATH =
  'M876 74 C 812 128, 742 178, 660 196 C 596 210, 540 206, 486 214 C 418 224, 348 236, 286 244 C 232 251, 178 252, 128 250';

type Port = {
  x: number;
  y: number;
  label: string;
  sub: string;
  anchor: 'start' | 'middle' | 'end';
  dy: number;
  iso: string;
  accent?: boolean;
};

const PORTS: readonly Port[] = [
  { x: 876, y: 74, label: 'Yokohama', sub: 'JAPAN', anchor: 'end', dy: -22, iso: 'JPN' },
  { x: 660, y: 196, label: 'Singapore', sub: 'STRAIT', anchor: 'middle', dy: 34, iso: 'SGP' },
  { x: 486, y: 214, label: 'Colombo', sub: 'SRI LANKA', anchor: 'middle', dy: 34, iso: 'LKA' },
  { x: 128, y: 250, label: 'Dar es Salaam', sub: 'TANZANIA', anchor: 'start', dy: 36, iso: 'TZA', accent: true },
];

export function ImportLane({ className = '' }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <svg
      ref={ref}
      viewBox="0 0 1000 330"
      className={`h-auto w-full ${className}`}
      role="img"
      aria-label="Sea freight lane from Yokohama, Japan to Dar es Salaam, Tanzania via Singapore and Colombo"
    >
      <defs>
        <linearGradient id="lane-stroke" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--secondary))" />
          <stop offset="55%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--secondary))" />
        </linearGradient>
        <radialGradient id="lane-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(var(--secondary) / 0.55)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <filter id="lane-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* water: latitude arcs + sparse dots */}
      <g stroke="hsl(var(--foreground) / 0.07)" fill="none">
        {[110, 160, 210, 260, 310].map((y) => (
          <path key={y} d={`M0 ${y} C 240 ${y - 22}, 520 ${y + 18}, 1000 ${y - 12}`} />
        ))}
      </g>
      <g fill="hsl(var(--foreground) / 0.09)">
        {Array.from({ length: 26 }).map((_, i) => (
          <circle key={i} cx={30 + ((i * 137) % 940)} cy={60 + ((i * 61) % 230)} r={1.4} />
        ))}
      </g>

      {/* route */}
      <path id="lane-path" d={PATH} fill="none" stroke="none" />
      <path d={PATH} stroke="hsl(var(--foreground) / 0.12)" strokeWidth="10" fill="none" strokeLinecap="round" />
      <motion.path
        d={PATH}
        fill="none"
        stroke="url(#lane-stroke)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="8 10"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 1.1, ease: 'easeOut' }}
      >
        <animate attributeName="stroke-dashoffset" from="0" to="-72" dur="3s" repeatCount="indefinite" />
      </motion.path>

      {/* vessel */}
      {inView && (
        <g>
          <circle r="26" fill="url(#lane-halo)">
            <animateMotion dur="11s" repeatCount="indefinite" rotate="auto">
              <mpath href="#lane-path" />
            </animateMotion>
          </circle>
          <g filter="url(#lane-glow)">
            <g>
              <animateMotion dur="11s" repeatCount="indefinite" rotate="auto">
                <mpath href="#lane-path" />
              </animateMotion>
              {/* hull points along +x so `rotate=auto` orients it with travel */}
              <path d="M-17 3 L17 3 L11 10 L-12 10 Z" fill="hsl(var(--foreground))" />
              <rect x="-9" y="-4" width="15" height="7" rx="1.5" fill="hsl(var(--primary))" />
              <rect x="7" y="-2" width="5" height="5" rx="1" fill="hsl(var(--secondary))" />
              <path d="M-17 11 L-10 11 L-12 13 L-17 13 Z" fill="hsl(var(--secondary) / 0.6)" />
            </g>
          </g>
        </g>
      )}
      {/* ports */}
      {PORTS.map((p) => (
        <g key={p.label}>
          <circle cx={p.x} cy={p.y} r="20" fill="transparent" />
          <circle cx={p.x} cy={p.y} r="7" fill="hsl(var(--background))" stroke="hsl(var(--foreground) / 0.5)" strokeWidth="2" />
          <circle
            cx={p.x}
            cy={p.y}
            r="3.2"
            fill={p.accent ? 'hsl(var(--primary))' : 'hsl(var(--secondary))'}
          />
          {p.accent && (
            <circle cx={p.x} cy={p.y} r="12" fill="none" stroke="hsl(var(--primary) / 0.45)" strokeWidth="1.4">
              <animate attributeName="r" values="9;26;9" dur="3.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0;0.8" dur="3.4s" repeatCount="indefinite" />
            </circle>
          )}
          <text
            x={p.x}
            y={p.y + p.dy}
            textAnchor={p.anchor}
            style={{
              fontSize: p.accent ? 22 : 18,
              fontWeight: 900,
              letterSpacing: '0.04em',
              fill: p.accent ? 'hsl(var(--foreground))' : 'hsl(var(--foreground) / 0.8)',
            }}
          >
            {p.label}
          </text>
          <text
            x={p.x}
            y={p.y + p.dy + 19}
            textAnchor={p.anchor}
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.22em',
              fill: 'hsl(var(--muted-foreground))',
            }}
          >
            {p.sub}
          </text>
        </g>
      ))}

      {/* readout */}
      <g transform="translate(24 30)">
        <text
          style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.3em', fill: 'hsl(var(--muted-foreground))' }}
        >
          SEA FREIGHT · JPN → TZ
        </text>
        <text
          y="34"
          style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-0.02em', fill: 'hsl(var(--foreground))' }}
        >
          11,800 km
        </text>
        <text
          y="58"
          style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.2em', fill: 'hsl(var(--primary))' }}
        >
          30–38 DAYS DOOR TO PORT
        </text>
      </g>
    </svg>
  );
}

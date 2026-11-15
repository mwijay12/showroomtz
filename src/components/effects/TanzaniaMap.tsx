'use client';

/**
 * TanzaniaMap — the delivery network, drawn from real geography.
 *
 * The previous "map" was a decorative squiggle; this one is generated from
 * Natural Earth 1:50m country polygons (see `tanzania-geo.ts`), so the coast,
 * Lake Victoria, Tanganyika, Rukwa and Nyasa all sit where they actually are,
 * and every city dot is projected from its true lon/lat.
 *
 * Motion: routes draw in on view, then a courier dot rides each one with SMIL
 * `animateMotion` (no JS per frame). Hovering a city dims the other routes and
 * lights up its own — the map doubles as a filter.
 */

import { useMemo, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

import { TZ_CITIES, TZ_LAND, TZ_LAKES, TZ_VIEWBOX } from './tanzania-geo';

type CityKey = keyof typeof TZ_CITIES;

const ROUTE_KEYS: CityKey[] = ['dodoma', 'arusha', 'mwanza', 'mbeya', 'tanga', 'zanzibar'];

/** Hand-tuned label placement so no two city names collide on the coast. */
const LABELS: Record<string, { dx: number; dy: number; anchor: 'start' | 'middle' | 'end'; size: number }> = {
  dar: { dx: -34, dy: 11, anchor: 'end', size: 25 },
  zanzibar: { dx: -30, dy: -26, anchor: 'end', size: 16 },
  tanga: { dx: -26, dy: -8, anchor: 'end', size: 19 },
  arusha: { dx: 18, dy: 6, anchor: 'start', size: 20 },
  dodoma: { dx: 18, dy: 6, anchor: 'start', size: 20 },
  mwanza: { dx: 18, dy: 6, anchor: 'start', size: 20 },
  mbeya: { dx: 18, dy: 6, anchor: 'start', size: 20 },
};

/** Quadratic arc between two points, bowed away from the map centre. */
function arcTo(ax: number, ay: number, bx: number, by: number, bend = 0.26) {
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  const dx = bx - ax;
  const dy = by - ay;
  const cx = mx - dy * bend;
  const cy = my + dx * bend;
  return `M${ax} ${ay} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${bx} ${by}`;
}

export function TanzaniaMap({ className = '' }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [active, setActive] = useState<CityKey | null>(null);

  const routes = useMemo(() => {
    const dar = TZ_CITIES.dar;
    return ROUTE_KEYS.map((key) => ({
      key,
      d: arcTo(dar.x, dar.y, TZ_CITIES[key].x, TZ_CITIES[key].y),
    }));
  }, []);

  return (
    <svg
      ref={ref}
      viewBox={TZ_VIEWBOX}
      className={`h-auto w-full overflow-visible ${className}`}
      role="img"
      aria-label="Map of Tanzania showing the ShowroomTZ delivery network from Dar es Salaam"
    >
      <defs>
        <linearGradient id="tz-land" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(var(--foreground) / 0.18)" />
          <stop offset="55%" stopColor="hsl(var(--foreground) / 0.09)" />
          <stop offset="100%" stopColor="hsl(var(--secondary) / 0.16)" />
        </linearGradient>
        <radialGradient id="tz-ocean" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor="hsl(var(--primary) / 0.10)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <linearGradient id="tz-route" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(var(--secondary))" />
          <stop offset="100%" stopColor="hsl(var(--primary))" />
        </linearGradient>
        <clipPath id="tz-clip">
          <path d={TZ_LAND} />
        </clipPath>
        <filter id="tz-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ocean + faint graticule */}
      <rect width="1000" height="971" fill="url(#tz-ocean)" />
      <g stroke="hsl(var(--foreground) / 0.05)" strokeWidth="1">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <line key={`h${i}`} x1="0" x2="1000" y1={i * 120 + 40} y2={i * 120 + 40} />
        ))}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <line key={`v${i}`} y1="0" y2="971" x1={i * 120 + 40} x2={i * 120 + 40} />
        ))}
      </g>

      {/* land */}
      <motion.path
        d={TZ_LAND}
        fill="url(#tz-land)"
        stroke="hsl(var(--foreground) / 0.30)"
        strokeWidth="2"
        strokeLinejoin="round"
        initial={{ scale: 0.985 }}
        animate={inView ? { scale: 1 } : {}}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformBox: 'view-box', transformOrigin: '500px 480px' }}
      />

      {/* lakes — clipped to the country so they never spill into neighbours */}
      <g clipPath="url(#tz-clip)">
        {TZ_LAKES.map((d, i) => (
          <path key={i} d={d} fill="hsl(var(--background))" fillOpacity="0.9" />
        ))}
        {TZ_LAKES.map((d, i) => (
          <path key={`s${i}`} d={d} fill="none" stroke="hsl(var(--foreground) / 0.16)" strokeWidth="1.5" />
        ))}
      </g>

      {/* country watermark */}
      <text
        x="400"
        y="640"
        textAnchor="middle"
        style={{
          fontSize: 62,
          fontWeight: 900,
          letterSpacing: '0.34em',
          fill: 'hsl(var(--foreground))',
          opacity: 0.055,
          pointerEvents: 'none',
        }}
      >
        TANZANIA
      </text>

      {/* routes */}
      <g fill="none">
        {routes.map((r, i) => {
          const dim = active !== null && active !== r.key;
          return (
            <g key={r.key} style={{ opacity: dim ? 0.16 : 1, transition: 'opacity 300ms' }}>
              <path
                id={`tz-route-${r.key}`}
                d={r.d}
                stroke="url(#tz-route)"
                strokeWidth={active === r.key ? 3.4 : 2.2}
                strokeLinecap="round"
                strokeDasharray="7 9"
                pathLength={1}
                style={{ transition: 'stroke-width 300ms' }}
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="0"
                  to="-64"
                  dur={`${2.4 + i * 0.25}s`}
                  repeatCount="indefinite"
                />
              </path>
              {inView && (
                <circle r={active === r.key ? 6 : 4} fill="hsl(var(--secondary))" filter="url(#tz-glow)">
                  <animateMotion dur={`${5 + i * 0.6}s`} repeatCount="indefinite" begin={`${i * 0.7}s`} rotate="auto">
                    <mpath href={`#tz-route-${r.key}`} />
                  </animateMotion>
                </circle>
              )}
            </g>
          );
        })}
      </g>

      {/* cities */}
      {Object.entries(TZ_CITIES).map(([key, city]) => {
        const isDar = key === 'dar';
        const isActive = active === key;
        const place = LABELS[key] ?? { dx: 18, dy: 6, anchor: 'start' as const, size: 20 };
        return (
          <g
            key={key}
            className="tz-city"
            onMouseEnter={() => setActive(key as CityKey)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(key as CityKey)}
            onBlur={() => setActive(null)}
            tabIndex={0}
            role="button"
            aria-label={`${city.label} delivery node`}
            style={{ cursor: 'pointer' }}
          >
            {/* generous hit area */}
            <circle cx={city.x} cy={city.y} r={26} fill="transparent" />

            {isDar && (
              <circle cx={city.x} cy={city.y} r={16} fill="none" stroke="hsl(var(--primary) / 0.5)" strokeWidth="1.5">
                <animate attributeName="r" values="12;30;12" dur="3.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0;0.7" dur="3.6s" repeatCount="indefinite" />
              </circle>
            )}

            <circle
              cx={city.x}
              cy={city.y}
              r={isDar ? 9 : 6}
              fill={isDar ? 'hsl(var(--primary))' : 'hsl(var(--foreground))'}
              stroke="hsl(var(--background))"
              strokeWidth="2.5"
              style={{
                transition: 'r 200ms, fill 200ms',
                filter: isActive || isDar ? 'url(#tz-glow)' : undefined,
              }}
            />

            <text
              x={city.x + place.dx}
              y={city.y + place.dy}
              textAnchor={place.anchor}
              className="tz-city-label"
              style={{
                fontSize: place.size,
                fontWeight: isDar ? 900 : 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fill: isActive || isDar ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                transition: 'fill 200ms',
                pointerEvents: 'none',
              }}
            >
              {city.label}
            </text>

            {isDar && (
              <text
                x={city.x - 34}
                y={city.y + 29}
                textAnchor="end"
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: '0.24em',
                  fill: 'hsl(var(--primary))',
                  textTransform: 'uppercase',
                  pointerEvents: 'none',
                }}
              >
                HQ · PORT
              </text>
            )}
          </g>
        );
      })}

      {/* compass + scale furniture */}
      <g transform="translate(72 872)" opacity="0.5">
        <circle r="30" fill="none" stroke="hsl(var(--foreground) / 0.25)" strokeWidth="1.5" />
        <path d="M0 -22 L7 6 L0 0 L-7 6 Z" fill="hsl(var(--foreground) / 0.55)" />
        <text
          y="-38"
          textAnchor="middle"
          style={{ fontSize: 15, fontWeight: 900, letterSpacing: '0.2em', fill: 'hsl(var(--foreground) / 0.6)' }}
        >
          N
        </text>
      </g>
      <g transform="translate(72 936)" opacity="0.45">
        <line x1="0" y1="0" x2="96" y2="0" stroke="hsl(var(--foreground) / 0.5)" strokeWidth="2" />
        <line x1="0" y1="-5" x2="0" y2="5" stroke="hsl(var(--foreground) / 0.5)" strokeWidth="2" />
        <line x1="96" y1="-5" x2="96" y2="5" stroke="hsl(var(--foreground) / 0.5)" strokeWidth="2" />
        <text
          x="48"
          y="-8"
          textAnchor="middle"
          style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.18em', fill: 'hsl(var(--foreground) / 0.55)' }}
        >
          300 KM
        </text>
      </g>
    </svg>
  );
}

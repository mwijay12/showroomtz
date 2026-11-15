'use client';

/**
 * GrainOverlay — animated 35mm film grain (SVG turbulence, zero assets).
 * Adds the "cinema print" texture premium sites use. Pointer-events free.
 */

export function GrainOverlay({ opacity = 0.07 }: { opacity?: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[5] overflow-hidden mix-blend-overlay"
      style={{ opacity }}
    >
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <filter id="volta-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#volta-grain)" />
      </svg>
    </div>
  );
}

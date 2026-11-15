'use client';

/**
 * SiteTexture — the quiet layer under everything.
 *
 * A fixed film grain plus an inset vignette, at deliberately low opacity. It is
 * what stops large dark sections from looking like flat #000 and gives the
 * photography a printed, "serious" quality without costing a repaint: the
 * noise tile is an inline SVG and the whole layer is `pointer-events-none`.
 */

export function SiteTexture() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[85] overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.045] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'repeat',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          boxShadow: 'inset 0 0 180px 40px hsl(var(--background) / 0.55)',
        }}
      />
    </div>
  );
}

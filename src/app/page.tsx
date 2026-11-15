
'use client';

/**
 * ShowroomTZ — home.
 *
 * Editorial automotive layout, told in five acts:
 *   00  Hero          — studio frame, split-type lockup, telemetry, stamps
 *   01  The fleet      — pinned horizontal rail with WebGL pointer distortion
 *   02  The protocol   — auction → clearance → delivery, drawn connector
 *   03  Coverage       — route map + city list
 *   04  Estimate       — the acquisition calculator (live, functional)
 *   05  Next move      — GLSL aurora CTA
 *
 * Motion is layered, never simultaneous wallpaper: the hero owns load-time
 * choreography, the rail owns scroll, and the rest is reveal-on-enter.
 */

import { motion, useScroll, useSpring } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { GsapScrollFX } from '@/components/effects/GsapScrollFX';
import { Hero, TickerStrip } from '@/components/home/Hero';
import { Manifesto } from '@/components/home/Manifesto';
import { FeaturedFleet } from '@/components/home/FeaturedFleet';
import { ProcessRail } from '@/components/home/ProcessRail';
import { Engineering } from '@/components/home/Engineering';
import { StatsBand } from '@/components/home/StatsBand';
import { Coverage } from '@/components/home/Coverage';
import { FinalCta } from '@/components/home/FinalCta';
import { TripEstimator } from '@/components/ui/TripEstimator';
import { SplitReveal } from '@/components/effects/SplitReveal';
import { Stamp } from '@/components/effects/Stickers';
import { useBranding } from '@/components/providers/BrandingProvider';

export default function Home() {
  const { announcementText } = useBranding();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.3 });

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      {/* scroll progress — the only persistent chrome on the page */}
      <motion.div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-[9999] h-[2px] origin-left"
        style={{
          scaleX: progress,
          background:
            'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--accent)))',
        }}
      />
      <Navbar />
      <GsapScrollFX />

      <main className="flex-1 overflow-x-clip pt-14">
        {announcementText && (
          <div
            role="status"
            className="relative z-20 flex items-center justify-center gap-3 border-b border-primary/20 bg-primary/10 px-4 py-2 text-center"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <p className="text-[9px] font-black uppercase tracking-[0.28em] text-primary sm:text-[10px]">
              {announcementText}
            </p>
          </div>
        )}

        <Hero />
        <TickerStrip />
        <Manifesto />
        <FeaturedFleet />
        <ProcessRail />
        <Engineering />
        <StatsBand />
        <Coverage />

        {/* 04 · Estimate */}
        <section className="relative border-b border-border bg-muted/25 py-24 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
              <div>
                <div className="mb-4 flex items-center gap-4">
                  <span className="text-[9px] font-black uppercase tracking-[0.42em] text-primary">
                    05 / Estimate
                  </span>
                  <span className="h-px w-12 bg-border" />
                </div>
                <SplitReveal
                  as="h2"
                  type="words"
                  text="Know the number before you call."
                  stagger={0.05}
                  className="max-w-2xl text-[clamp(2rem,5vw,3.9rem)] font-black uppercase leading-[0.92] tracking-[-0.03em]"
                />
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  CIF, duty, registration and financing — built into one figure, so nobody
                  discovers a surprise at the port.
                </p>
              </div>
              <Stamp text="No hidden costs" sub="Written quote" tone="hsl(var(--muted-foreground))" />
            </div>

            <TripEstimator />
          </div>
        </section>

        <FinalCta />
      </main>

      <Footer />
    </div>
  );
}

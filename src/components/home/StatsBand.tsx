'use client';

/**
 * StatsBand — the dark "telemetry" band.
 *
 * Four counters with a drawn sparkline, stamped labels and a slow scan line.
 * Uses the dark surface on purpose: it gives the page a rhythm break between
 * two light content sections, which is what makes long-scroll sites feel
 * designed rather than stacked.
 */

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

import { CountUp } from '@/components/effects/CountUp';
import { Sparkline, SpeedGauge } from '@/components/effects/AnimatedSVG';
import { Stamp, SpeedLines } from '@/components/effects/Stickers';
import { ScrambleText } from '@/components/effects/ScrambleText';
import { useBranding } from '@/components/providers/BrandingProvider';

export function StatsBand() {
  const { stats } = useBranding();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [gauge, setGauge] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setGauge(96), 350);
    return () => clearTimeout(t);
  }, [inView]);

  const items = [
    { value: stats?.deployed || 500, suffix: '+', label: 'Showroom vehicles', note: 'live listings' },
    { value: stats?.missions || 2800, suffix: '+', label: 'Sold & delivered', note: 'since 2019' },
    { value: stats?.satisfaction || 98, suffix: '%', label: 'Buyer satisfaction', note: 'post-handover' },
    { value: stats?.cities || 7, suffix: '', label: 'Regions covered', note: 'nationwide' },
  ];

  return (
    <section className="relative overflow-hidden bg-[#080706] py-20 text-white sm:py-24">
      {/* texture + glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(circle at 50% 40%, black 5%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 40%, black 5%, transparent 70%)',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, hsl(var(--primary)), hsl(var(--secondary)), transparent)',
        }}
        aria-hidden="true"
      />

      <div ref={ref} className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <ScrambleText
                text="TELEMETRY · LIVE"
                trigger="view"
                className="text-[8px] font-black uppercase tracking-[0.4em] text-white/40"
              />
            </div>
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-black uppercase leading-[0.95] tracking-[-0.03em]">
              Numbers we can <span className="text-outline text-secondary">prove</span>
            </h2>
          </div>
          <SpeedLines className="text-white/20" width={130} count={4} />
        </div>

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] lg:grid-cols-4">
          {items.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
              className="group relative bg-[#0b0a09] px-6 py-9 transition-colors hover:bg-[#121010]"
            >
              <p className="text-4xl font-black tracking-tighter text-white sm:text-5xl">
                <CountUp
                  value={s.value}
                  suffix={s.suffix}
                  duration={1900 + i * 180}
                  className="tabular-nums"
                />
              </p>
              <p className="mt-3 text-[9px] font-black uppercase tracking-[0.24em] text-white/70">
                {s.label}
              </p>
              <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.22em] text-white/25">
                {s.note}
              </p>
              <span className="absolute inset-x-6 bottom-0 h-px scale-x-0 bg-secondary/60 transition-transform duration-500 group-hover:scale-x-100" />
            </motion.div>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 items-center gap-8 sm:grid-cols-[1fr_auto]">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="mb-2 text-[8px] font-black uppercase tracking-[0.3em] text-white/35">
                Quarter growth
              </p>
              <Sparkline className="w-[240px] text-white sm:w-[300px]" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Stamp text="TRA cleared" sub="EFD issued" tone="rgba(255,255,255,0.45)" />
              <Stamp text="Insured transit" sub="Port → gate" tone="rgba(255,255,255,0.45)" />
            </div>
          </div>

          <div className="hidden justify-self-end sm:block">
            <SpeedGauge value={gauge} label="Fleet readiness" size={168} />
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

/**
 * ProcessRail — "how a car reaches your gate", told in three numbered acts.
 *
 * Editorial three-column rail with a drawn connector path behind it, big
 * catalogue numerals, stamp marks and a scroll-scrubbed line. Each icon is
 * our own doodle set, so no icon library look-alike.
 */

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

import { SplitReveal } from '@/components/effects/SplitReveal';
import { AuctionSeal, SteeringDoodle, WrenchDoodle, RoadDoodle, SparkDoodle } from '@/components/effects/Stickers';

const STEPS = [
  {
    n: '01',
    tag: 'Source',
    title: 'We bid at auction',
    body: 'Japanese and Gulf auctions, sheet in hand. Grade, mileage and accident history are read before a single shilling moves.',
    icon: SteeringDoodle,
  },
  {
    n: '02',
    tag: 'Clear',
    title: 'We clear it properly',
    body: 'TRA assessment, duty paid, EFD receipted. No “we will sort it at the port” — the paperwork exists before the car does.',
    icon: WrenchDoodle,
  },
  {
    n: '03',
    tag: 'Deliver',
    title: 'We hand over the keys',
    body: 'Inspected, detailed, registered, then delivered to your gate anywhere in Tanzania — with a 12-month dealer warranty.',
    icon: RoadDoodle,
  },
];

export function ProcessRail() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="relative overflow-hidden border-b border-border bg-card/30 py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <SparkDoodle className="animate-twinkle absolute right-[12%] top-14 hidden text-secondary/40 md:block" size={30} />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-8">
          <div>
            <div className="mb-4 flex items-center gap-4">
              <span className="text-[9px] font-black uppercase tracking-[0.42em] text-primary">
                02 / The protocol
              </span>
              <span className="h-px w-12 bg-border" />
            </div>
            <SplitReveal
              as="h2"
              type="words"
              text="From auction block to your gate."
              stagger={0.05}
              className="max-w-2xl text-[clamp(2rem,5vw,3.9rem)] font-black uppercase leading-[0.92] tracking-[-0.03em]"
            />
          </div>

          <div className="flex items-center gap-5">
            <AuctionSeal size={104} className="text-secondary" />
            <p className="max-w-[190px] text-[9px] font-black uppercase leading-relaxed tracking-[0.22em] text-muted-foreground">
              Three acts. No shortcuts. Same standard on a 12M Prado or a 300M LX.
            </p>
          </div>
        </div>

        <div ref={ref} className="relative">
          {/* drawn connector */}
          <svg
            className="pointer-events-none absolute inset-x-0 top-[64px] hidden h-24 w-full md:block"
            viewBox="0 0 1200 96"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M40 70C220 16 340 88 520 54s300-46 440 8 180 22 200 14"
              stroke="hsl(var(--border))"
              strokeWidth="1.5"
              strokeDasharray="6 8"
              className="svg-draw"
              style={{ ['--dash-length' as any]: 1500 }}
            />
          </svg>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.article
                  key={step.n}
                  initial={{ opacity: 0, y: 28 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.65, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative flex flex-col gap-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="index-number text-6xl font-black text-border transition-colors duration-500 group-hover:text-primary/40 sm:text-7xl">
                      {step.n}
                    </span>
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background text-foreground transition-colors duration-500 group-hover:border-primary/40 group-hover:text-primary">
                      <Icon size={26} />
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[8px] font-black uppercase tracking-[0.32em] text-primary">
                      {step.tag}
                    </p>
                    <h3 className="text-xl font-black uppercase leading-tight tracking-tight text-foreground sm:text-2xl">
                      {step.title}
                    </h3>
                    <p className="max-w-sm text-[13px] leading-relaxed text-muted-foreground">
                      {step.body}
                    </p>
                  </div>

                  <span className="mt-1 h-px w-full origin-left scale-x-0 bg-primary/50 transition-transform duration-700 group-hover:scale-x-100" />
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

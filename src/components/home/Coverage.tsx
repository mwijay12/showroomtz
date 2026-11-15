'use client';

/**
 * Coverage — the nationwide delivery story.
 *
 * A drawn route map (Anime.js motion path) with city waypoints, paired with
 * an editorial city list and two hand-drawn stickers. Deliberately diagrammatic
 * rather than a stock photo: it answers “do you deliver to me?” in one glance.
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, MapPin } from 'lucide-react';

import { SplitReveal } from '@/components/effects/SplitReveal';
import { RouteTrace } from '@/components/effects/AnimatedSVG';
import { Stamp, WordRing, ProvenanceSticker } from '@/components/effects/Stickers';
import { MagneticButton } from '@/components/effects/Interactive';

const CITIES = [
  { name: 'Dar es Salaam', note: 'HQ · Mikocheni', primary: true },
  { name: 'Dodoma', note: 'Central corridor' },
  { name: 'Arusha', note: 'Northern circuit' },
  { name: 'Mwanza', note: 'Lake zone' },
  { name: 'Zanzibar', note: 'Ferry handover' },
  { name: 'Mbeya', note: 'Southern highlands' },
  { name: 'Tanga', note: 'Coastal north' },
];

export function Coverage() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute right-[-10%] top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-secondary/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="mb-4 flex items-center gap-4">
            <span className="text-[9px] font-black uppercase tracking-[0.42em] text-primary">
              03 / Coverage
            </span>
            <span className="h-px w-12 bg-border" />
          </div>

          <SplitReveal
            as="h2"
            type="words"
            text="Cleared at the port. Delivered to your gate."
            stagger={0.05}
            className="max-w-xl text-[clamp(2rem,5vw,3.9rem)] font-black uppercase leading-[0.92] tracking-[-0.03em]"
          />

          <p className="mt-6 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            We handle the boring, expensive part — inspection, shipping, TRA assessment, duty,
            registration — then put the keys in your hand wherever you actually are.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            <Stamp text="Port → gate" sub="Insured transit" tone="hsl(var(--muted-foreground))" />
            <Stamp text="Registration" sub="TRA + TRA plates" tone="hsl(var(--muted-foreground))" />
            <ProvenanceSticker className="hidden !border-border !bg-card/60 sm:inline-flex [&_span]:!text-muted-foreground" />
          </div>

          <MagneticButton strength={0.14} className="mt-8">
            <Link
              href="/contact"
              className="group inline-flex h-12 items-center gap-3 rounded-full border border-border px-6 text-[9px] font-black uppercase tracking-[0.26em] text-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              Check delivery to your town
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </MagneticButton>
        </div>

        {/* map card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[2rem] border border-border bg-card/60 p-6 sm:p-8"
        >
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                Delivery network
              </span>
            </div>
            <span className="rounded-full border border-border px-3 py-1 text-[7px] font-black uppercase tracking-[0.24em] text-muted-foreground">
              7 regions
            </span>
          </div>

          <RouteTrace className="w-full" />

          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-border pt-5">
            {CITIES.map((c) => (
              <div key={c.name} className="flex items-start gap-2.5">
                <span
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                    c.primary ? 'bg-primary' : 'bg-border'
                  }`}
                />
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.08em] text-foreground">
                    {c.name}
                  </p>
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    {c.note}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <WordRing
            size={150}
            className="pointer-events-none absolute -right-10 -top-10 text-border/70"
            words="NATIONWIDE · INSURED · TRACKED · "
          />
        </motion.div>
      </div>
    </section>
  );
}

'use client';

/**
 * Coverage — the two legs of delivery, on real geography.
 *
 * One job: Dar es Salaam → the seven regions we deliver to.
 * The map is generated from Natural Earth polygons (see `tanzania-geo.ts`),
 * so Lake Victoria, Tanganyika, Rukwa and Nyasa sit where they belong and the
 * city nodes are projected from true coordinates.
 */

import Link from 'next/link';
import { ArrowUpRight, MapPin } from 'lucide-react';

import { SplitReveal } from '@/components/effects/SplitReveal';
import { Reveal } from '@/components/effects/Reveal';
import { TanzaniaMap } from '@/components/effects/TanzaniaMap';
import { Stamp, WordRing, ProvenanceSticker } from '@/components/effects/Stickers';
import { MagneticButton } from '@/components/effects/Interactive';

export function Coverage() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute right-[-10%] top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-secondary/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[0.92fr_1.08fr]">
          <div>
            <div className="mb-4 flex items-center gap-4">
              <span className="text-[9px] font-black uppercase tracking-[0.42em] text-primary">
                04 / Coverage
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
              We handle the boring, expensive part — auction, shipping, TRA assessment, duty,
              registration — then put the keys in your hand wherever you actually are. Every
              distance on this page is real.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              <Stamp text="Port → gate" sub="Insured transit" tone="hsl(var(--muted-foreground))" />
              <Stamp text="Registration" sub="TRA plates" tone="hsl(var(--muted-foreground))" />
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

          {/* the map */}
          <Reveal y={28}>
            <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card/50 p-3 sm:p-5">
              <div className="mb-2 flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                    Delivery network
                  </span>
                </div>
                <span className="rounded-full border border-border px-3 py-1 text-[7px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                  7 delivery nodes · hover a node
                </span>
              </div>

              <div className="mx-auto w-full max-w-[540px]">
                <TanzaniaMap />
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border px-2 pt-3">
                <div className="flex items-center gap-5">
                  <span className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-primary" /> HQ · port
                  </span>
                  <span className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-foreground" /> Delivery node
                  </span>
                </div>
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Dar → Mbeya ≈ 850 km
                </span>
              </div>

              <WordRing
                size={120}
                className="pointer-events-none absolute -left-8 -top-8 text-border/60"
                words="NATIONWIDE · INSURED · TRACKED · "
              />
            </div>
          </Reveal>
        </div>

      </div>
    </section>
  );
}

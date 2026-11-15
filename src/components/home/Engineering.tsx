'use client';

/**
 * Engineering — the "under the bonnet" act.
 *
 * Eight animated automotive SVGs, one per inspection domain, each in a card
 * that spins its part up on hover. This is where the motion library earns its
 * keep: the drawings are the content, not decoration.
 */

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import {
  AlloyWheel,
  Piston,
  GearPair,
  BrakeDisc,
  Turbo,
  Suspension,
  Headlight,
  KeyFob,
} from '@/components/effects/CarParts';
import { SplitReveal } from '@/components/effects/SplitReveal';
import { ScrambleText } from '@/components/effects/ScrambleText';
import { Reveal, Parallax } from '@/components/effects/Reveal';
import { Stamp, SpeedLines } from '@/components/effects/Stickers';

const DOMAINS = [
  {
    n: '01',
    Part: AlloyWheel,
    title: 'Wheels & tyres',
    copy: 'Tread depth, sidewall age, wheel run-out and bearing play measured on the ramp.',
    meta: 'Tread · run-out · bearings',
  },
  {
    n: '02',
    Part: Piston,
    title: 'Engine & compression',
    copy: 'Cold-start behaviour, compression and leak-down, plus an oil sample on every import.',
    meta: 'Compression · leak-down',
  },
  {
    n: '03',
    Part: GearPair,
    title: 'Transmission',
    copy: 'Shift quality under load, torque-converter behaviour and differential backlash.',
    meta: 'Shift map · diff',
  },
  {
    n: '04',
    Part: BrakeDisc,
    title: 'Brakes',
    copy: 'Pad thickness, disc lipping, line condition and ABS fault codes, front and rear.',
    meta: 'Pads · discs · ABS',
  },
  {
    n: '05',
    Part: Turbo,
    title: 'Turbo & emissions',
    copy: 'Boost curve, shaft play, intercooler integrity and visible smoke under acceleration.',
    meta: 'Boost · EGT · smoke',
  },
  {
    n: '06',
    Part: Suspension,
    title: 'Suspension',
    copy: 'Shock rebound, bush cracking, spring sag and a four-wheel alignment printout.',
    meta: 'Shocks · bushes · alignment',
  },
  {
    n: '07',
    Part: Headlight,
    title: 'Lighting & electrics',
    copy: 'Every lamp, sensor and ECU scanned; battery health and charging voltage logged.',
    meta: 'Lamps · ECU scan',
  },
  {
    n: '08',
    Part: KeyFob,
    title: 'Keys & paperwork',
    copy: 'Two keys, auction sheet, chassis verification, TRA assessment and EFD receipt file.',
    meta: 'Keys · sheet · clearance',
  },
];

export function Engineering() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background py-24 sm:py-28">
      {/* oversized word bleeding behind the section */}
      <Parallax distance={70} className="pointer-events-none absolute inset-x-0 top-10">
        <span className="index-number block select-none text-center text-[22vw] font-black uppercase leading-none text-foreground/[0.035]">
          Teardown
        </span>
      </Parallax>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-8">
          <div>
            <div className="mb-4 flex items-center gap-4">
              <ScrambleText
                text="03 / THE TEARDOWN"
                trigger="view"
                className="text-[9px] font-black uppercase tracking-[0.42em] text-primary"
              />
              <SpeedLines className="text-border" width={70} count={3} />
            </div>
            <SplitReveal
              as="h2"
              type="words"
              text="Every panel has a history."
              stagger={0.05}
              className="max-w-2xl text-[clamp(2rem,5vw,3.9rem)] font-black uppercase leading-[0.92] tracking-[-0.03em]"
            />
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Forty-five checkpoints across eight systems, logged in writing before a unit is
              listed. What we find is what you see — including the faults we would rather not.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Stamp text="45 checkpoints" sub="Signed report" tone="hsl(var(--muted-foreground))" />
            <div className="text-right">
              <p className="text-4xl font-black tracking-tighter text-foreground">45</p>
              <p className="text-[8px] font-black uppercase tracking-[0.24em] text-muted-foreground">
                point inspection
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DOMAINS.map((d, i) => {
            const { Part } = d;
            return (
              <Reveal key={d.n} delay={(i % 4) * 0.07} y={22}>
                <div className="part-card group relative flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-border bg-card/60 transition-colors duration-500 hover:border-primary/40">
                  {/* plate */}
                  <div className="relative flex h-[168px] items-center justify-center overflow-hidden border-b border-border/60">
                    <div
                      className="pointer-events-none absolute inset-0 opacity-60"
                      style={{
                        backgroundImage:
                          'linear-gradient(to right, hsl(var(--foreground) / 0.04) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground) / 0.04) 1px, transparent 1px)',
                        backgroundSize: '28px 28px',
                      }}
                      aria-hidden="true"
                    />
                    <span className="absolute left-3 top-2.5 text-[9px] font-black tracking-[0.2em] text-muted-foreground/70">
                      {d.n}
                    </span>
                    <span className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-opacity duration-500 group-hover:opacity-100 sm:opacity-0" />
                    <div className="relative text-foreground transition-colors duration-500 group-hover:text-secondary">
                      <Part size={104} />
                    </div>
                  </div>

                  {/* copy */}
                  <div className="flex flex-1 flex-col justify-between gap-3 p-5">
                    <div>
                      <h3 className="text-[13px] font-black uppercase tracking-[0.06em] text-foreground">
                        {d.title}
                      </h3>
                      <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{d.copy}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-border/60 pt-2.5">
                      <span className="text-[7.5px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
                        {d.meta}
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-5 rounded-[1.6rem] border border-border bg-card/40 px-6 py-5">
          <p className="max-w-xl text-[11px] font-bold uppercase leading-relaxed tracking-[0.14em] text-muted-foreground">
            Every listing carries its inspection report, auction sheet and clearance file — ask for
            them before you send a deposit.
          </p>
          <Link
            href="/cars"
            className="group inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.26em] text-foreground transition-colors hover:text-primary"
          >
            <span className="hover-underline">See a documented unit</span>
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

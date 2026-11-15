'use client';

/**
 * Manifesto — the editorial statement band.
 *
 * Word-by-word scroll reveal on a very large serif-less statement, with a
 * rotating auction seal, hand-drawn doodles and three micro-metrics. This is
 * the "quiet" section that makes the loud hero feel intentional.
 */

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';

import { CountUp } from '@/components/effects/CountUp';
import { AuctionSeal, RoadDoodle, WrenchDoodle, SparkDoodle, WordRing } from '@/components/effects/Stickers';

const STATEMENT = [
  { word: 'We', accent: false },
  { word: 'do', accent: false },
  { word: 'not', accent: false },
  { word: 'list', accent: false },
  { word: 'cars.', accent: true },
  { word: 'We', accent: false },
  { word: 'document', accent: false },
  { word: 'them.', accent: true },
];

const METRICS = [
  { value: 412, suffix: '', label: 'Auction sheets verified' },
  { value: 97, suffix: '%', label: 'Cleared under 14 days' },
  { value: 4.9, suffix: '★', label: 'Deal rating', decimals: 1 },
];

export function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-120px' });

  return (
    <section className="relative overflow-hidden border-b border-border bg-background py-24 sm:py-32">
      {/* ambient marks */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-24 top-10 h-[360px] w-[360px] rounded-full bg-primary/5 blur-[110px]" />
        <div className="absolute -right-16 bottom-0 h-[300px] w-[300px] rounded-full bg-secondary/5 blur-[100px]" />
        <RoadDoodle className="absolute left-[6%] top-10 hidden text-border md:block" width={190} />
        <WrenchDoodle className="animate-float-y absolute right-[8%] bottom-16 hidden text-border md:block" size={54} />
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-start gap-14 px-5 sm:px-8 lg:grid-cols-[1.55fr_1fr]">
        {/* statement */}
        <div ref={ref}>
          <div className="mb-8 flex items-center gap-4">
            <span className="text-[9px] font-black uppercase tracking-[0.42em] text-primary">
              The house standard
            </span>
            <span className="h-px w-16 bg-gradient-to-r from-primary/60 to-transparent" />
          </div>

          <p className="flex flex-wrap gap-x-4 gap-y-1 text-[clamp(2.1rem,5.2vw,4.4rem)] font-black uppercase leading-[0.92] tracking-[-0.03em]">
            {STATEMENT.map((w, i) => (
              <motion.span
                key={`${w.word}-${i}`}
                initial={{ opacity: 0, y: 26, filter: 'blur(6px)' }}
                animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
                transition={{ duration: 0.6, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                className={w.accent ? 'text-primary italic' : 'text-foreground'}
              >
                {w.word}
              </motion.span>
            ))}
          </p>

          <p className="mt-8 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Every unit arrives with its Japanese auction sheet, chassis verification and
            accident history; every shilling is receipted. If we cannot document it, we do not
            sell it.
          </p>

          <Link
            href="/about"
            className="group mt-8 inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.28em] text-foreground transition-colors hover:text-primary"
          >
            <span className="hover-underline">How we work</span>
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>

          {/* metrics */}
          <div className="mt-12 grid grid-cols-3 gap-4 border-t border-border pt-8">
            {METRICS.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <p className="text-3xl font-black tracking-tighter text-foreground sm:text-4xl">
                  <CountUp
                    value={m.value}
                    suffix={m.suffix}
                    decimals={m.decimals ?? 0}
                    duration={1800 + i * 200}
                  />
                </p>
                <p className="mt-1 text-[8px] font-black uppercase leading-relaxed tracking-[0.22em] text-muted-foreground">
                  {m.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* seal composition */}
        <div className="relative hidden aspect-square items-center justify-center lg:flex">
          <WordRing
            size={330}
            className="absolute inset-0 m-auto text-border"
            words="SHOWROOM TZ · DOCUMENTED · DUTY PAID · DELIVERED · "
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.85, rotate: 8 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex flex-col items-center gap-6 rounded-[2rem] border border-border bg-card/60 p-8 backdrop-blur-sm"
          >
            <AuctionSeal size={190} className="text-secondary" />
            <div className="text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.32em] text-foreground">
                Every unit, stamped
              </p>
              <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                Sheet · Chassis · Duty · EFD
              </p>
            </div>
            <SparkDoodle className="animate-twinkle absolute -right-3 -top-3 text-secondary" size={26} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

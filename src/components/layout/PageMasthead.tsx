'use client';

/**
 * PageMasthead — the shared editorial opening used by every inner page.
 *
 * One component means the whole site speaks the same language: a numbered
 * kicker, an oversized two-line lockup (solid + outlined word), a short standfirst,
 * a rotated sticker, and a faded catalogue numeral bleeding off the edge.
 * Pages pass actions as children so search bars / CTAs still live in the flow.
 */

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

import { SplitReveal } from '@/components/effects/SplitReveal';
import { ScrambleText } from '@/components/effects/ScrambleText';
import { AuctionSeal, ProvenanceSticker, SpeedLines, SparkDoodle } from '@/components/effects/Stickers';

type Props = {
  /** small label, e.g. "The registry" */
  kicker: string;
  /** first line of the lockup */
  title: string;
  /** second line, rendered as an outline */
  outline?: string;
  /** standfirst paragraph */
  blurb?: ReactNode;
  /** catalogue numeral bleeding off the right edge */
  index?: string;
  /** sticker shown at the right of the masthead */
  seal?: 'auction' | 'provenance' | 'none';
  /** actions / filters rendered under the copy */
  children?: ReactNode;
  className?: string;
};

export function PageMasthead({
  kicker,
  title,
  outline,
  blurb,
  index = '00',
  seal = 'auction',
  children,
  className = '',
}: Props) {
  return (
    <section
      className={`relative overflow-hidden border-b border-border bg-background pb-12 pt-28 sm:pb-16 sm:pt-32 ${className}`}
    >
      {/* atmosphere */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="grid-lines absolute inset-0 opacity-[0.35]" />
        <div className="absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-primary/[0.07] blur-[120px]" />
        <div className="absolute -right-24 top-10 h-[320px] w-[320px] rounded-full bg-secondary/[0.06] blur-[110px]" />
        <span className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <span className="index-number pointer-events-none absolute -right-4 top-8 select-none text-[16rem] font-black leading-none text-foreground/[0.035] sm:text-[22rem]">
          {index}
        </span>
        <SparkDoodle className="animate-twinkle absolute right-[18%] top-16 hidden text-secondary/35 md:block" size={26} />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="max-w-3xl">
            <div className="mb-5 flex items-center gap-4">
              <ScrambleText
                text={kicker.toUpperCase()}
                trigger="view"
                className="text-[9px] font-black uppercase tracking-[0.42em] text-primary"
              />
              <span className="h-px w-14 bg-gradient-to-r from-primary/60 to-transparent" />
              {index !== '00' && (
                <span className="text-[9px] font-black uppercase tracking-[0.28em] text-muted-foreground">
                  {index}
                </span>
              )}
            </div>

            <h1 className="text-[clamp(2.6rem,7vw,5.6rem)] font-black uppercase leading-[0.86] tracking-[-0.045em]">
              <SplitReveal as="span" type="words" text={title} stagger={0.05} className="block" />
              {outline && (
                <SplitReveal
                  as="span"
                  type="words"
                  text={outline}
                  stagger={0.05}
                  delay={0.08}
                  className="block text-outline text-primary"
                />
              )}
            </h1>

            {blurb && (
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base"
              >
                {blurb}
              </motion.p>
            )}

            {children && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="mt-8"
              >
                {children}
              </motion.div>
            )}
          </div>

          {/* stickers */}
          <div className="hidden shrink-0 items-center gap-6 pr-4 md:flex">
            <SpeedLines className="text-border" width={70} count={3} />
            {seal === 'auction' && (
              <motion.div
                initial={{ opacity: 0, rotate: 16, scale: 0.9 }}
                animate={{ opacity: 1, rotate: -6, scale: 1 }}
                transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="sticker-shadow text-secondary"
              >
                <AuctionSeal size={132} />
              </motion.div>
            )}
            {seal === 'provenance' && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.25 }}
                className="sticker-shadow"
              >
                <ProvenanceSticker />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

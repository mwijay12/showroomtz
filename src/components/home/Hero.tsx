'use client';

/**
 * Home Hero — cinematic automotive opening.
 *
 * Composition (deliberately not a generic "centered headline + button"):
 *   · full-bleed studio frame of a dark SUV with the negative space on the
 *     left, so the type sits in real negative space instead of on a scrim
 *   · a two-line display lockup — solid word + outlined word — with GSAP
 *     SplitText masking each line up from below
 *   · typewriter value-prop line and stamped trust marks (custom SVGs)
 *   · floating auction seal + a telemetry gauge card on the right
 *   · counter-scrolling sticker strip pinned to the bottom of the hero
 *
 * Motion notes: image parallax via framer's useScroll, everything else is
 * cheap transform/opacity work. Reduced-motion users get the final frame.
 */

import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Play } from 'lucide-react';

import { SplitReveal } from '@/components/effects/SplitReveal';
import { ScrambleText } from '@/components/effects/ScrambleText';
import { Typewriter } from '@/components/effects/Typewriter';
import { CountUp } from '@/components/effects/CountUp';
import { MagneticButton } from '@/components/effects/Interactive';
import { SpeedGauge, OrbitalRings } from '@/components/effects/AnimatedSVG';
import { AuctionSeal, Stamp, SteeringDoodle, SpeedLines, ProvenanceSticker } from '@/components/effects/Stickers';
import { GrainOverlay } from '@/components/effects/GrainOverlay';
import { Marquee } from '@/components/effects/Marquee';
import { useBranding } from '@/components/providers/BrandingProvider';

const TICKER = [
  'LAND CRUISER 300',
  'S-CLASS',
  'RANGE ROVER',
  'LX 600',
  'PRADO TXL',
  'ALPHARD',
  'HILUX 4x4',
  'BMW 7',
];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { heroImageUrl, heroKicker, tagline, companyName } = useBranding();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });
  const imageY = useTransform(smooth, [0, 1], ['0%', '16%']);
  const imageScale = useTransform(smooth, [0, 1], [1.02, 1.12]);
  const copyY = useTransform(smooth, [0, 1], ['0%', '-18%']);
  const copyOpacity = useTransform(smooth, [0, 0.75], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-background"
    >
      {/* ── BACKDROP ─────────────────────────────────────────────── */}
      <motion.div style={{ y: imageY, scale: imageScale }} className="absolute inset-0 z-0">
        <Image
          src={heroImageUrl || '/images/studio/hero-suv.jpg'}
          alt={`${companyName || 'ShowroomTZ'} — studio-lit luxury SUV`}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[72%_50%]"
        />
        {/* legibility scrims */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/75 to-transparent md:via-background/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-background/60" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(70% 60% at 12% 62%, hsl(var(--primary) / 0.16), transparent 70%)',
          }}
        />
      </motion.div>

      <GrainOverlay opacity={0.07} />
      <div className="grid-lines pointer-events-none absolute inset-0 z-0 opacity-70" aria-hidden="true" />

      {/* ── FLOATING ARTEFACTS (desktop) ─────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 z-10 hidden lg:block">
        <OrbitalRings className="absolute -right-24 top-24 opacity-30" size={520} />

        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotate: -18 }}
          animate={{ opacity: 1, scale: 1, rotate: -11 }}
          transition={{ delay: 0.9, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="sticker-shadow absolute right-[9%] top-[16%] text-secondary/90"
        >
          <AuctionSeal size={150} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15, duration: 0.9 }}
          className="absolute bottom-36 right-[7%] w-[212px] rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur-xl"
        >
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[7px] font-black uppercase tracking-[0.3em] text-white/45">
              Fleet telemetry
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </div>
          <SpeedGauge value={94} label="Inspected & cleared" size={168} />
          <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 text-[7px] font-black uppercase tracking-[0.22em] text-white/40">
            <span>Grade 4.5 avg</span>
            <span className="text-secondary">
              <CountUp value={48} suffix="h" duration={1600} /> handover
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── COPY ─────────────────────────────────────────────────── */}
      <motion.div
        style={{ y: copyY, opacity: copyOpacity }}
        className="relative z-20 mx-auto w-full max-w-7xl px-5 pb-28 pt-32 sm:px-8 lg:pb-40"
      >
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-7 inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 backdrop-blur-md"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-secondary" />
          </span>
          <ScrambleText
            text={(heroKicker || '').trim() || 'DAR ES SALAAM · NATIONWIDE DELIVERY'}
            trigger="mount"
            className="text-[8px] font-black uppercase tracking-[0.36em] text-white/70"
          />
        </motion.div>

        <h1 className="text-[clamp(3.2rem,11.5vw,10.5rem)] font-black uppercase leading-[0.84] tracking-[-0.045em]">
          <SplitReveal as="span" animateOn="mount" type="lines" delay={0.1} stagger={0.1} text="SHOWROOM" className="block text-white" />
          <span className="flex items-baseline gap-4">
            <SplitReveal as="span" animateOn="mount" type="lines" delay={0.24} stagger={0.1} text="TZ" className="block text-outline text-secondary" />
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.7 }}
              className="hidden translate-y-[-0.35em] items-center gap-3 sm:flex"
            >
              <SpeedLines className="text-secondary/60" width={110} />
              <span className="max-w-[150px] text-[8px] font-black uppercase leading-relaxed tracking-[0.26em] text-white/45">
                Verified imports, cleared and delivered
              </span>
            </motion.span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
          className="mt-6 flex min-h-[1.9rem] items-center text-sm font-black uppercase tracking-[0.28em] text-secondary sm:text-base"
        >
          <Typewriter
            phrases={[
              'AUCTION-GRADED IMPORTS.',
              'TRA DUTY CLEARED.',
              'DELIVERED TO YOUR GATE.',
              'FINANCING ARRANGED.',
            ]}
            typingSpeed={52}
            holdTime={2200}
          />
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-5 max-w-[34ch] text-sm leading-relaxed text-white/55 sm:text-base"
        >
          {tagline ||
            'Tanzania’s most disciplined vehicle partner — curated showroom inventory, documented provenance, and white-glove delivery from Dar es Salaam to everywhere.'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15, duration: 0.8 }}
          className="mt-9 flex flex-wrap items-center gap-3"
        >
          <MagneticButton strength={0.2}>
            <Link
              href="/cars"
              className="group inline-flex h-14 items-center gap-3 rounded-full bg-primary px-7 text-[10px] font-black uppercase tracking-[0.24em] text-white shadow-[0_24px_60px_-24px_hsl(var(--primary))] transition-transform hover:scale-[1.03]"
            >
              Explore the fleet
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </MagneticButton>

          <MagneticButton strength={0.14}>
            <Link
              href="/find-my-car"
              className="group inline-flex h-14 items-center gap-3 rounded-full border border-white/15 bg-white/[0.04] px-7 text-[10px] font-black uppercase tracking-[0.24em] text-white backdrop-blur-md transition-colors hover:border-secondary/50 hover:text-secondary"
            >
              <Play className="h-3 w-3" />
              Find my car
            </Link>
          </MagneticButton>

          <Link
            href="/landing/luxury"
            className="group ml-1 hidden items-center gap-2 text-[9px] font-black uppercase tracking-[0.26em] text-white/45 transition-colors hover:text-white sm:inline-flex"
          >
            The Collection
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </motion.div>

        {/* stamps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.35 }}
          className="mt-9 flex flex-wrap items-center gap-2.5"
        >
          <Stamp text="Duty cleared" sub="TRA assessed" tone="rgba(255,255,255,0.55)" className="sticker-shadow" />
          <Stamp text="Auction graded" sub="Japan sheets" tone="rgba(255,255,255,0.55)" className="sticker-shadow" />
          <ProvenanceSticker className="hidden sm:inline-flex" />
        </motion.div>
      </motion.div>

      {/* ── STICKER TICKER ───────────────────────────────────────── */}
      <div className="relative z-20 border-t border-white/10 bg-background/40 backdrop-blur-md">
        <Marquee duration={34} gap="gap-6" className="py-4">
          {TICKER.map((name) => (
            <div key={name} className="flex items-center gap-6">
              <span className="text-[11px] font-black uppercase tracking-[0.32em] text-white/55">{name}</span>
              <SteeringDoodle size={18} className="text-secondary/50" />
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}

/** Sticker strip used between sections — counter-scrolling badge rows. */
export function TickerStrip() {
  return (
    <div className="relative border-y border-border bg-card/40 py-5">
      <Marquee duration={40} gap="gap-10" className="text-foreground/85">
        {[
          { t: 'DUTY CLEARED', s: 'TRA assessed' },
          { t: 'AUCTION GRADE 4.5', s: 'Japan sheets' },
          { t: 'VERIFIED SHOWROOMS', s: 'Nationwide' },
          { t: '12-MONTH WARRANTY', s: 'Dealer backed' },
          { t: '48H HANDOVER', s: 'Dar es Salaam' },
          { t: 'EFD RECEIPTS', s: 'Every sale' },
        ].map((b) => (
          <div key={b.t} className="flex items-center gap-10">
            <Stamp text={b.t} sub={b.s} tone="hsl(var(--muted-foreground))" />
            <span className="text-secondary">✦</span>
          </div>
        ))}
      </Marquee>
    </div>
  );
}

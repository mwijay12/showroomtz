'use client';

/**
 * FinalCta — the closing act.
 *
 * Full-bleed GLSL aurora behind oversized outlined type, a magnetic primary
 * action, WhatsApp secondary, and the auction seal rotated into the corner.
 * Deliberately different from the photographic hero so the page ends on
 * motion rather than another photo.
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle } from 'lucide-react';

import { WebGLShaderBackground } from '@/components/effects/WebGLShaderBackground';
import { GrainOverlay } from '@/components/effects/GrainOverlay';
import { SplitReveal } from '@/components/effects/SplitReveal';
import { Typewriter } from '@/components/effects/Typewriter';
import { MagneticButton } from '@/components/effects/Interactive';
import { AuctionSeal, SteeringDoodle, SpeedLines } from '@/components/effects/Stickers';
import { useBranding } from '@/components/providers/BrandingProvider';

export function FinalCta() {
  const { whatsappNumber, companyName } = useBranding();
  const wa = (whatsappNumber || '+255700000000').replace(/[^0-9]/g, '');
  const waHref = `https://wa.me/${wa}?text=${encodeURIComponent(
    `Habari ${companyName || 'ShowroomTZ'}! I would like to talk about a vehicle.`
  )}`;

  return (
    <section className="relative overflow-hidden bg-[#050404] py-28 sm:py-36">
      <WebGLShaderBackground style="aurora" opacity={0.9} />
      <GrainOverlay opacity={0.08} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050404] via-[#050404]/25 to-[#050404]/70" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-black uppercase tracking-[0.42em] text-secondary">
            05 / Next move
          </span>
          <SpeedLines className="text-white/25" width={90} count={3} />
        </div>

        <h2 className="mt-6 text-[clamp(2.6rem,9vw,8rem)] font-black uppercase leading-[0.84] tracking-[-0.045em] text-white">
          <SplitReveal as="span" type="words" text="Tell us the car." stagger={0.05} className="block" />
          <SplitReveal
            as="span"
            type="words"
            text="We’ll do the rest."
            stagger={0.05}
            delay={0.1}
            className="block text-outline text-secondary"
          />
        </h2>

        <p className="mt-7 flex min-h-[1.8rem] items-center text-[11px] font-black uppercase tracking-[0.3em] text-white/60 sm:text-xs">
          <Typewriter
            phrases={[
              'BUDGET → SHORTLIST IN 24H.',
              'AUCTION SHEET BEFORE DEPOSIT.',
              'DELIVERY DATE IN WRITING.',
            ]}
            typingSpeed={46}
            holdTime={2300}
          />
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <MagneticButton strength={0.22}>
            <Link
              href="/find-my-car"
              className="group inline-flex h-16 items-center gap-4 rounded-full bg-white px-8 text-[10px] font-black uppercase tracking-[0.26em] text-black transition-transform hover:scale-[1.03]"
            >
              Find my car
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </MagneticButton>

          <MagneticButton strength={0.14}>
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex h-16 items-center gap-3 rounded-full border border-white/20 bg-white/[0.04] px-8 text-[10px] font-black uppercase tracking-[0.26em] text-white backdrop-blur-md transition-colors hover:border-emerald-400/60 hover:text-emerald-300"
            >
              <MessageCircle className="h-4 w-4 transition-transform group-hover:rotate-12" />
              WhatsApp a human
            </a>
          </MagneticButton>

          <Link
            href="/landing/corporate"
            className="group ml-2 inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.28em] text-white/45 transition-colors hover:text-white"
          >
            Fleet leasing
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-6 border-t border-white/10 pt-8">
          <div className="flex items-center gap-4">
            <SteeringDoodle className="text-white/25" size={30} />
            <p className="max-w-sm text-[9px] font-bold uppercase leading-relaxed tracking-[0.22em] text-white/35">
              {companyName || 'ShowroomTZ'} · Mikocheni, Dar es Salaam · replies within minutes
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, rotate: 14 }}
            whileInView={{ opacity: 1, rotate: 8 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="sticker-shadow text-secondary/80"
          >
            <AuctionSeal size={110} center="4.9" label="DEAL RATING" spin />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

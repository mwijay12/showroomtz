'use client';

/**
 * LandingIndex — the campaign gateway.
 *
 * Editorial dark layout: GLSL aurora hero, split-text headline, live
 * counters, and two campaign portals that reveal their own imagery on
 * hover (image, spotlight border, tilt + magnetic arrow).
 */

import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';

import { WebGLShaderBackground } from '@/components/effects/WebGLShaderBackground';
import { GrainOverlay } from '@/components/effects/GrainOverlay';
import { GsapScrollFX } from '@/components/effects/GsapScrollFX';
import { SplitReveal } from '@/components/effects/SplitReveal';
import { ScrambleText } from '@/components/effects/ScrambleText';
import { Typewriter } from '@/components/effects/Typewriter';
import { CountUp } from '@/components/effects/CountUp';
import { Marquee } from '@/components/effects/Marquee';
import { SpotlightCard, TiltCard, MagneticButton } from '@/components/effects/Interactive';
import { OrbitalRings } from '@/components/effects/AnimatedSVG';

const CAMPAIGNS = [
  {
    href: '/landing/luxury',
    index: '01',
    tag: 'The ShowroomTZ Collection',
    title: 'Drive the Unmistakable.',
    text: 'Duty-cleared auction-graded imports. Land Cruiser, S-Class, Range Rover, LX 600.',
    accent: 'text-primary',
    glow: 'hsl(var(--primary))',
    image: '/images/studio/sclass.jpg',
    meta: '12 units in the current edit',
  },
  {
    href: '/landing/corporate',
    index: '02',
    tag: 'ShowroomTZ Corporate Fleet',
    title: 'Move Teams, Not Excuses.',
    text: 'Executive & field fleet leasing — insured, tracked, EFD-compliant billing. Nationwide.',
    accent: 'text-secondary',
    glow: 'hsl(var(--secondary))',
    image: '/images/studio/alphard.jpg',
    meta: 'Fleet from 3 vehicles',
  },
];

const STATS = [
  { value: 500, suffix: '+', label: 'Verified listings' },
  { value: 2800, suffix: '+', label: 'Deliveries' },
  { value: 7, suffix: '', label: 'Regions' },
  { value: 98, suffix: '%', label: 'Satisfaction' },
];

const TICKER = [
  'Duty cleared', 'Auction graded', 'Same-week delivery', 'EFD receipts',
  'Nationwide network', 'Verified showrooms',
];

export function LandingIndex() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 26 });
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, -60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.35]);

  return (
    <div className="relative min-h-screen bg-[#050505] text-white">
      <GsapScrollFX />

      {/* scroll rail */}
      <motion.div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left"
        style={{
          scaleX: progress,
          background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))',
        }}
      />

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#050505]/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="text-[11px] font-black uppercase tracking-[0.35em] transition-colors hover:text-amber-400"
          >
            ShowroomTZ <span className="text-white/30">/ Campaigns</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/landing/motion"
              className="hidden items-center gap-2 text-[9px] font-black uppercase tracking-[0.28em] text-white/45 transition-colors hover:text-white sm:inline-flex"
            >
              <Sparkles size={12} /> Motion lab
            </Link>
            <Link
              href="/cars"
              className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-400 transition-colors hover:text-amber-300"
            >
              Full Stock →
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pt-16"
      >
        <WebGLShaderBackground style="aurora" opacity={0.95} />
        <GrainOverlay opacity={0.07} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-[#050505]/70" />
        <OrbitalRings className="absolute -right-32 top-1/2 hidden -translate-y-1/2 opacity-50 lg:block" size={620} />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-20 pt-16 sm:px-8"
        >
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <ScrambleText
              text="SHOWROOMTZ — CAMPAIGNS 2026"
              trigger="mount"
              className="text-[8px] font-black uppercase tracking-[0.42em] text-primary"
            />
          </div>

          <h1 className="text-[17vw] font-black uppercase leading-[0.86] tracking-tighter sm:text-8xl lg:text-[10rem]">
            <SplitReveal
              as="span"
              animateOn="mount"
              type="lines"
              delay={0.1}
              stagger={0.11}
              text="Two Ways"
              className="block"
            />
            <SplitReveal
              as="span"
              animateOn="mount"
              type="lines"
              delay={0.24}
              stagger={0.11}
              text="To Ride."
              className="block text-white/25"
            />
          </h1>

          <p className="mt-8 flex min-h-[1.8rem] items-center text-sm font-black uppercase tracking-[0.3em] text-amber-400 sm:text-base">
            <Typewriter
              phrases={[
                'Buy a verified import.',
                'Lease a corporate fleet.',
                'Track every shilling.',
              ]}
              typingSpeed={46}
              holdTime={2100}
            />
          </p>

          <p className="mt-6 max-w-lg text-sm leading-relaxed text-white/55 sm:text-base">
            Tanzania&apos;s most disciplined vehicle partner, in two acts — a curated luxury
            import collection and a nationwide corporate fleet programme.
          </p>

          <div className="mt-12 grid max-w-2xl grid-cols-2 gap-8 border-t border-white/10 pt-8 sm:grid-cols-4">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
              >
                <p className="text-3xl font-black tracking-tighter text-white sm:text-4xl">
                  <CountUp value={s.value} suffix={s.suffix} duration={1900 + i * 180} />
                </p>
                <p className="mt-1 text-[7px] font-black uppercase tracking-[0.3em] text-white/35">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex" aria-hidden="true">
          <span className="text-[7px] font-black uppercase tracking-[0.4em] text-white/30">Scroll</span>
          <span className="h-10 w-px bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </section>

      {/* ── TICKER ─────────────────────────────────────────────── */}
      <div className="border-y border-white/5 bg-[#070605] py-4">
        <Marquee duration={38} gap="gap-8">
          {TICKER.map((t) => (
            <div key={t} className="flex items-center gap-8">
              <span className="text-[10px] font-black uppercase tracking-[0.34em] text-white/40">{t}</span>
              <span className="text-primary/50">✳</span>
            </div>
          ))}
        </Marquee>
      </div>

      {/* ── CAMPAIGN PORTALS ───────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <SplitReveal
          as="h2"
          type="words"
          text={'Choose your act.'}
          className="mb-12 text-3xl font-black uppercase tracking-tighter text-white/80 sm:text-4xl"
        />

        <div className="space-y-6">
          {CAMPAIGNS.map((c, i) => (
            <motion.div
              key={c.href}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <TiltCard max={4} className="group">
                <SpotlightCard className="overflow-hidden rounded-[2rem] border border-white/8 bg-white/[0.02]">
                  <Link href={c.href} className="grid grid-cols-1 items-stretch gap-0 md:grid-cols-12">
                    {/* copy */}
                    <div className="order-2 flex flex-col justify-between gap-8 p-7 md:order-1 md:col-span-7 md:p-12">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-black tracking-[0.4em] text-white/25">/{c.index}</span>
                          <span className="h-px w-8 bg-white/15" />
                          <p className="text-[9px] font-black uppercase tracking-[0.34em] text-white/40">{c.tag}</p>
                        </div>
                        <h3 className={`text-4xl font-black uppercase leading-[0.9] tracking-tighter transition-colors sm:text-5xl lg:text-6xl ${c.accent}`}>
                          {c.title}
                        </h3>
                        <p className="max-w-md text-sm leading-relaxed text-white/55">{c.text}</p>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/8 pt-5">
                        <span className="text-[8px] font-black uppercase tracking-[0.28em] text-white/30">{c.meta}</span>
                        <MagneticButton strength={0.22}>
                          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/12 transition-all duration-500 group-hover:rotate-45 group-hover:border-transparent group-hover:bg-white group-hover:text-black">
                            <ArrowUpRight className="h-6 w-6" />
                          </span>
                        </MagneticButton>
                      </div>
                    </div>

                    {/* image */}
                    <div className="relative order-1 h-56 overflow-hidden md:order-2 md:col-span-5 md:h-auto md:min-h-[320px]">
                      <Image
                        src={c.image}
                        alt={c.tag}
                        fill
                        sizes="(max-width: 768px) 100vw, 40vw"
                        className="object-cover opacity-60 transition-all duration-1000 ease-out group-hover:scale-110 group-hover:opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent md:bg-gradient-to-r" />
                      <div
                        className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                        style={{ background: `radial-gradient(70% 70% at 70% 50%, ${c.glow} / 0.18, transparent 70%)` }}
                        aria-hidden="true"
                      />
                    </div>
                  </Link>
                </SpotlightCard>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        {/* ── MOTION LAB TEASER ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-20"
        >
          <Link
            href="/landing/motion"
            className="group relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-[2rem] border border-white/8 bg-gradient-to-br from-primary/12 via-transparent to-secondary/10 p-8 transition-colors hover:border-primary/40 sm:flex-row sm:items-center sm:p-12"
          >
            <div className="space-y-3">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-secondary">Behind the curtain</p>
              <h3 className="text-3xl font-black uppercase tracking-tighter sm:text-4xl">
                The Motion Lab
              </h3>
              <p className="max-w-md text-sm leading-relaxed text-white/55">
                Every animation on this site, isolated and playable — WebGL shaders, GLSL noise,
                split-text, scramble, tween.js counters and Anime.js SVG drawing.
              </p>
            </div>
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-white/15 transition-all duration-500 group-hover:rotate-45 group-hover:bg-white group-hover:text-black">
              <ArrowUpRight className="h-7 w-7" />
            </span>
          </Link>
        </motion.div>
      </main>

      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 sm:flex-row sm:px-8">
          <p className="text-[8px] font-bold uppercase tracking-[0.35em] text-white/25">
            © {new Date().getFullYear()} ShowroomTZ · Dar es Salaam
          </p>
          <div className="flex items-center gap-6 text-[8px] font-black uppercase tracking-[0.3em] text-white/40">
            <Link href="/cars" className="transition-colors hover:text-white">Stock</Link>
            <Link href="/showrooms" className="transition-colors hover:text-white">Showrooms</Link>
            <Link href="/contact" className="transition-colors hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

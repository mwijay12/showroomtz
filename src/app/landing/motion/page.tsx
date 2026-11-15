'use client';

/**
 * /landing/motion — the ShowroomTZ Motion Lab.
 *
 * A single page that isolates every animation primitive used across the
 * site so they can be auditioned, tuned and copied:
 *
 *   WebGL/GLSL shaders · split-text · typewriter · scramble · shimmer text
 *   tween.js counters · Anime.js SVG drawing · spinner + skeleton family
 *   tilt / spotlight / magnetic interactions
 *
 * It is also the fastest way to show a client "what the motion stack can do"
 * without shipping a whole campaign page.
 */

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, Github, Sparkles } from 'lucide-react';

import { WebGLShaderBackground, type WebGLStyle } from '@/components/effects/WebGLShaderBackground';
import { GrainOverlay } from '@/components/effects/GrainOverlay';
import { GsapScrollFX } from '@/components/effects/GsapScrollFX';
import { SplitReveal } from '@/components/effects/SplitReveal';
import { ScrambleText } from '@/components/effects/ScrambleText';
import { Typewriter } from '@/components/effects/Typewriter';
import { CountUp } from '@/components/effects/CountUp';
import { DrawMark, SpeedGauge, Sparkline, RouteTrace, OrbitalRings } from '@/components/effects/AnimatedSVG';
import { MagneticButton, SpotlightCard, TiltCard } from '@/components/effects/Interactive';
import { Marquee } from '@/components/effects/Marquee';
import { PremiumSpinner, LoadingRail } from '@/components/ui/premium-spinner';
import { SkeletonCard, SkeletonStat, SkeletonTable, SkeletonText } from '@/components/ui/skeleton';

const SHADERS: { key: WebGLStyle; label: string; note: string }[] = [
  { key: 'aurora', label: 'Aurora', note: 'domain-warped fbm · crimson + gold' },
  { key: 'liquid', label: 'Liquid chrome', note: 'warped specular bands' },
  { key: 'starfield', label: 'Starfield', note: 'procedural stars + nebula' },
];

const LIBS = [
  { name: 'three.js', href: 'https://github.com/mrdoob/three.js', use: 'WebGL/GLSL hero shaders' },
  { name: 'GSAP + SplitText', href: 'https://github.com/greensock/GSAP', use: 'scroll choreography, text splits' },
  { name: 'Anime.js v4', href: 'https://github.com/juliangarnier/anime', use: 'SVG stroke drawing, motion paths' },
  { name: '@tweenjs/tween.js', href: 'https://github.com/tweenjs/tween.js', use: 'number counters, eased values' },
  { name: 'Framer Motion', href: 'https://github.com/motiondivision/motion', use: 'layout, presence, springs' },
  { name: 'Lenis', href: 'https://github.com/darkroomengineering/lenis', use: 'smooth scroll' },
];

function Section({
  kicker,
  title,
  note,
  children,
  id,
}: {
  kicker: string;
  title: string;
  note?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="border-t border-white/5 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-9 max-w-2xl">
          <p className="mb-3 text-[9px] font-black uppercase tracking-[0.4em] text-primary">{kicker}</p>
          <SplitReveal
            as="h2"
            type="words"
            stagger={0.05}
            text={title}
            className="text-3xl font-black uppercase tracking-tighter sm:text-5xl"
          />
          {note && <p className="mt-4 text-sm leading-relaxed text-white/50">{note}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

function Tile({
  children,
  className = '',
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-6 ${className}`}>
      {label && (
        <p className="mb-4 text-[8px] font-black uppercase tracking-[0.3em] text-white/30">{label}</p>
      )}
      {children}
    </div>
  );
}

export default function MotionLabPage() {
  const [shader, setShader] = useState<WebGLStyle>('aurora');
  const [gauge, setGauge] = useState(72);

  return (
    <div className="relative min-h-screen bg-[#050505] text-white antialiased">
      <GsapScrollFX />

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#050505]/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/landing"
            className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-white/60 transition-colors hover:text-white"
          >
            <ArrowLeft size={12} /> Campaigns
          </Link>
          <ScrambleText
            text="MOTION LAB"
            trigger="mount"
            className="text-[9px] font-black uppercase tracking-[0.42em] text-primary"
          />
          <Link
            href="/cars"
            className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-400 transition-colors hover:text-amber-300"
          >
            Stock →
          </Link>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="relative flex min-h-[86svh] flex-col justify-end overflow-hidden pt-24">
        <WebGLShaderBackground style={shader} opacity={1} />
        <GrainOverlay opacity={0.08} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/35 to-transparent" />
        <OrbitalRings className="absolute right-[-15%] top-24 hidden opacity-40 lg:block" size={560} />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-14 sm:px-8">
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
            <Sparkles size={12} className="text-secondary" />
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/60">
              Every effect, isolated
            </span>
          </div>

          <h1 className="text-[16vw] font-black uppercase leading-[0.86] tracking-tighter sm:text-8xl lg:text-[9rem]">
            <SplitReveal
              as="span"
              animateOn="mount"
              type="lines"
              stagger={0.1}
              text="Motion"
              className="block"
            />
            <SplitReveal
              as="span"
              animateOn="mount"
              type="lines"
              delay={0.2}
              stagger={0.1}
              text="Laboratory."
              className="block text-primary italic"
            />
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
            The animation stack behind ShowroomTZ — GLSL shaders, GSAP split-text, Anime.js path
            drawing and tween.js counters, all running live below.
          </p>

          {/* shader switcher */}
          <div className="mt-8 flex flex-wrap gap-2">
            {SHADERS.map((s) => (
              <button
                key={s.key}
                onClick={() => setShader(s.key)}
                className={`rounded-full border px-4 py-2 text-[9px] font-black uppercase tracking-[0.24em] transition-all ${
                  shader === s.key
                    ? 'border-primary bg-primary text-white shadow-[0_10px_30px_-14px_hsl(var(--primary))]'
                    : 'border-white/12 bg-white/5 text-white/55 hover:border-white/30 hover:text-white'
                }`}
                title={s.note}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── TICKER ─────────────────────────────────────────────── */}
      <div className="border-y border-white/5 bg-[#070605] py-4">
        <Marquee duration={36} gap="gap-8">
          {['WEBGL', 'GLSL', 'GSAP', 'SPLITTEXT', 'ANIME.JS', 'TWEEN.JS', 'FRAMER', 'LENIS'].map((t) => (
            <div key={t} className="flex items-center gap-8">
              <span className="text-[10px] font-black uppercase tracking-[0.34em] text-white/40">{t}</span>
              <span className="text-primary/50">/</span>
            </div>
          ))}
        </Marquee>
      </div>

      {/* ── TEXT ───────────────────────────────────────────────── */}
      <Section
        kicker="01 · Type"
        title="Text, alive."
        note="Typewriter cycles value-props; ScrambleText decrypts labels; shimmer and gold gradients animate the fill itself."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Tile label="Typewriter">
            <p className="text-2xl font-black uppercase tracking-tight sm:text-3xl">
              <Typewriter
                phrases={[
                  'Verified imports.',
                  'Duty cleared.',
                  'Delivered nationwide.',
                ]}
                className="text-white"
                cursorClassName="text-primary"
              />
            </p>
            <p className="mt-4 text-[11px] leading-relaxed text-white/40">
              Human-ish jitter · pause on hold · reduced-motion safe
            </p>
          </Tile>

          <Tile label="Scramble — hover to replay">
            <p className="text-2xl font-black uppercase tracking-tight sm:text-3xl">
              <ScrambleText text="DECRYPTING NODE 042" trigger="hover" className="text-primary" />
            </p>
            <p className="mt-4 text-[11px] leading-relaxed text-white/40">
              IntersectionObserver + rAF glyph stream
            </p>
          </Tile>

          <Tile label="Shimmer / gold gradient">
            <div className="space-y-3">
              <p className="text-shimmer text-3xl font-black uppercase tracking-tighter">
                Shimmer fill
              </p>
              <p className="text-gold-gradient text-3xl font-black uppercase tracking-tighter italic">
                Champagne gold
              </p>
            </div>
          </Tile>

          <Tile label="SplitText lines">
            <SplitReveal
              as="p"
              type="lines"
              text={'Each line masks up from below, staggered by 90ms.'}
              stagger={0.12}
              className="text-xl font-black uppercase leading-tight tracking-tight sm:text-2xl"
            />
            <p className="mt-4 text-[11px] leading-relaxed text-white/40">
              GSAP SplitText · `mask: lines` · expo.out
            </p>
          </Tile>
        </div>
      </Section>

      {/* ── NUMBERS ────────────────────────────────────────────── */}
      <Section
        kicker="02 · Numbers"
        title="Counters that land."
        note="One private tween.js Group per counter — a single rAF ticker, eased with Cubic.Out, formatted through Intl."
        id="numbers"
      >
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/5 md:grid-cols-4">
          {[
            { value: 2800, suffix: '+', label: 'Deliveries', decimals: 0 },
            { value: 98, suffix: '%', label: 'Satisfaction', decimals: 0 },
            { value: 4.9, suffix: '★', label: 'Avg. rating', decimals: 1 },
            { value: 48, suffix: 'h', label: 'Delivery setup', decimals: 0 },
          ].map((s, i) => (
            <div key={s.label} className="bg-[#0a0a0a] px-6 py-9 text-center">
              <p className="text-3xl font-black tracking-tighter text-amber-400 sm:text-4xl">
                <CountUp
                  value={s.value}
                  decimals={s.decimals}
                  suffix={s.suffix}
                  duration={1800 + i * 160}
                />
              </p>
              <p className="mt-2 text-[7px] font-black uppercase tracking-[0.3em] text-white/35">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── SVG ────────────────────────────────────────────────── */}
      <Section
        kicker="03 · SVG"
        title="Drawn, not dropped in."
        note="Anime.js v4 normalises every stroke into a single `draw` property, so paths, circles and ticks all self-draw with shared timing."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <Tile label="Monogram draw" className="flex items-center justify-center py-10">
            <DrawMark size={130} className="text-primary" />
          </Tile>

          <Tile label="Gauge — drag to test">
            <div className="flex flex-col items-center gap-3">
              <SpeedGauge value={gauge} label="Fleet readiness" size={170} />
              <input
                type="range"
                min={0}
                max={100}
                value={gauge}
                onChange={(e) => setGauge(Number(e.target.value))}
                className="w-full accent-[hsl(var(--primary))]"
                aria-label="Gauge value"
              />
            </div>
          </Tile>

          <Tile label="Sparkline">
            <div className="flex h-full flex-col justify-center gap-2">
              <Sparkline className="w-full" />
              <p className="text-[8px] font-black uppercase tracking-[0.28em] text-white/35">
                +38% quarter on quarter
              </p>
            </div>
          </Tile>

          <Tile label="Route trace — Anime.js motion path" className="md:col-span-2">
            <RouteTrace className="w-full" />
          </Tile>

          <Tile label="Orbital rings" className="flex items-center justify-center">
            <OrbitalRings size={190} className="opacity-90" />
          </Tile>
        </div>
      </Section>

      {/* ── LOADERS ────────────────────────────────────────────── */}
      <Section
        kicker="04 · Loading"
        title="Never a blank screen."
        note="Brand-tinted shimmer instead of grey pulse, a spinner family for inline waits, and skeletons that mirror the real layout so nothing jumps on hydrate."
        id="loaders"
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Tile label="Spinner family" className="space-y-6">
            <div className="flex items-end justify-around gap-3 text-primary">
              {(['orbit', 'ring', 'dots', 'bars', 'pulse'] as const).map((v) => (
                <div key={v} className="flex flex-col items-center gap-3">
                  <PremiumSpinner variant={v} size="md" />
                  <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/35">{v}</span>
                </div>
              ))}
            </div>
            <LoadingRail />
          </Tile>

          <Tile label="Card skeleton">
            <SkeletonCard />
          </Tile>

          <Tile label="Stat + table skeleton" className="space-y-4">
            <SkeletonStat />
            <SkeletonTable rows={3} columns={3} />
            <SkeletonText lines={2} />
          </Tile>
        </div>
      </Section>

      {/* ── INTERACTION ────────────────────────────────────────── */}
      <Section
        kicker="05 · Interaction"
        title="Pointer choreography."
        note="Spotlight borders track the cursor through CSS variables (no re-renders). Tilt cards add depth; magnetic buttons pull towards the pointer."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <TiltCard max={10} className="group md:col-span-2">
            <SpotlightCard className="rounded-3xl border border-white/8 bg-gradient-to-br from-white/[0.06] to-transparent p-10">
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/30">Tilt + spotlight</p>
              <h3 className="mt-4 text-3xl font-black uppercase tracking-tighter sm:text-4xl">
                Feel the surface.
              </h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/50">
                Move the pointer across this card — the border highlight and inner glow follow,
                and the whole panel tilts on a spring.
              </p>
            </SpotlightCard>
          </TiltCard>

          <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-white/8 bg-white/[0.03] p-10">
            <MagneticButton strength={0.35}>
              <button className="group inline-flex h-14 items-center gap-3 rounded-2xl bg-primary px-8 text-[10px] font-black uppercase tracking-[0.24em] text-white shadow-[0_20px_50px_-20px_hsl(var(--primary))]">
                Magnetic CTA
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </button>
            </MagneticButton>
            <p className="text-center text-[11px] leading-relaxed text-white/40">
              Spring stiffness 220 · damping 18
            </p>
          </div>
        </div>
      </Section>

      {/* ── STACK ──────────────────────────────────────────────── */}
      <Section
        kicker="06 · Stack"
        title="What we build with."
        note="All production-safe and free for commercial use. Full resource list lives in docs/PREMIUM-MOTION-STACK.md."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LIBS.map((l) => (
            <a
              key={l.name}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4 transition-colors hover:border-primary/40"
            >
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white">{l.name}</p>
                <p className="mt-1 text-[10px] text-white/40">{l.use}</p>
              </div>
              <Github size={15} className="shrink-0 text-white/25 transition-colors group-hover:text-primary" />
            </a>
          ))}
        </div>
      </Section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/5 py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,hsl(var(--primary)/0.14),transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-[9px] font-black uppercase tracking-[0.4em] text-secondary">Now hiring pixels</p>
              <h2 className="text-4xl font-black uppercase tracking-tighter sm:text-6xl">
                See it on a real campaign.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <MagneticButton strength={0.16}>
                <Link
                  href="/landing/luxury"
                  className="inline-flex h-14 items-center gap-3 rounded-2xl bg-white px-7 text-[10px] font-black uppercase tracking-[0.24em] text-black"
                >
                  Luxury campaign <ArrowUpRight size={15} />
                </Link>
              </MagneticButton>
              <MagneticButton strength={0.16}>
                <Link
                  href="/landing/corporate"
                  className="inline-flex h-14 items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-7 text-[10px] font-black uppercase tracking-[0.24em] text-white"
                >
                  Corporate fleet <ArrowUpRight size={15} />
                </Link>
              </MagneticButton>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8">
          <p className="text-[8px] font-bold uppercase tracking-[0.35em] text-white/25">
            Motion Lab · ShowroomTZ
          </p>
          <Link href="/auth" className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white">
            Try the login →
          </Link>
        </div>
      </footer>
    </div>
  );
}

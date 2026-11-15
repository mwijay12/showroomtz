'use client';

/**
 * CampaignPage — cinematic landing-page template.
 *
 * Full-bleed WebGL shader hero + GSAP ScrollTrigger reveals, used for the
 * /landing/* marketing campaigns (luxury, corporate fleet).
 * Reads live branding (WhatsApp, company name) from BrandingProvider.
 *
 * Motion stack used here
 *   · GLSL aurora/liquid/starfield hero (three.js, raw shaders)
 *   · SplitText line reveal for the headline (GSAP 3.13+)
 *   · ScrambleText kicker + Typewriter value-props (custom)
 *   · tween.js counters for the stat rail (custom CountUp)
 *   · Anime.js stroke drawing for the delivery route (Anime v4)
 *   · GSAP ScrollTrigger `data-gsap` choreography for everything else
 */

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, BadgeCheck, FileText, MessageCircle,
  ShieldCheck, Star, Truck, Zap, ArrowLeft, MousePointerClick,
} from 'lucide-react';
import { useBranding } from '@/components/providers/BrandingProvider';
import { WebGLShaderBackground, type WebGLStyle } from '@/components/effects/WebGLShaderBackground';
import { GrainOverlay } from '@/components/effects/GrainOverlay';
import { GsapScrollFX } from '@/components/effects/GsapScrollFX';
import { SplitReveal } from '@/components/effects/SplitReveal';
import { ScrambleText } from '@/components/effects/ScrambleText';
import { Typewriter } from '@/components/effects/Typewriter';
import { CountUp } from '@/components/effects/CountUp';
import { RouteTrace, SpeedGauge } from '@/components/effects/AnimatedSVG';
import { SpotlightCard, MagneticButton, TiltCard } from '@/components/effects/Interactive';
import { Marquee } from '@/components/effects/Marquee';
import { SEED_CARS } from '@/lib/showroom-seed';

type BulletIcon = 'shield' | 'truck' | 'file' | 'star' | 'zap' | 'badge';

const BULLET_ICONS: Record<BulletIcon, any> = {
  shield: ShieldCheck,
  truck: Truck,
  file: FileText,
  star: Star,
  zap: Zap,
  badge: BadgeCheck,
};

export interface CampaignBullet {
  icon: BulletIcon;
  title: string;
  text: string;
}

export interface CampaignPageProps {
  kicker: string;
  titleA: string;
  titleB: string;
  intro: string;
  badge: string;
  primaryCta: { label: string; href: string };
  whatsappLabel: string;
  whatsappMessage: string;
  shader: WebGLStyle;
  bullets: CampaignBullet[];
  stats: { value: string; label: string }[];
  featuredIds: string[];
  quote: { text: string; author: string };
}

function formatTzs(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M TZS`;
  return `${new Intl.NumberFormat('en-TZ').format(n)} TZS`;
}

/** Turns "4.9★" / "2 800+" / "48h" into countable pieces. */
function parseStat(raw: string) {
  const match = raw.match(/^([\d.,\s]+)(.*)$/);
  if (!match) return { value: null as number | null, prefix: '', suffix: raw, decimals: 0 };
  const numStr = match[1].replace(/[,\s]/g, '');
  const value = Number(numStr);
  if (!Number.isFinite(value)) return { value: null as number | null, prefix: '', suffix: raw, decimals: 0 };
  return {
    value,
    prefix: '',
    suffix: match[2] ?? '',
    decimals: numStr.includes('.') ? numStr.split('.')[1].length : 0,
  };
}

const TRUST_WORDS = [
  'Duty cleared', 'Auction graded', 'Verified provenance', 'Nationwide delivery',
  'EFD receipts', 'Dealer warranty', 'TRA compliant', 'Concierge handover',
];

export function CampaignPage({
  kicker, titleA, titleB, intro, badge,
  primaryCta, whatsappLabel, whatsappMessage,
  shader, bullets, stats, featuredIds, quote,
}: CampaignPageProps) {
  const { whatsappNumber, companyName } = useBranding();
  const wa = (whatsappNumber || '+255700000000').replace(/[^0-9]/g, '');
  const waHref = `https://wa.me/${wa}?text=${encodeURIComponent(whatsappMessage)}`;

  const featured = featuredIds
    .map(id => SEED_CARS.find(c => c.id === id))
    .filter(Boolean)
    .slice(0, 3) as typeof SEED_CARS;

  /* scroll progress rail */
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });

  /* pointer spotlight for the hero backdrop */
  const heroRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-x-hidden antialiased">
      <GsapScrollFX />

      {/* ── SCROLL PROGRESS ─────────────────────────────────────── */}
      <motion.div
        className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left"
        style={{
          scaleX: progress,
          background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))',
        }}
        aria-hidden="true"
      />

      {/* ── TOPBAR ─────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center font-black text-black text-sm">V</div>
            <div className="leading-none">
              <p className="text-[11px] font-black uppercase tracking-[0.35em] text-white group-hover:text-amber-400 transition-colors">ShowroomTZ</p>
              <p className="text-[7px] font-bold uppercase tracking-[0.5em] text-white/40">Showroom · TZ</p>
            </div>
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={12} /> Main Site
          </Link>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-[100svh] flex flex-col justify-end overflow-hidden">
        <WebGLShaderBackground style={shader} opacity={1} />
        <GrainOverlay opacity={0.08} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/70 via-transparent to-transparent" />

        {/* floating corner telemetry */}
        <div className="absolute right-5 top-24 hidden sm:right-8 lg:block">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="w-[190px] rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-md"
          >
            <SpeedGauge value={92} label="Delivery reliability" size={150} className="text-white" />
          </motion.div>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8 pb-16 pt-28">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-5 py-2"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            <ScrambleText
              text={kicker}
              trigger="mount"
              className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.4em] text-amber-400/90"
            />
          </motion.div>

          <h1 className="text-[16vw] font-black uppercase leading-[0.88] tracking-tighter sm:text-8xl lg:text-[9.5rem]">
            <SplitReveal
              as="span"
              animateOn="mount"
              type="lines"
              text={titleA}
              className="block"
              stagger={0.12}
              duration={1.15}
              delay={0.15}
            />
            <SplitReveal
              as="span"
              animateOn="mount"
              type="lines"
              text={titleB}
              className="block text-primary italic drop-shadow-[0_0_40px_hsl(var(--primary)/0.45)]"
              stagger={0.12}
              duration={1.15}
              delay={0.3}
            />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 max-w-xl text-base sm:text-lg text-white/70 font-medium leading-relaxed"
          >
            {intro}
          </motion.p>

          {/* value-prop typewriter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.95 }}
            className="mt-5 flex items-center gap-3 text-[10px] sm:text-xs font-black uppercase tracking-[0.28em] text-amber-400"
          >
            <span className="h-px w-8 bg-amber-400/50" />
            <Typewriter
              phrases={[
                'Duty cleared before you pay.',
                'Auction sheet on every unit.',
                'Delivered to your gate.',
                'Financing arranged in-house.',
              ]}
              typingSpeed={42}
              holdTime={2200}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <MagneticButton strength={0.18}>
              <Link
                href={primaryCta.href}
                className="group inline-flex h-14 sm:h-16 items-center gap-3 rounded-2xl bg-primary px-8 sm:px-10 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] text-white shadow-[0_20px_60px_-15px_hsl(var(--primary)/0.6)] transition-transform hover:scale-[1.03]"
              >
                {primaryCta.label}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1.5" />
              </Link>
            </MagneticButton>
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex h-14 sm:h-16 items-center gap-3 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md px-8 sm:px-10 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] text-white transition-all hover:border-emerald-400/50 hover:text-emerald-300"
            >
              <MessageCircle size={16} className="transition-transform group-hover:-translate-y-0.5" /> {whatsappLabel}
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-5 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.35em] text-white/35"
          >
            Replies within minutes · Mikocheni, Dar es Salaam
          </motion.p>
        </div>

        {/* scroll cue */}
        {mounted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.4, 1] }}
            transition={{ delay: 1.5, duration: 3, repeat: Infinity }}
            className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex"
            aria-hidden="true"
          >
            <MousePointerClick size={12} className="text-white/40" />
            <span className="text-[7px] font-black uppercase tracking-[0.4em] text-white/30">Scroll</span>
            <span className="h-8 w-px bg-gradient-to-b from-white/40 to-transparent" />
          </motion.div>
        )}
      </section>

      {/* ── TRUST MARQUEE ──────────────────────────────────────── */}
      <div className="relative border-y border-white/5 bg-[#070605] py-5">
        <Marquee duration={42} gap="gap-8">
          {TRUST_WORDS.map((word) => (
            <div key={word} className="flex items-center gap-8">
              <span className="text-[10px] font-black uppercase tracking-[0.35em] text-white/45">{word}</span>
              <span className="text-primary/60">✳</span>
            </div>
          ))}
        </Marquee>
      </div>

      {/* ── FEATURED EDIT ──────────────────────────────────────── */}
      <section className="relative border-t border-white/5 bg-[#050505] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary mb-3">{badge}</p>
              <SplitReveal
                as="h2"
                text={'The Current Edit'}
                className="text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-[0.9]"
                type="words"
                stagger={0.07}
              />
            </div>
            <Link href="/cars" className="hidden sm:inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-amber-400 hover:text-amber-300 transition-colors hover-underline">
              View All Stock <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featured.map((car) => (
              <TiltCard key={car.id} max={6} className="group">
                <SpotlightCard className="rounded-3xl border border-white/8 bg-white/[0.03] transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/40">
                  <Link href={`/cars/${car.id}`} data-gsap="reveal" className="block">
                    <div className="relative h-52 sm:h-60 overflow-hidden rounded-t-3xl">
                      <Image
                        src={car.coverImage || car.images[0]}
                        alt={`${car.year} ${car.make} ${car.model}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
                      <span className="absolute top-4 left-4 rounded-full bg-black/70 backdrop-blur px-3 py-1 text-[8px] font-black uppercase tracking-[0.3em] text-amber-400 border border-amber-400/20">{car.category}</span>
                    </div>
                    <div className="p-6 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[8px] font-bold uppercase tracking-[0.35em] text-white/35">{car.year} · {car.condition}</p>
                          <h3 className="mt-1 text-xl font-black uppercase tracking-tight leading-none">{car.make}<br />{car.model}</h3>
                        </div>
                        <ArrowUpRight size={18} className="text-white/30 transition-all group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                      <div className="flex items-center justify-between border-t border-white/5 pt-4">
                        <span className="text-lg font-black text-amber-400">
                          <CountUp value={car.discountPrice || car.price} duration={1600} prefix="" suffix=" TZS" locale="en-TZ" />
                        </span>
                        <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/35">{car.location}</span>
                      </div>
                    </div>
                  </Link>
                </SpotlightCard>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY SHOWROOMTZ ──────────────────────────────────────────── */}
      <section className="relative border-t border-white/5 py-20 sm:py-28 bg-gradient-to-b from-[#050505] to-[#0b0605]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-14">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary mb-4">Why ShowroomTZ</p>
            <SplitReveal
              as="h2"
              text={'Documentation. Integrity. Delivery.'}
              type="words"
              stagger={0.06}
              className="text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-[0.9]"
            />
            <div data-gsap="reveal" className="mt-8 max-w-sm">
              <RouteTrace className="w-full" />
              <p className="mt-2 text-[8px] font-black uppercase tracking-[0.3em] text-white/35">
                Dar es Salaam · Dodoma · Arusha · Mwanza
              </p>
            </div>
            <blockquote data-gsap="reveal" className="mt-10 border-l-2 border-primary/60 pl-6">
              <p className="text-lg text-white/70 italic leading-relaxed">“{quote.text}”</p>
              <footer className="mt-4 text-[9px] font-black uppercase tracking-[0.35em] text-white/40">{quote.author}</footer>
            </blockquote>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bullets.map((b, i) => {
              const Icon = BULLET_ICONS[b.icon];
              return (
                <SpotlightCard
                  key={b.title}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 transition-colors hover:border-primary/30"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.55, delay: i * 0.07 }}
                    className="space-y-3"
                  >
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">{b.title}</h3>
                    <p className="text-[11px] leading-relaxed text-white/55">{b.text}</p>
                  </motion.div>
                </SpotlightCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── STATS + FINAL CTA ──────────────────────────────────── */}
      <section className="relative border-t border-white/5 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-3xl overflow-hidden border border-white/5">
            {stats.map((s, i) => {
              const parsed = parseStat(s.value);
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="bg-[#0a0a0a] px-6 py-8 text-center"
                >
                  <p className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tighter">
                    {parsed.value !== null ? (
                      <CountUp
                        value={parsed.value}
                        decimals={parsed.decimals}
                        suffix={parsed.suffix}
                        duration={1900 + i * 160}
                      />
                    ) : (
                      s.value
                    )}
                  </p>
                  <p className="mt-2 text-[7px] sm:text-[8px] font-bold uppercase tracking-[0.3em] text-white/40">{s.label}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-16 text-center space-y-8">
            <SplitReveal
              as="h2"
              text={'Ready When You Are.'}
              type="words"
              stagger={0.08}
              className="text-4xl sm:text-7xl font-black uppercase tracking-tighter leading-[0.9]"
            />
            <div className="flex justify-center">
              <MagneticButton strength={0.2}>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex h-16 sm:h-20 items-center gap-4 rounded-3xl bg-emerald-500 px-10 sm:px-14 text-[11px] sm:text-sm font-black uppercase tracking-[0.25em] text-black transition-transform hover:scale-105 shadow-[0_20px_70px_-15px_rgba(16,185,129,0.5)]"
                >
                  <MessageCircle size={20} className="transition-transform group-hover:rotate-12" /> {whatsappLabel}
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1.5" />
                </a>
              </MagneticButton>
            </div>
          </div>
        </div>
      </section>

      {/* ── MINI FOOTER ────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[8px] font-bold uppercase tracking-[0.35em] text-white/30">© {new Date().getFullYear()} {companyName || 'ShowroomTZ'} · Dar es Salaam, Tanzania</p>
          <nav className="flex items-center gap-6 text-[8px] font-black uppercase tracking-[0.3em] text-white/40">
            <Link href="/cars" className="hover:text-white transition-colors">Stock</Link>
            <Link href="/showrooms" className="hover:text-white transition-colors">Showrooms</Link>
            <Link href="/book" className="hover:text-white transition-colors">Test Drive</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

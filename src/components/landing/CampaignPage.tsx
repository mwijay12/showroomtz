'use client';

/**
 * CampaignPage — cinematic landing-page template.
 * Full-bleed WebGL shader hero + GSAP ScrollTrigger reveals,
 * used for the /landing/* marketing campaigns (luxury, corporate fleet).
 * Reads live branding (WhatsApp, company name) from BrandingProvider.
 */

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight, ArrowUpRight, BadgeCheck, FileText, MessageCircle,
  ShieldCheck, Star, Truck, Zap, ArrowLeft,
} from 'lucide-react';
import { useBranding } from '@/components/providers/BrandingProvider';
import { WebGLShaderBackground, type WebGLStyle } from '@/components/effects/WebGLShaderBackground';
import { GrainOverlay } from '@/components/effects/GrainOverlay';
import { GsapScrollFX } from '@/components/effects/GsapScrollFX';
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

  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-x-hidden antialiased">
      <GsapScrollFX />

      {/* ── TOPBAR ─────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center font-black text-black text-sm">V</div>
            <div className="leading-none">
              <p className="text-[11px] font-black uppercase tracking-[0.35em] text-white group-hover:text-amber-400 transition-colors">Volta</p>
              <p className="text-[7px] font-bold uppercase tracking-[0.5em] text-white/40">Showroom · TZ</p>
            </div>
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={12} /> Main Site
          </Link>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="relative min-h-[100svh] flex flex-col justify-end overflow-hidden">
        <WebGLShaderBackground style={shader} opacity={1} />
        <GrainOverlay opacity={0.08} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/70 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8 pb-16 pt-28">
          <div data-gsap="reveal" className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-5 py-2 mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.4em] text-amber-400/90">{kicker}</span>
          </div>

          <h1 data-gsap="reveal" className="font-black uppercase tracking-tighter leading-[0.88] text-[16vw] sm:text-8xl lg:text-[9.5rem]">
            {titleA}<br />
            <span className="text-primary italic drop-shadow-[0_0_40px_hsl(var(--primary)/0.45)]">{titleB}</span>
          </h1>

          <p data-gsap="reveal" className="mt-8 max-w-xl text-base sm:text-lg text-white/70 font-medium leading-relaxed">
            {intro}
          </p>

          <div data-gsap="reveal" className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href={primaryCta.href}
              className="group inline-flex h-14 sm:h-16 items-center gap-3 rounded-2xl bg-primary px-8 sm:px-10 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] text-white shadow-[0_20px_60px_-15px_hsl(var(--primary)/0.6)] transition-transform hover:scale-[1.03]"
            >
              {primaryCta.label}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1.5" />
            </Link>
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-14 sm:h-16 items-center gap-3 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md px-8 sm:px-10 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] text-white transition-all hover:border-emerald-400/50 hover:text-emerald-300"
            >
              <MessageCircle size={16} /> {whatsappLabel}
            </a>
          </div>
          <p className="mt-5 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.35em] text-white/35">Replies within minutes · Mikocheni, Dar es Salaam</p>
        </div>
      </section>

      {/* ── FEATURED EDIT ──────────────────────────────────────── */}
      <section className="relative border-t border-white/5 bg-[#050505] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary mb-3">{badge}</p>
              <h2 data-gsap="reveal" className="text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-[0.9]">The Current<br /><span className="text-white/25">Edit</span></h2>
            </div>
            <Link href="/cars" className="hidden sm:inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-amber-400 hover:text-amber-300 transition-colors">
              View All Stock <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featured.map((car) => (
              <Link
                key={car.id}
                href={`/cars/${car.id}`}
                data-gsap="reveal"
                className="group relative overflow-hidden rounded-3xl border border-white/8 bg-white/[0.03] hover:border-primary/40 transition-all duration-500 hover:-translate-y-1.5"
              >
                <div className="relative h-52 sm:h-60 overflow-hidden">
                  <Image
                    src={car.coverImage || car.images[0]}
                    alt={`${car.year} ${car.make} ${car.model}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
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
                    <span className="text-lg font-black text-amber-400">{formatTzs(car.price)}</span>
                    <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/35">{car.location}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY VOLTA ──────────────────────────────────────────── */}
      <section className="relative border-t border-white/5 py-20 sm:py-28 bg-gradient-to-b from-[#050505] to-[#0b0605]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-14">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary mb-4">Why Volta</p>
            <h2 data-gsap="reveal" className="text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-[0.9]">Documentation.<br />Integrity.<br /><span className="text-primary">Delivery.</span></h2>
            <blockquote data-gsap="reveal" className="mt-10 border-l-2 border-primary/60 pl-6">
              <p className="text-lg text-white/70 italic leading-relaxed">“{quote.text}”</p>
              <footer className="mt-4 text-[9px] font-black uppercase tracking-[0.35em] text-white/40">{quote.author}</footer>
            </blockquote>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bullets.map((b) => {
              const Icon = BULLET_ICONS[b.icon];
              return (
                <div key={b.title} data-gsap="reveal" className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 space-y-3 hover:border-primary/30 transition-colors">
                  <Icon className="h-6 w-6 text-primary" />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">{b.title}</h3>
                  <p className="text-[11px] leading-relaxed text-white/55">{b.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── STATS + FINAL CTA ──────────────────────────────────── */}
      <section className="relative border-t border-white/5 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-3xl overflow-hidden border border-white/5">
            {stats.map((s) => (
              <div key={s.label} className="bg-[#0a0a0a] px-6 py-8 text-center">
                <p className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tighter">{s.value}</p>
                <p className="mt-2 text-[7px] sm:text-[8px] font-bold uppercase tracking-[0.3em] text-white/40">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center space-y-8">
            <h2 data-gsap="reveal" className="text-4xl sm:text-7xl font-black uppercase tracking-tighter leading-[0.9]">Ready When<br /><span className="text-primary italic">You Are.</span></h2>
            <div className="flex justify-center">
              <a
                href={waHref}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex h-16 sm:h-20 items-center gap-4 rounded-3xl bg-emerald-500 px-10 sm:px-14 text-[11px] sm:text-sm font-black uppercase tracking-[0.25em] text-black transition-transform hover:scale-105 shadow-[0_20px_70px_-15px_rgba(16,185,129,0.5)]"
              >
                <MessageCircle size={20} /> {whatsappLabel}
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── MINI FOOTER ────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[8px] font-bold uppercase tracking-[0.35em] text-white/30">© {new Date().getFullYear()} {companyName || 'VoltaShowroom'} · Dar es Salaam, Tanzania</p>
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

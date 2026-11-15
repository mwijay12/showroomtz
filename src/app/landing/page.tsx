import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'ShowroomTZ Campaigns | Curated Experiences — ShowroomTZ Tanzania',
  description: 'The ShowroomTZ Collection luxury import edit and the ShowroomTZ Corporate Fleet programme — Tanzania’s most disciplined vehicle partner, in two acts.',
};

const CAMPAIGNS = [
  {
    href: '/landing/luxury',
    index: '01',
    tag: 'The ShowroomTZ Collection',
    title: 'Drive the Unmistakable.',
    text: 'Duty-cleared auction-graded imports. Land Cruiser, S-Class, Range Rover, LX 600.',
    accent: 'text-primary',
  },
  {
    href: '/landing/corporate',
    index: '02',
    tag: 'ShowroomTZ Corporate Fleet',
    title: 'Move Teams, Not Excuses.',
    text: 'Executive & field fleet leasing — insured, tracked, EFD-compliant billing. Nationwide.',
    accent: 'text-amber-400',
  },
];

export default function LandingIndexPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <header className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between border-b border-white/5">
        <Link href="/" className="text-[11px] font-black uppercase tracking-[0.35em] hover:text-amber-400 transition-colors">ShowroomTZ <span className="text-white/30">/ Campaigns</span></Link>
        <Link href="/cars" className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-400 hover:text-amber-300 transition-colors">Full Stock →</Link>
      </header>

      <main className="mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-24">
        <p className="text-[9px] font-black uppercase tracking-[0.45em] text-primary mb-6">ShowroomTZ — Campaigns</p>
        <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-[0.88]">Two Ways<br /><span className="text-white/20">To Ride.</span></h1>

        <div className="mt-16 divide-y divide-white/8 border-y border-white/8">
          {CAMPAIGNS.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-10 sm:py-14 transition-colors hover:bg-white/[0.02] px-2 sm:px-6"
            >
              <span className="md:col-span-1 text-[10px] font-black text-white/25 tracking-[0.4em]">/{c.index}</span>
              <div className="md:col-span-8 space-y-3">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40">{c.tag}</p>
                <h2 className={`text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-[0.92] transition-colors ${c.accent}`}>{c.title}</h2>
                <p className="text-sm text-white/55 max-w-md leading-relaxed">{c.text}</p>
              </div>
              <div className="md:col-span-3 flex md:justify-end">
                <div className="h-20 w-20 sm:h-28 sm:w-28 rounded-full border border-white/10 flex items-center justify-center transition-all duration-500 group-hover:border-primary group-hover:bg-primary group-hover:rotate-45">
                  <ArrowUpRight className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

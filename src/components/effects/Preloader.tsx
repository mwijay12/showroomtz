'use client';

/**
 * Preloader — the first three seconds of the brand.
 *
 * An alloy wheel spins up, the wordmark locks in, the floor "calibrates" from
 * 000 to 100, then the whole curtain lifts. Shown once per browser session and
 * skipped entirely for reduced-motion users, so it never becomes a tax.
 *
 * It renders nothing on the server: the page HTML is always the real page.
 */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { AlloyWheel } from '@/components/effects/CarParts';

const KEY = 'srz:preloaded:v1';

export function Preloader() {
  const [phase, setPhase] = useState<'idle' | 'active' | 'leaving'>('idle');
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    try {
      if (sessionStorage.getItem(KEY)) return;
    } catch {
      /* private mode — just show it */
    }

    setPhase('active');
    document.documentElement.classList.add('srz-loading');

    const start = performance.now();
    let raf = 0;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      setPct(100);
      window.setTimeout(() => setPhase('leaving'), 240);
      window.setTimeout(() => {
        setPhase('idle');
        document.documentElement.classList.remove('srz-loading');
        try {
          sessionStorage.setItem(KEY, '1');
        } catch {
          /* noop */
        }
      }, 1060);
    };

    const tick = () => {
      const t = performance.now() - start;
      setPct((p) => Math.max(p, Math.min(100, Math.round((t / 1150) * 100))));
      if (t < 1150 || document.readyState !== 'complete') raf = requestAnimationFrame(tick);
      else finish();
    };
    raf = requestAnimationFrame(tick);
    const cap = window.setTimeout(finish, 2600);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(cap);
      document.documentElement.classList.remove('srz-loading');
    };
  }, []);

  return (
    <AnimatePresence>
      {phase !== 'idle' && (
        <motion.div
          key="preloader"
          role="status"
          aria-live="polite"
          aria-label="Loading ShowroomTZ"
          className="fixed inset-0 z-[9998] flex flex-col justify-between overflow-hidden bg-[#070605] px-6 py-8 sm:px-10"
          initial={{ opacity: 1 }}
          animate={phase === 'leaving' ? { y: '-102%' } : { y: 0 }}
          exit={{ y: '-102%' }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* atmosphere */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.5]"
            style={{
              backgroundImage:
                'linear-gradient(to right, hsl(var(--foreground) / 0.05) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground) / 0.05) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
              maskImage: 'radial-gradient(circle at 50% 45%, black 5%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(circle at 50% 45%, black 5%, transparent 70%)',
            }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
            style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.22), transparent 65%)' }}
            aria-hidden="true"
          />

          {/* top line */}
          <div className="relative flex items-center justify-between text-[9px] font-black uppercase tracking-[0.4em] text-white/35">
            <span>ShowroomTZ</span>
            <span className="hidden sm:inline">Dar es Salaam · 6.7924° S</span>
            <span>{String(pct).padStart(3, '0')}</span>
          </div>

          {/* centre */}
          <div className="relative flex flex-col items-center justify-center gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, rotate: -30 }}
              animate={{ opacity: phase === 'leaving' ? 0 : 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="text-secondary"
            >
              <AlloyWheel size={132} speed={4.5} />
            </motion.div>

            <div className="overflow-hidden">
              <motion.h2
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="text-center text-[clamp(2rem,6vw,3.6rem)] font-black uppercase leading-none tracking-[-0.03em] text-white"
              >
                Showroom<span className="text-outline text-primary">TZ</span>
              </motion.h2>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55 }}
              transition={{ delay: 0.35 }}
              className="text-[9px] font-black uppercase tracking-[0.42em] text-white"
            >
              Calibrating the floor
            </motion.p>
          </div>

          {/* bottom rail */}
          <div className="relative">
            <div className="h-[2px] w-full overflow-hidden bg-white/10">
              <motion.div
                className="h-full origin-left bg-gradient-to-r from-primary via-secondary to-primary"
                style={{ width: `${pct}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-[8px] font-black uppercase tracking-[0.32em] text-white/25">
              <span>Verified inventory</span>
              <span>Duty cleared · Delivered</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

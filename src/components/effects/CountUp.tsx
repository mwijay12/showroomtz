'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * CountUp — tween.js driven number animation.
 *
 * Uses @tweenjs/tween.js (v25) with a private Group so multiple counters on
 * a page share one rAF loop and never fight over the global ticker.
 *
 * Formats with Intl so 2 800 becomes "2,800" and 4.9 keeps its decimal.
 */
export function CountUp({
  value,
  from = 0,
  duration = 2100,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
  once = true,
  threshold = 0.4,
  locale = 'en-US',
  separator,
}: {
  value: number;
  from?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  once?: boolean;
  threshold?: number;
  locale?: string;
  /** Optional custom grouping separator, e.g. " " for Swahili-style spacing */
  separator?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(from);
  const started = useRef(false);

  const format = (n: number) => {
    const fixed = Number(n.toFixed(decimals));
    const str = new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(fixed);
    return separator ? str.replace(/,/g, separator) : str;
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value);
      return;
    }

    let group: { update: (t?: number) => void } | null = null;
    let raf = 0;
    let dead = false;

    const start = async () => {
      if (dead) return;
      const { Tween, Group, Easing } = await import('@tweenjs/tween.js');

      const g = new Group();
      group = g;

      const state = { n: from };
      new Tween(state, g)
        .to({ n: value }, duration)
        .easing(Easing.Cubic.Out)
        .onUpdate(() => setDisplay(state.n))
        .onComplete(() => setDisplay(value))
        .start();

      const loop = (time: number) => {
        if (dead) return;
        g.update(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (started.current && once) return;
        started.current = true;
        start();
        if (once) io.disconnect();
      },
      { threshold }
    );

    io.observe(el);

    return () => {
      dead = true;
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      group = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, from, duration, decimals, once, threshold, locale, separator]);

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}
      {format(display)}
      {suffix}
    </span>
  );
}

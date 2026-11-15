'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\<>*#@$%&';

/**
 * ScrambleText — "decryption" reveal.
 *
 * Every character resolves out of a stream of random glyphs, left to right,
 * with the unconsumed tail still flickering. Great for kickers, nav labels
 * and section eyebrows.
 *
 * trigger: 'view' (IntersectionObserver) | 'mount' | 'hover'
 */
export function ScrambleText({
  text,
  className,
  trigger = 'view',
  speed = 42,
  hold = 1400,
  revealPerTick = 1,
  glyphs = GLYPHS,
  as: Tag = 'span',
}: {
  text: string;
  className?: string;
  trigger?: 'view' | 'mount' | 'hover';
  speed?: number;
  hold?: number;
  revealPerTick?: number;
  glyphs?: string;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'div';
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [display, setDisplay] = useState(trigger === 'mount' ? '' : text);
  const raf = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const started = useRef(false);

  const run = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    if (timer.current) clearTimeout(timer.current);

    const chars = Array.from(text);
    const total = chars.length;
    let revealed = 0;
    let last = 0;

    const step = (now: number) => {
      if (now - last >= speed) {
        last = now;
        revealed = Math.min(total, revealed + revealPerTick);

        const out = chars
          .map((ch, i) => {
            if (ch === ' ') return ' ';
            if (i < revealed) return ch;
            return glyphs[Math.floor(Math.random() * glyphs.length)];
          })
          .join('');

        setDisplay(out);
      }

      if (revealed < total) {
        raf.current = requestAnimationFrame(step);
      } else {
        setDisplay(text);
        if (trigger === 'view' || trigger === 'mount') {
          // subtle periodic re-scramble keeps the HUD alive
          timer.current = setTimeout(() => {
            revealed = Math.max(0, Math.floor(total * 0.55));
            raf.current = requestAnimationFrame(step);
          }, hold + Math.random() * 2600);
        }
      }
    };

    raf.current = requestAnimationFrame(step);
  }, [text, speed, revealPerTick, glyphs, hold, trigger]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(text);
      return;
    }

    if (trigger === 'mount') {
      run();
    }

    if (trigger === 'view' && ref.current) {
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            run();
          }
        },
        { threshold: 0.35 }
      );
      io.observe(ref.current);
      return () => io.disconnect();
    }

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [run, trigger, text]);

  return (
    <Tag
      // @ts-expect-error — polymorphic ref across intrinsic tags
      ref={ref}
      className={cn('tabular-nums', className)}
      aria-label={text}
      onMouseEnter={trigger === 'hover' ? run : undefined}
      onFocus={trigger === 'hover' ? run : undefined}
    >
      {display || text}
    </Tag>
  );
}

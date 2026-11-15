'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * SplitReveal — GSAP SplitText line/word/char reveal.
 *
 * The headline is split on the DOM at runtime (GSAP SplitText, now free
 * with GSAP 3.13+), each fragment is masked, then lifted into place with a
 * stagger driven by ScrollTrigger.
 *
 * Fallbacks are deliberate:
 *   · if SplitText fails to load, the text simply renders unanimated
 *   · if the user prefers reduced motion, the split/anim is skipped
 *   · `aria-label` carries the real copy so screen readers read one string
 *
 * GSAP + plugins are imported dynamically so they never enter the server
 * bundle or the initial client chunk of pages that don't use this.
 */
export function SplitReveal({
  text,
  as: Tag = 'h1',
  type = 'lines',
  className,
  stagger = 0.09,
  duration = 1.05,
  delay = 0,
  animateOn = 'scroll',
  start = 'top 82%',
}: {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div' | 'span';
  type?: 'lines' | 'words' | 'chars';
  className?: string;
  stagger?: number;
  duration?: number;
  delay?: number;
  animateOn?: 'scroll' | 'mount';
  start?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const [{ gsap }, { SplitText }, { ScrollTrigger }] = await Promise.all([
          import('gsap'),
          import('gsap/SplitText'),
          import('gsap/ScrollTrigger'),
        ]);
        if (cancelled) return;

        // Line breaks are measured from the DOM, so let the webfont settle
        // first — otherwise SplitText splits against fallback metrics.
        if (document.fonts?.ready) {
          try {
            await document.fonts.ready;
          } catch {
            /* ignore */
          }
        }
        if (cancelled) return;

        gsap.registerPlugin(SplitText, ScrollTrigger);

        const split = new SplitText(el, {
          type: type === 'lines' ? 'lines' : type === 'words' ? 'words' : 'chars',
          mask: type === 'lines' ? 'lines' : undefined,
          linesClass: 'split-line',
          wordsClass: 'split-word',
          charsClass: 'split-char',
        });

        const targets =
          type === 'lines' ? split.lines : type === 'words' ? split.words : split.chars;

        if (!targets?.length) {
          split.revert();
          return;
        }

        gsap.set(targets, { yPercent: 118, opacity: 0 });

        const tween = gsap.to(targets, {
          yPercent: 0,
          opacity: 1,
          duration,
          delay,
          ease: 'expo.out',
          stagger,
          ...(animateOn === 'scroll'
            ? { scrollTrigger: { trigger: el, start, once: true } }
            : {}),
        });

        cleanup = () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          split.revert();
        };
      } catch {
        /* animations are progressive enhancement — never break the page */
      }
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [text, type, stagger, duration, delay, animateOn, start]);

  return (
    <Tag
      // @ts-expect-error — polymorphic ref across intrinsic tags
      ref={ref}
      className={cn('will-change-transform', className)}
      aria-label={text}
    >
      {text}
    </Tag>
  );
}

/**
 * SplitRevealOnce — mount-time variant for above-the-fold heroes where a
 * ScrollTrigger would fire immediately anyway.
 */
export function SplitRevealHero(props: Omit<React.ComponentProps<typeof SplitReveal>, 'animateOn'>) {
  return <SplitReveal {...props} animateOn="mount" />;
}

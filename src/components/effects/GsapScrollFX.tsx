'use client';

/**
 * GsapScrollFX — GSAP ScrollTrigger choreography for premium pages.
 *
 * Declarative attributes consumed anywhere in the subtree:
 *   data-gsap="reveal"  → clip-path + rise reveal when entering viewport
 *   data-gsap="scrub"   → gentle scrub parallax through the viewport
 *   data-gsap="zoom"    → scale 1.15 → 1 scrub (for media frames)
 *
 * Reverts cleanly on unmount / route change. Honours prefers-reduced-motion.
 */

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function GsapScrollFX() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-gsap="reveal"]').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 72, opacity: 0, clipPath: 'inset(14% 0% 14% 0%)' },
          {
            y: 0,
            opacity: 1,
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.15,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          }
        );
      });

      gsap.utils.toArray<HTMLElement>('[data-gsap="scrub"]').forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: -7 },
          {
            yPercent: 7,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 },
          }
        );
      });

      gsap.utils.toArray<HTMLElement>('[data-gsap="zoom"]').forEach((el) => {
        gsap.fromTo(
          el,
          { scale: 1.18 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'center center', scrub: 1.2 },
          }
        );
      });
    });

    // Ensure triggers recalc after fonts/images settle
    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 600);

    return () => {
      window.clearTimeout(refresh);
      ctx.revert();
    };
  }, [pathname]);

  return null;
}

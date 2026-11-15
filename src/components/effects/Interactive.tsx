'use client';

import { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
} from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * SpotlightCard — cursor-tracking border + inner glow.
 *
 * Writes `--mx/--my` custom properties, which the `.spotlight-card` rules in
 * globals.css use to paint a radial highlight on a masked border ring. Zero
 * React re-renders while the pointer moves.
 */
export function SpotlightCard({
  children,
  className,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'article' | 'section' | 'li';
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  }

  const Component = Tag as any;

  return (
    <Component
      ref={ref}
      onMouseMove={onMove}
      className={cn('spotlight-card group relative overflow-hidden', className)}
    >
      <div className="relative z-[1]">{children}</div>
    </Component>
  );
}

/**
 * MagneticButton — the cursor gently drags the button towards it.
 *
 * A spring smooths the pull so it feels weighted rather than glued, and the
 * label counter-moves a fraction for depth. Wraps any element you pass in
 * (Link, button, form submit) without changing its semantics.
 */
export function MagneticButton({
  children,
  className,
  strength = 0.28,
  innerStrength = 0.12,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  innerStrength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const x = useSpring(mx, { stiffness: 220, damping: 18, mass: 0.35 });
  const y = useSpring(my, { stiffness: 220, damping: 18, mass: 0.35 });
  const innerX = useTransform(x, (v) => v * innerStrength * 2);
  const innerY = useTransform(y, (v) => v * innerStrength * 2);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - (r.left + r.width / 2)) * strength);
    my.set((e.clientY - (r.top + r.height / 2)) * strength);
  }

  function reset() {
    mx.set(0);
    my.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x, y }}
      className={cn('inline-flex', className)}
    >
      <motion.div style={{ x: innerX, y: innerY }} className="inline-flex w-full">
        {children}
      </motion.div>
    </motion.div>
  );
}

/**
 * TiltCard — 3D press response on hover.
 *
 * rotateX/rotateY are derived from pointer position; a light follows the
 * cursor via a radial gradient overlay. Pass `max` to soften on mobile.
 */
export function TiltCard({
  children,
  className,
  max = 9,
  glare = true,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  const sx = useSpring(px, { stiffness: 180, damping: 20 });
  const sy = useSpring(py, { stiffness: 180, damping: 20 });

  const rotateX = useTransform(sy, [-0.5, 0.5], [`${max}deg`, `-${max}deg`]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [`-${max}deg`, `${max}deg`]);
  const glareX = useTransform(sx, [-0.5, 0.5], ['15%', '85%']);
  const glareY = useTransform(sy, [-0.5, 0.5], ['10%', '90%']);
  const glareBg = useMotionTemplate`radial-gradient(240px circle at ${glareX} ${glareY}, rgba(255,255,255,0.18), transparent 68%)`;

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }

  function reset() {
    px.set(0);
    py.set(0);
  }

  return (
    // Perspective on the wrapper so the child's rotation reads as depth.
    <div style={{ perspective: 1000 }} className="relative">
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={reset}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className={cn('relative [transform-style:preserve-3d]', className)}
      >
        {children}
        {glare && (
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.45 }}
            className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-soft-light"
            style={{ background: glareBg }}
          />
        )}
      </motion.div>
    </div>
  );
}

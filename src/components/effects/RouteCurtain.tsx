'use client';

/**
 * RouteCurtain — a fast "film wipe" on every client-side navigation.
 *
 * Instead of fading the whole page out (which makes an SPA feel slow and
 * breaks scroll restoration), we sweep a soft light band across the viewport
 * once, with a champagne edge. Total runtime is ~700ms and it never blocks
 * input — the curtain is `pointer-events-none` and purely decorative.
 *
 * Skipped entirely on first paint and for reduced-motion users.
 */

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export function RouteCurtain() {
  const pathname = usePathname();
  const [tick, setTick] = useState(0);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setTick((t) => t + 1);
  }, [pathname]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[95] overflow-hidden" aria-hidden="true">
      <AnimatePresence>
        {tick > 0 && (
          <motion.div
            key={tick}
            initial={{ x: '-110%', opacity: 0 }}
            animate={{ x: '110%', opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              x: { duration: 0.78, ease: [0.76, 0, 0.24, 1] },
              opacity: { duration: 0.2 },
            }}
            onAnimationComplete={() => setTick(0)}
            className="absolute inset-y-[-10%] left-0 w-[120%]"
            style={{
              background:
                'linear-gradient(100deg, transparent 34%, hsl(var(--background) / 0.92) 46%, hsl(var(--background)) 50%, hsl(var(--background) / 0.92) 54%, transparent 66%)',
            }}
          >
            {/* champagne leading edge */}
            <span
              className="absolute inset-y-0 right-[32%] w-[2px]"
              style={{
                background:
                  'linear-gradient(to bottom, transparent, hsl(var(--secondary) / 0.8), transparent)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { cn } from '@/lib/utils';

/**
 * Marquee — infinite horizontal ticker.
 *
 * The track holds the children twice and translates -50%, so the loop is
 * seamless with no JS. Duration scales with content so speed stays constant
 * regardless of how many items you pass. Pauses on hover, freezes for
 * reduced-motion users.
 */
export function Marquee({
  children,
  className,
  itemClassName,
  duration = 38,
  reverse = false,
  fade = true,
  pauseOnHover = true,
  gap = 'gap-10',
}: {
  children: React.ReactNode;
  className?: string;
  itemClassName?: string;
  duration?: number;
  reverse?: boolean;
  fade?: boolean;
  pauseOnHover?: boolean;
  gap?: string;
}) {
  return (
    <div className={cn('group relative w-full overflow-hidden', className)}>
      {fade && (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
        </>
      )}

      <div
        className={cn('marquee-track', gap)}
        style={{
          ['--marquee-duration' as any]: `${duration}s`,
          animationDirection: reverse ? 'reverse' : 'normal',
          animationPlayState: pauseOnHover ? undefined : 'running',
        }}
      >
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className={cn('flex shrink-0 items-center', gap)}
            aria-hidden={copy === 1}
          >
            {Array.isArray(children)
              ? children.map((child, i) => (
                  <div key={i} className={itemClassName}>
                    {child}
                  </div>
                ))
              : (
                <div className={itemClassName}>{children}</div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Typewriter — cinematic typing effect.
 *
 * Cycles through phrases with a human-ish rhythm: types, holds, deletes,
 * types the next. The caret is a real block cursor (`animate-blink`).
 *
 * · reduced-motion users see the first phrase, fully typed, no caret loop
 * · pauses when the tab is hidden so the budget is never wasted
 */
export function Typewriter({
  phrases,
  typingSpeed = 48,
  deletingSpeed = 24,
  holdTime = 1900,
  startDelay = 250,
  loop = true,
  showCursor = true,
  className,
  cursorClassName,
  onPhraseChange,
}: {
  phrases: string[] | string;
  typingSpeed?: number;
  deletingSpeed?: number;
  holdTime?: number;
  startDelay?: number;
  loop?: boolean;
  showCursor?: boolean;
  className?: string;
  cursorClassName?: string;
  onPhraseChange?: (phrase: string, index: number) => void;
}) {
  const list = Array.isArray(phrases) ? phrases : [phrases];
  const [text, setText] = useState('');
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'typing' | 'holding' | 'deleting'>('idle');
  const frame = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced.current) {
      setText(list[0] ?? '');
      setPhase('holding');
    }
  }, [list]);

  useEffect(() => {
    if (reduced.current) return;
    if (typeof document !== 'undefined' && document.hidden) return;

    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      const target = list[index] ?? '';

      if (phase === 'idle') {
        frame.current = setTimeout(() => setPhase('typing'), startDelay);
        return;
      }

      if (phase === 'typing') {
        if (text.length < target.length) {
          // Slight jitter so it feels typed, not printed
          const jitter = typingSpeed * (0.6 + Math.random() * 0.9);
          frame.current = setTimeout(() => {
            setText(target.slice(0, text.length + 1));
          }, jitter);
        } else {
          frame.current = setTimeout(() => setPhase('holding'), holdTime);
        }
        return;
      }

      if (phase === 'holding') {
        const isLast = index === list.length - 1;
        if (!loop && isLast) return;
        setPhase('deleting');
        return;
      }

      if (phase === 'deleting') {
        if (text.length > 0) {
          frame.current = setTimeout(() => {
            setText(target.slice(0, Math.max(0, text.length - 1)));
          }, deletingSpeed);
        } else {
          const next = (index + 1) % list.length;
          setIndex(next);
          onPhraseChange?.(list[next], next);
          setPhase('typing');
        }
      }
    };

    tick();

    return () => {
      cancelled = true;
      if (frame.current) clearTimeout(frame.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, phase, index, list.join('|'), loop]);

  return (
    <span className={cn('inline-flex items-baseline', className)}>
      {/* The animated glyphs are decorative for assistive tech; the first
          phrase is exposed once so the sentence is never lost. */}
      <span aria-hidden="true">{text}</span>
      <span className="sr-only">{list[0]}</span>
      {showCursor && (
        <span
          className={cn('caret', cursorClassName)}
          style={{ background: 'currentColor' }}
          aria-hidden="true"
        />
      )}
    </span>
  );
}

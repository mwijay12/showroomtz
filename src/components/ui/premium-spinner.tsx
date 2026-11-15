"use client"

import { cn } from "@/lib/utils"

/**
 * PremiumSpinner — the house loading spinner family.
 *
 * variants
 *  · orbit  — brand mark at the centre of a two-ring orbital system (default)
 *  · ring   — minimal single arc, inherits `currentColor`
 *  · dots   — three breathing dots, great inline
 *  · bars   — equaliser bars, matches the audio/terminal language
 *  · pulse  — expanding rings, for "waiting on the network"
 *
 * Everything is pure CSS (globals.css keyframes) so it costs no JS frame
 * budget, and gradients/sizes adapt to `currentColor`.
 */

type SpinnerVariant = "orbit" | "ring" | "dots" | "bars" | "pulse"
type SpinnerSize = "xs" | "sm" | "md" | "lg"

const SIZE: Record<SpinnerSize, { box: string; stroke: string; dot: string }> = {
  xs: { box: "h-4 w-4", stroke: "border-[1.5px]", dot: "h-1 w-1" },
  sm: { box: "h-6 w-6", stroke: "border-2", dot: "h-1.5 w-1.5" },
  md: { box: "h-10 w-10", stroke: "border-2", dot: "h-2 w-2" },
  lg: { box: "h-16 w-16", stroke: "border-[3px]", dot: "h-2.5 w-2.5" },
}

export function PremiumSpinner({
  variant = "orbit",
  size = "md",
  className,
  label = "Loading",
}: {
  variant?: SpinnerVariant
  size?: SpinnerSize
  className?: string
  label?: string
}) {
  const s = SIZE[size]

  return (
    <div
      role="status"
      aria-label={label}
      className={cn("inline-flex items-center justify-center", className)}
    >
      {variant === "ring" && (
        <span className={cn("loader-ring", s.box, s.stroke)} />
      )}

      {variant === "orbit" && (
        <span className={cn("relative inline-flex items-center justify-center", s.box)}>
          {/* outer dashed ring */}
          <span
            className="orbit-a absolute inset-0 rounded-full border border-dashed border-primary/45"
            aria-hidden="true"
          />
          {/* inner arc */}
          <span
            className={cn(
              "loader-ring absolute inset-[18%]",
              size === "lg" ? "border-2" : "border-[1.5px]"
            )}
            aria-hidden="true"
          />
          {/* core dot */}
          <span
            className={cn(
              "animate-pulse rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.8)]",
              s.dot
            )}
            aria-hidden="true"
          />
        </span>
      )}

      {variant === "dots" && (
        <span className="flex items-end gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn("rounded-full bg-current", s.dot)}
              style={{
                animation: "bar-bounce 1.1s ease-in-out infinite",
                animationDelay: `${i * 0.14}s`,
              }}
            />
          ))}
        </span>
      )}

      {variant === "bars" && (
        <span
          className={cn(
            "loader-bars flex items-end gap-1 text-current",
            size === "lg" ? "scale-150" : size === "sm" ? "scale-75" : ""
          )}
          aria-hidden="true"
        >
          <span />
          <span />
          <span />
          <span />
          <span />
        </span>
      )}

      {variant === "pulse" && (
        <span className={cn("relative inline-flex items-center justify-center", s.box)} aria-hidden="true">
          {[0, 0.6].map((delay, i) => (
            <span
              key={i}
              className="absolute inset-0 rounded-full border border-primary/50"
              style={{
                animation: "pulse-ring 2s cubic-bezier(0.24, 0.6, 0.36, 1) infinite",
                animationDelay: `${delay}s`,
              }}
            />
          ))}
          <span className="h-1/3 w-1/3 rounded-full bg-primary" />
        </span>
      )}

      <span className="sr-only">{label}</span>
    </div>
  )
}

/** Button-friendly spinner: sized to the label, inherits text colour. */
export function ButtonSpinner({ className }: { className?: string }) {
  return <PremiumSpinner variant="ring" size="xs" className={className} />
}

/** Thin infinite progress rail — use under sticky headers or in cards. */
export function LoadingRail({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative h-[2px] w-full overflow-hidden rounded-full bg-border/70",
        className
      )}
      role="progressbar"
      aria-label="Loading"
    >
      <div
        className="absolute left-0 top-0 h-full w-1/3 rounded-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)",
          animation: "skeleton-sweep 1.6s ease-in-out infinite",
        }}
      />
    </div>
  )
}

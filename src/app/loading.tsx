"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { VoltaLoader } from "@/components/ui/VoltaLoader"

/**
 * Route-level loading screen.
 *
 * A short, cinematic boot sequence: the brand mark inside the orbital
 * loader, a determinate rail that eases towards 92% while the route
 * streams in, and a status line that cycles through the system checks.
 * No full-screen flash — the shell fades in over 300ms.
 */

const BOOT_LINES = [
  "Initialising asset terminal",
  "Authenticating registry node",
  "Loading verified inventory",
  "Composing interface",
];

export default function Loading() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const t = setInterval(
      () => setStep((s) => (s + 1) % BOOT_LINES.length),
      900
    )
    return () => clearInterval(t)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-background"
      role="status"
      aria-live="polite"
    >
      {/* ambient field */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 45% at 50% 42%, hsl(var(--primary) / 0.10), transparent 72%)",
        }}
        aria-hidden="true"
      />

      {/* faint grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(circle at 50% 45%, black 10%, transparent 68%)",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 45%, black 10%, transparent 68%)",
        }}
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-center gap-10">
        <VoltaLoader size="lg" caption={BOOT_LINES[step]} />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-border" />
            <p className="text-[8px] font-black uppercase tracking-[0.5em] text-muted-foreground">
              Elite Fleet Registry
            </p>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-border" />
          </div>

          {/* boot ticks */}
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {BOOT_LINES.map((_, i) => (
              <motion.span
                key={i}
                className="h-1 rounded-full"
                animate={{
                  width: i <= step ? 22 : 6,
                  backgroundColor:
                    i <= step ? "hsl(var(--primary))" : "hsl(var(--border))",
                }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

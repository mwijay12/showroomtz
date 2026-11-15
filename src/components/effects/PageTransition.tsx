"use client"

/**
 * PageTransition — per-route entrance for the public group.
 *
 * Deliberately *not* an `AnimatePresence mode="wait"` wrapper: with the App
 * Router that stalls the incoming route behind the outgoing one and makes
 * navigation feel slow. Instead the new route settles in with a short
 * blur/slide, while the global <RouteCurtain/> handles the wipe.
 */

import { motion } from "framer-motion"
import { usePathname } from "next/navigation"

export function PageTransition({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

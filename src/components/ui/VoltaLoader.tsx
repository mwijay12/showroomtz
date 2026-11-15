'use client';

import { motion } from "framer-motion";
import { ShowroomMark } from "@/components/ui/ShowroomMark";

/**
 * Branded Loading Component for ShowroomTZ.
 * Espresso mark inside a slowly rotating dashed crimson ring.
 */
export function VoltaLoader({ fullPage = false }: { fullPage?: boolean }) {
  const content = (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
          className="h-24 w-24 rounded-[1.9rem] border-2 border-dashed border-primary/40 flex items-center justify-center"
        >
          <ShowroomMark className="h-12 w-12 rounded-2xl shadow-lg" />
        </motion.div>
        <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-secondary animate-ping opacity-60" />
        <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-secondary" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-foreground">
          Showroom<span className="text-primary italic">TZ</span>
        </p>
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-muted-foreground animate-pulse">
          Synchronizing Registry...
        </p>
      </div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-md flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}

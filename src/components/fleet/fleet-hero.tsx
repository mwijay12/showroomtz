'use client';

import { motion } from "framer-motion";
import { Shield, Star, Building2, CheckCircle2 } from "lucide-react";

export function FleetHero() {
  return (
    <section className="relative h-[260px] bg-primary text-white overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.3)_100%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10 text-center space-y-3">
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter uppercase leading-none"
        >
          Showroom <span className="text-secondary italic">Inventory</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-blue-50/60 font-bold uppercase tracking-[0.3em] text-[10px]"
        >
          Verified vehicles from Tanzania's trusted showrooms
        </motion.p>

        <div className="flex flex-wrap justify-center gap-2 pt-4">
          {[
            { icon: <Shield size={10} />, label: "Verified" },
            { icon: <CheckCircle2 size={10} />, label: "Inspected" },
            { icon: <Building2 size={10} />, label: "Showroom" },
            { icon: <Star size={10} />, label: "Premium" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * i + 0.5 }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/20 backdrop-blur-md border border-white/10 text-[9px] font-bold uppercase tracking-widest cursor-default"
            >
              <span className="text-secondary">{stat.icon}</span>
              {stat.label}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

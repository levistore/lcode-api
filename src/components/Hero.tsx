"use client";

import { motion } from "framer-motion";
import { ArrowRight, FileText } from "lucide-react";
import Link from "next/link";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.4, 0, 0.2, 1] as const },
  }),
};

export default function Hero() {
  return (
    <section className="relative pt-[150px] pb-12 px-6 overflow-hidden text-center">
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <div className="mx-auto max-w-4xl relative z-10 space-y-8 flex flex-col items-center">
        
        {/* Badge */}
        <motion.div
          custom={0}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/8 border border-accent/20 text-accent text-xs font-bold font-display uppercase tracking-widest"
        >
          Developer Platform
        </motion.div>

        {/* Headline */}
        <motion.h1
          custom={1}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-[1.08] tracking-tight text-text-primary font-display"
        >
          Build Anything <br />
          with <span className="bg-gradient-to-r from-[#FF8A00] to-[#FF6A00] bg-clip-text text-transparent font-display">Lcode API</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          custom={2}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="text-sm sm:text-base md:text-lg text-text-secondary max-w-xl leading-relaxed font-sans"
        >
          Powerful REST API for AI, Downloader, Image Generation, Tools, Search, Automation, and much more.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          custom={3}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link
            href="/apis"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#FF8A00] to-[#FF6A00] hover:from-[#FF9E22] hover:to-[#FF7C18] text-white font-bold rounded-full transition-all duration-300 shadow-[0_4px_20px_rgba(255,106,0,0.22)] hover:shadow-[0_4px_30px_rgba(255,106,0,0.35)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            Explore API
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/docs"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/15 text-text-primary font-semibold rounded-full transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] backdrop-blur-md cursor-pointer"
          >
            <FileText className="w-4 h-4 text-text-secondary" />
            View Documentation
          </Link>
        </motion.div>

      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Logo from "@/components/Logo";

export default function CtaSection() {
  return (
    <section id="cta" className="relative py-24 md:py-32 px-6 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6 flex justify-center">
            <span className="px-3.5 py-1.5 rounded-full bg-accent/8 border border-accent/20 text-accent text-xs font-bold font-display uppercase tracking-wider">
              Lcode API
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-5 font-display">
            Start Building Today
          </h2>
          <p className="text-text-secondary text-base md:text-lg mb-10 max-w-lg mx-auto leading-relaxed">
            Get your API key in seconds. Free tier includes 1,000 calls per month —
            no credit card required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 premium-btn text-white font-bold rounded-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-base"
            >
              <span>Get Your Free API Key</span>
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>

          <p className="mt-6 text-xs text-text-tertiary">
            No credit card required &middot; Setup in under 2 minutes &middot;
            Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}

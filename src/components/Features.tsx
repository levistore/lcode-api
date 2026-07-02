"use client";

import { motion } from "framer-motion";
import { Sparkles, Download, Settings, Search, Image, Cpu } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
}

const features: Feature[] = [
  {
    icon: Sparkles,
    title: "AI",
    description: "Leverage advanced artificial intelligence endpoints for smart parsing, summaries, and chat completion models.",
    gradient: "from-[#FF8A00]/10 to-[#FF6A00]/10",
  },
  {
    icon: Download,
    title: "Downloader",
    description: "High-speed multi-source download endpoints to capture and stream digital content efficiently.",
    gradient: "from-blue-500/10 to-indigo-500/10",
  },
  {
    icon: Settings,
    title: "Tools",
    description: "A comprehensive toolkit designed to streamline parsing, formatting, and general utility tasks.",
    gradient: "from-purple-500/10 to-pink-500/10",
  },
  {
    icon: Search,
    title: "Search",
    description: "Lightning-fast crawlers and indexers for query retrieval, scrape logs, and catalog lookup APIs.",
    gradient: "from-emerald-500/10 to-teal-500/10",
  },
  {
    icon: Image,
    title: "Image Generator",
    description: "Dynamically generate, convert, scale, and filter custom images with low latency processing engines.",
    gradient: "from-rose-500/10 to-orange-500/10",
  },
  {
    icon: Cpu,
    title: "Automation",
    description: "Schedule trigger events, webhook push notifications, and routine cron workflows seamlessly.",
    gradient: "from-cyan-500/10 to-sky-500/10",
  },
];

const cardVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
  },
};

export default function Features() {
  return (
    <section id="features" className="py-24 md:py-32 px-6 relative">
      <div className="noise-overlay" />
      <div className="mx-auto max-w-7xl relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-accent mb-4 font-display">
            Features
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 font-display">
            Why Developers Choose Lcode API
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto leading-relaxed">
            Everything you need to build, deploy, and scale your applications with confidence.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={cardVariant}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6, scale: 1.015 }}
                className="relative rounded-3xl p-8 transition-all duration-300 shadow-lg premium-glass border border-white/[0.08] hover:border-accent/35 flex flex-col justify-between overflow-hidden"
              >
                {/* Accent gradient glow inside each card */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} pointer-events-none opacity-40`} />
                
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-accent/8 border border-accent/15 flex items-center justify-center mb-6">
                    <Icon className="w-5.5 h-5.5 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-text-primary font-display">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

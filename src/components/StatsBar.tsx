"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Database, Layers, TrendingUp, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Stat {
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
  decimals?: number;
  icon: LucideIcon;
}

const stats: Stat[] = [
  { value: 50, suffix: "+", label: "Total API", icon: Database },
  { value: 6, suffix: "+", label: "Categories", icon: Layers },
  { value: 124.5, suffix: "K+", label: "Today's Requests", decimals: 1, icon: TrendingUp },
  { value: 99.98, suffix: "%", label: "Success Rate", decimals: 2, icon: ShieldCheck },
];

function CountUp({ stat, inView }: { stat: Stat; inView: boolean }) {
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const duration = 1500;
    const steps = 60;
    const increment = stat.value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      current += increment;
      step++;
      if (step >= steps) {
        clearInterval(timer);
        setDisplay(stat.value.toFixed(stat.decimals || 0));
      } else {
        setDisplay(current.toFixed(stat.decimals || 0));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [inView, stat]);

  const Icon = stat.icon;

  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.01 }}
      className="p-6 rounded-3xl premium-glass border border-white/[0.08] shadow-lg flex flex-col justify-between h-full transition-all duration-300 hover:border-accent/40"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-text-secondary font-display">{stat.label}</span>
        <div className="w-8 h-8 rounded-lg bg-accent/8 border border-accent/15 flex items-center justify-center">
          <Icon className="w-4 h-4 text-accent" />
        </div>
      </div>
      <div className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight font-stat">
        {stat.prefix}
        {display}
        {stat.suffix}
      </div>
    </motion.div>
  );
}

export default function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="py-12 px-6 relative"
    >
      <div className="noise-overlay" />
      <div className="mx-auto max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {stats.map((stat) => (
          <CountUp key={stat.label} stat={stat} inView={inView} />
        ))}
      </div>
    </motion.section>
  );
}

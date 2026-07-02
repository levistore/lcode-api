"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Download, Brain, Search, Sparkles, Activity, Palette, Wrench, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

interface PopularApiItem {
  name: string;
  path: string;
  method: string;
  requests: string;
  slug: string;
  categorySlug: string;
  status: string;
}

const getCategoryIcon = (slug: string) => {
  switch (slug) {
    case "ai-apis": return Brain;
    case "canva-apis": return Palette;
    case "downloader-apis": return Download;
    case "search-apis": return Search;
    case "image-apis": return ImageIcon;
    default: return Wrench;
  }
};

const getCategoryGlow = (slug: string) => {
  switch (slug) {
    case "ai-apis": return "from-violet-500/10 to-accent/10";
    case "canva-apis": return "from-cyan-500/10 to-blue-500/10";
    case "downloader-apis": return "from-rose-500/10 to-pink-500/10";
    case "search-apis": return "from-emerald-500/10 to-teal-500/10";
    default: return "from-amber-500/10 to-orange-500/10";
  }
};

export default function PopularApis() {
  const [popularApis, setPopularApis] = useState<PopularApiItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/apis")
      .then((res) => res.json())
      .then((data) => {
        if (data.endpoints) {
          // Sort endpoints by requests descending or take the first 4
          const sorted = [...data.endpoints]
            .sort((a, b) => {
              const reqA = parseInt(a.requests.replace(/\./g, "")) || 0;
              const reqB = parseInt(b.requests.replace(/\./g, "")) || 0;
              return reqB - reqA;
            })
            .slice(0, 4);
          setPopularApis(sorted);
        }
      })
      .catch((err) => console.error("Fetch popular APIs error:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 px-6 relative overflow-hidden">
      <div className="mx-auto max-w-7xl relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-accent mb-3 font-display">
              Trending Now
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight font-display">
              Popular APIs
            </h2>
          </div>
          <Link
            href="/apis"
            className="group inline-flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent-hover mt-4 md:mt-0 transition-colors"
          >
            <span>Explore full catalog</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-10 text-text-tertiary">Loading Popular APIs...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {popularApis.map((api, idx) => {
              const Icon = getCategoryIcon(api.categorySlug);
              const glowClass = getCategoryGlow(api.categorySlug);
              return (
                <motion.div
                  key={api.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  whileHover={{ y: -5 }}
                  className="group relative rounded-2xl p-6 bg-bg-secondary/40 backdrop-blur-xl border border-border hover:border-accent/40 transition-all duration-300 shadow-md flex flex-col justify-between overflow-hidden min-h-[200px]"
                >
                  {/* Glow Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${glowClass} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {api.method}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center text-text-secondary group-hover:text-accent transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-text-primary group-hover:text-accent transition-colors font-display mb-1">
                      {api.name}
                    </h3>
                    <p className="text-xs font-mono text-text-tertiary truncate">
                      {api.path}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/[0.04] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-text-secondary">
                      <Activity className="w-3.5 h-3.5 text-accent" />
                      <span>{api.requests} reqs</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{api.status}</span>
                    </div>
                  </div>

                  {/* Direct Link overlay */}
                  <Link href={`/apis/${api.slug}`} className="absolute inset-0 z-10" aria-label={api.name} />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// Dummy export to bypass remaining lines
const popularApisPlaceholder = [];


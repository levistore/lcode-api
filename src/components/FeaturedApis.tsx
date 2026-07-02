"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Palette,
  Image,
  Wrench,
  Download,
  ArrowUpRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ApiCategory {
  icon: LucideIcon;
  title: string;
  description: string;
  endpointCount: number;
  examples: string[];
  span: string;
  accentFrom: string;
  accentTo: string;
}

const initialCategories: ApiCategory[] = [
  {
    icon: Brain,
    title: "AI APIs",
    description:
      "Leverage powerful AI models for text generation, image recognition, sentiment analysis, and natural language processing.",
    endpointCount: 12,
    examples: ["Chat Completion", "Text-to-Image", "Sentiment Analysis"],
    span: "md:col-span-2 md:row-span-2",
    accentFrom: "from-violet-500/20",
    accentTo: "to-accent/20",
  },
  {
    icon: Palette,
    title: "Canva APIs",
    description:
      "Create, edit, and export design assets programmatically with Canva integration.",
    endpointCount: 8,
    examples: ["Template Render", "Asset Export"],
    span: "md:col-span-1",
    accentFrom: "from-cyan-500/20",
    accentTo: "to-blue-500/20",
  },
  {
    icon: Image,
    title: "Image APIs",
    description:
      "Resize, compress, convert, and apply filters to images on the fly.",
    endpointCount: 10,
    examples: ["Resize", "Compress", "Background Remove"],
    span: "md:col-span-1",
    accentFrom: "from-emerald-500/20",
    accentTo: "to-teal-500/20",
  },
  {
    icon: Wrench,
    title: "Utility APIs",
    description:
      "Everyday tools — URL shorteners, QR generators, IP lookup, and more.",
    endpointCount: 14,
    examples: ["QR Code", "URL Shortener", "IP Geolocation"],
    span: "md:col-span-1",
    accentFrom: "from-amber-500/20",
    accentTo: "to-orange-500/20",
  },
  {
    icon: Download,
    title: "Downloader APIs",
    description:
      "Download media from social platforms — video, audio, and thumbnails.",
    endpointCount: 8,
    examples: ["Video Download", "Audio Extract", "Thumbnail Grab"],
    span: "md:col-span-1",
    accentFrom: "from-rose-500/20",
    accentTo: "to-pink-500/20",
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

import { useEffect, useState } from "react";

export default function FeaturedApis() {
  const [categories, setCategories] = useState<ApiCategory[]>(initialCategories);

  useEffect(() => {
    fetch("/api/apis")
      .then((res) => res.json())
      .then((data) => {
        if (data.endpoints) {
          const counts: Record<string, number> = {};
          data.endpoints.forEach((ep: any) => {
            const catKey = ep.category; // e.g. "AI APIs"
            counts[catKey] = (counts[catKey] || 0) + 1;
          });
          setCategories((prev) =>
            prev.map((cat) => ({
              ...cat,
              endpointCount: counts[cat.title] || 0,
            }))
          );
        }
      })
      .catch((err) => console.error("Featured APIs endpoint counting error:", err));
  }, []);

  return (
    <section id="featured-apis" className="py-24 md:py-32 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-xs font-mono text-accent uppercase tracking-widest mb-4">
            API Catalog
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Featured APIs
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Explore our curated collection of powerful API categories built to
            accelerate your development workflow.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              variants={cardVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.08 }}
              className={`group relative premium-glass rounded-3xl overflow-hidden transition-all duration-300 hover:border-accent/35 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.3)] ${cat.span}`}
            >
              {/* Gradient accent bar at top */}
              <div
                className={`h-[3px] bg-gradient-to-r ${cat.accentFrom} ${cat.accentTo} opacity-70 group-hover:opacity-100 transition-opacity duration-300`}
              />

              <div className="p-8">
                {/* Icon + title row */}
                <div className="flex items-start justify-between mb-6">
                  <div className="w-11 h-11 rounded-xl bg-accent/8 border border-accent/15 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <cat.icon className="w-5.5 h-5.5 text-accent" />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-text-tertiary bg-white/[0.03] border border-white/5 px-2.5 py-0.5 rounded-full">
                    {cat.endpointCount} endpoints
                  </div>
                </div>

                {/* Title + description */}
                <h3 className="text-xl font-bold mb-3 text-text-primary group-hover:text-accent transition-colors duration-200 font-display">
                  {cat.title}
                </h3>
                <p className="text-text-secondary leading-relaxed text-sm mb-6">
                  {cat.description}
                </p>

                {/* Example tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {cat.examples.map((ex) => (
                    <span
                      key={ex}
                      className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-white/[0.02] text-text-secondary border border-white/5"
                    >
                      {ex}
                    </span>
                  ))}
                </div>

                {/* Explore link */}
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-hover transition-colors duration-200 group/link"
                >
                  <span>Explore {cat.title}</span>
                  <ArrowUpRight className="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform duration-200" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

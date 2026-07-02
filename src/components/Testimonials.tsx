"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  company: string;
  quote: string;
  initials: string;
}

const testimonials: Testimonial[] = [
  {
    name: "David Park",
    role: "CTO",
    company: "Streamflow",
    quote:
      "Lcode API reduced our integration time from weeks to hours. The documentation is incredible and the latency is consistently under 30ms.",
    initials: "DP",
  },
  {
    name: "Elena Vasquez",
    role: "Lead Engineer",
    company: "DataPulse",
    quote:
      "We migrated from three separate API providers to Lcode. Better performance, simpler billing, and their support team actually responds.",
    initials: "EV",
  },
  {
    name: "James O'Brien",
    role: "Founder",
    company: "NexaBuild",
    quote:
      "The auto-scaling saved us during our Product Hunt launch. Traffic spiked 40x and Lcode handled it without a single hiccup.",
    initials: "JO",
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

export default function Testimonials() {
  return (
    <section className="py-24 md:py-32 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-xs font-mono text-accent uppercase tracking-widest mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Trusted by Developers
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            See what teams around the world are saying about Lcode API.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              variants={cardVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-bg-secondary border border-white/[0.08] rounded-3xl p-8 transition-all duration-300 hover:border-accent/40 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.3)]"
            >
              <Quote className="w-8 h-8 text-accent/40 mb-5" />
              <p className="text-text-secondary leading-relaxed mb-8 italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-sm font-semibold">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    {t.name}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {t.role} at {t.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

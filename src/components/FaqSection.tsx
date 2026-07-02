"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Apakah paket Free gratis selamanya?",
    a: "Ya! Paket Free gratis digunakan selamanya dengan batas request harian sebesar 100 request/hari dan akses ke endpoint dasar untuk kebutuhan belajar atau prototyping.",
  },
  {
    q: "Bagaimana cara mendapatkan API Key?",
    a: "Silakan daftar akun Lcode API terlebih dahulu melalui tombol register. Setelah masuk ke panel Dashboard, Anda bisa membuat, menyalin, dan mengelola API Key Anda langsung di halaman Account.",
  },
  {
    q: "Bisakah upgrade atau downgrade kapan saja?",
    a: "Tentu saja! Anda dapat melakukan upgrade atau downgrade paket langganan Anda kapan saja melalui dashboard akun Anda secara instan tanpa downtime layanan.",
  },
  {
    q: "Bagaimana jika kuota request paket saya habis?",
    a: "Jika kuota request habis, request berikutnya akan diblokir sementara dengan respon error 429 (Too Many Requests). Anda dapat melakukan upgrade atau menunggu kuota di-reset otomatis pada periode bulanan berikutnya.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section className="py-24 px-6 relative overflow-hidden bg-bg-primary">
      <div className="mx-auto max-w-4xl relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-accent font-display">
            FAQ
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight font-display">
            Frequently Asked Questions
          </h2>
          <p className="text-sm md:text-base text-text-secondary leading-relaxed">
            Semua jawaban atas pertanyaan umum seputar integrasi dan lisensi Lcode API.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border border-white/5 rounded-2xl overflow-hidden bg-white/[0.01] backdrop-blur-xl transition-all duration-300 hover:border-accent/20"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 text-sm md:text-base font-bold text-text-primary hover:bg-bg-secondary/40 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-text-tertiary transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-accent" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-2 text-xs md:text-sm text-text-secondary leading-relaxed border-t border-white/[0.04] bg-[#0A0A0A]/30">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

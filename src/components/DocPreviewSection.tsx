"use client";

import { motion } from "framer-motion";
import { BookOpen, Key, ShieldCheck, Check } from "lucide-react";

const params = [
  { name: "url", type: "string", required: "required", desc: "URL media target dari platform (TikTok/YouTube/Instagram/dll)." },
  { name: "nocache", type: "boolean", required: "optional", desc: "Abaikan cache server dan lakukan scraping langsung." },
];

const mockJsonResponse = `{
  "status": true,
  "result": {
    "title": "Stunning SaaS Animation Demo",
    "author": "Lcode Dev Team",
    "media": {
      "video_url": "https://api.lcode.dev/storage/v_d941a.mp4",
      "audio_url": "https://api.lcode.dev/storage/a_d941a.mp3",
      "thumbnail": "https://api.lcode.dev/storage/t_d941a.jpg"
    },
    "duration": 54,
    "views": "1,248,390"
  }
}`;

export default function DocPreviewSection() {
  return (
    <section className="py-24 px-6 relative overflow-hidden bg-[#0A0A0A]/40">
      <div className="mx-auto max-w-7xl relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-accent font-display">
            Documentation Preview
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight font-display">
            Designed for Developers
          </h2>
          <p className="text-sm md:text-base text-text-secondary leading-relaxed max-w-lg mx-auto">
            Dokumentasi lengkap, intuitif, dan terperinci. Membantu Anda memahami setiap parameter masukan serta keluaran JSON.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Parameters block */}
          <div className="lg:col-span-6 bg-bg-secondary/40 backdrop-blur-xl border border-border rounded-2xl p-6 md:p-8 space-y-6">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2 font-display">
              <Key className="w-5 h-5 text-accent" />
              <span>Query Parameters</span>
            </h3>
            <div className="divide-y divide-white/[0.04] text-xs md:text-sm">
              {params.map((param) => (
                <div key={param.name} className="py-4 first:pt-0 last:pb-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-accent">{param.name}</span>
                      <span className="text-[10px] text-text-tertiary bg-white/[0.03] px-2 py-0.5 rounded font-mono">
                        {param.type}
                      </span>
                    </div>
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${
                      param.required === "required" ? "text-rose-500/80 bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10" : "text-text-tertiary"
                    }`}>
                      {param.required}
                    </span>
                  </div>
                  <p className="text-text-secondary leading-relaxed text-xs">
                    {param.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Response Payload */}
          <div className="lg:col-span-6 bg-bg-secondary/40 backdrop-blur-xl border border-border rounded-2xl overflow-hidden shadow-xl">
            <div className="px-5 py-4 border-b border-border bg-white/[0.01] flex items-center justify-between">
              <span className="text-xs font-bold text-text-secondary font-mono">Response Payload (JSON)</span>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>200 OK</span>
              </div>
            </div>
            <pre className="p-5 font-mono text-xs text-text-primary leading-relaxed overflow-x-auto bg-[#070707] max-h-[360px] scrollbar-thin">
              <code>{mockJsonResponse}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

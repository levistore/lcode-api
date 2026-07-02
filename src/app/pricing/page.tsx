"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Check, 
  HelpCircle, 
  ChevronDown, 
  ArrowRight, 
  Zap, 
  Sparkles, 
  Trophy,
  Wallet
} from "lucide-react";

interface PlanItem {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  popular?: boolean;
  icon: any;
}

const pricingPlans: PlanItem[] = [
  {
    name: "Free Plan",
    price: "Rp0",
    period: "/bulan",
    description: "Sangat cocok untuk memulai prototyping dan proyek pribadi kecil.",
    features: [
      "100 request / hari",
      "Akses Basic APIs",
      "Rate Limit Standard",
      "Dukungan Komunitas",
      "1 API Key"
    ],
    cta: "Get Started",
    href: "/register",
    icon: Zap
  },
  {
    name: "Premium Plan",
    price: "Rp25.000",
    period: "/bulan",
    description: "Untuk pengembang yang membutuhkan kuota lebih besar dan seluruh akses API.",
    features: [
      "10.000 request / hari",
      "Akses Semua API",
      "Kecepatan Lebih Tinggi (Low Latency)",
      "Priority Support (Email/Discord)",
      "3 API Keys"
    ],
    cta: "Upgrade Now",
    href: "/dashboard",
    popular: true,
    icon: Sparkles
  },
  {
    name: "Developer Plan",
    price: "Rp75.000",
    period: "/bulan",
    description: "Batas tanpa kuota untuk integrasi penuh aplikasi skala produksi massal.",
    features: [
      "Unlimited Request",
      "Akses Semua API Premium",
      "Priority Queue (Respon Instan)",
      "Dedicated Support 24/7",
      "Early Access Fitur Baru",
      "Unlimited API Keys"
    ],
    cta: "Upgrade Now",
    href: "/dashboard",
    icon: Trophy
  }
];

const faqs = [
  {
    question: "Bagaimana cara mendapatkan API Key?",
    answer: "Silakan daftar akun Lcode API terlebih dahulu melalui tombol register. Setelah masuk ke panel Dashboard, Anda bisa membuat, menyalin, dan mengelola API Key Anda langsung di halaman Account."
  },
  {
    question: "Apakah paket Free gratis selamanya?",
    answer: "Ya, paket Free gratis digunakan selamanya dengan batas request harian sebesar 100 request/hari dan akses ke endpoint dasar untuk kebutuhan belajar atau prototyping."
  },
  {
    question: "Bisakah upgrade kapan saja?",
    answer: "Tentu saja! Anda dapat melakukan upgrade atau downgrade paket langganan Anda kapan saja melalui dashboard akun Anda secara instan tanpa downtime layanan."
  }
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <>
      <Navbar />

      {/* Decorative Blur Backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[72px] right-1/4 w-96 h-96 rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute top-[600px] left-10 w-80 h-80 rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-6 w-full pt-28 pb-16">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-semibold text-accent uppercase tracking-wider">
            <Wallet className="w-3 h-3 text-accent" />
            <span>Pricing Plans</span>
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-text-primary">
            Choose <span className="text-accent">Your Plan</span>
          </h1>
          <p className="text-text-secondary text-sm md:text-base">
            Pilih paket yang sesuai dengan kebutuhan proyek Anda. Dapatkan performa terbaik untuk aplikasi Anda.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mb-24">
          {pricingPlans.map((plan, idx) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`group relative rounded-2xl p-8 transition-all duration-300 flex flex-col justify-between h-full premium-glass ${
                  plan.popular
                    ? "border-accent/40 shadow-[0_0_32px_rgba(234,88,12,0.08)] md:-translate-y-2"
                    : "border-white/5 hover:border-accent/35 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.3)]"
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-accent text-white text-[10px] font-extrabold tracking-wider rounded-full uppercase">
                    POPULAR
                  </div>
                )}

                {/* Accent top gradient glow bar */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="space-y-6">
                  {/* Icon & Plan Title */}
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-lg bg-bg-tertiary/50 border border-border/60 text-accent">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono text-text-tertiary uppercase">Lcode API</span>
                  </div>

                  {/* Plan pricing detail */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-text-primary group-hover:text-accent transition-colors duration-200">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1 py-2 border-b border-border/60">
                    <span className="text-3xl font-extrabold text-text-primary tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-xs text-text-tertiary">{plan.period}</span>
                  </div>

                  {/* Feature Lists */}
                  <ul className="space-y-3.5 font-sans">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-xs text-text-secondary">
                        <div className={`p-0.5 rounded-full mt-0.5 flex-shrink-0 ${
                          plan.popular ? "bg-accent/15 text-accent" : "bg-emerald-500/10 text-emerald-400"
                        }`}>
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="leading-normal">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <div className="pt-8 mt-auto">
                  <Link
                    href={plan.href}
                    className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
                      plan.popular
                        ? "bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/25"
                        : "border border-border/80 text-text-primary hover:border-accent/40 hover:bg-accent/5"
                    }`}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-24 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-text-primary flex items-center justify-center gap-2">
              <HelpCircle className="w-5 h-5 text-accent" />
              <span>Frequently Asked Questions</span>
            </h2>
            <p className="text-xs text-text-secondary">
              Pertanyaan umum seputar paket layanan Lcode API.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="border border-white/5 rounded-xl overflow-hidden bg-white/[0.01] backdrop-blur-md transition-colors duration-200"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left gap-4 text-sm font-semibold text-text-primary hover:bg-bg-secondary/40 transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 text-text-tertiary transition-transform duration-300 flex-shrink-0 ${
                      isOpen ? "rotate-180 text-accent" : ""
                    }`} />
                  </button>
                  
                  {/* Animating Accordion Body */}
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? "max-h-40 border-t border-border/40" : "max-h-0"
                    }`}
                  >
                    <div className="p-5 text-xs text-text-secondary leading-relaxed bg-[#0C0C0C]/50">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* bottom CTA Banner */}
        <div className="relative rounded-3xl p-8 md:p-12 overflow-hidden premium-glass max-w-4xl mx-auto text-center space-y-6 shadow-2xl">
          {/* Internal gradient decoration */}
          <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-accent/5 blur-[80px] pointer-events-none -z-10" />
          
          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
              Ready to Build with <span className="text-accent">Lcode API?</span>
            </h2>
            <p className="text-text-secondary text-xs md:text-sm max-w-md mx-auto leading-relaxed">
              Mulai integrasikan layanan API berkecepatan tinggi dengan mudah sekarang. Daftar gratis untuk mendapatkan API Key Anda.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-3 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl transition-all duration-200 hover:scale-[1.01] flex items-center justify-center gap-1.5 shadow-lg shadow-accent/20"
            >
              <span>Get API Key</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/docs"
              className="w-full sm:w-auto px-6 py-3 border border-border/80 hover:border-accent/40 hover:bg-accent/5 text-text-primary text-xs font-bold rounded-xl transition-all duration-200 hover:scale-[1.01] flex items-center justify-center"
            >
              View Documentation
            </Link>
          </div>
        </div>

      </main>

      <Footer />
    </>
  );
}

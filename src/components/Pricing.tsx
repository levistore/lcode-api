"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

const plans: Plan[] = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for prototyping and personal projects.",
    features: [
      "1,000 API calls / month",
      "5 endpoints access",
      "Community support",
      "Basic analytics",
      "1 API key",
    ],
    cta: "Start Free",
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    description: "For growing teams shipping production applications.",
    features: [
      "100,000 API calls / month",
      "All endpoints access",
      "Priority support",
      "Advanced analytics",
      "10 API keys",
      "Webhooks",
      "Custom rate limits",
    ],
    cta: "Get Started",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For organizations with mission-critical requirements.",
    features: [
      "Unlimited API calls",
      "All endpoints + priority routing",
      "24/7 dedicated support",
      "Real-time analytics + SLA",
      "Unlimited API keys",
      "Custom webhooks",
      "SSO / SAML",
      "On-premise option",
    ],
    cta: "Contact Sales",
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

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 md:py-32 px-6">
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
            Pricing
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Start free and scale as you grow. No hidden fees, no surprises.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              variants={cardVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] premium-glass ${
                plan.highlighted
                  ? "border-accent/40 shadow-[0_0_40px_rgba(234,88,12,0.06)] md:-mt-4 md:mb-[-16px]"
                  : "border-white/[0.08] hover:border-accent/40"
              }`}
            >
              {/* Popular badge */}
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-white text-xs font-bold rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-text-primary mb-1.5 font-display">
                  {plan.name}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">{plan.description}</p>
              </div>

              <div className="mb-8 flex items-baseline gap-1 py-3 border-b border-white/5">
                <span className="text-4xl font-extrabold text-text-primary font-display">
                  {plan.price}
                </span>
                <span className="text-text-tertiary text-xs">{plan.period}</span>
              </div>

              <ul className="flex flex-col gap-3.5 mb-8">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-3">
                    <Check
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        plan.highlighted ? "text-accent" : "text-success"
                      }`}
                    />
                    <span className="text-sm text-text-secondary leading-normal">{feat}</span>
                  </li>
                ))}
              </ul>

              <a
                href="/register"
                className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                  plan.highlighted
                    ? "premium-btn text-white"
                    : "border border-white/[0.08] hover:border-accent/40 text-text-primary hover:bg-accent/5"
                }`}
              >
                <span>{plan.cta}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-error/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md text-center"
      >
        {/* Shield Icon */}
        <div className="w-16 h-16 rounded-2xl bg-error/10 border border-error/20 flex items-center justify-center text-error mx-auto mb-6 shadow-[0_0_24px_rgba(239,68,68,0.15)]">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* 403 status code */}
        <h1 className="text-8xl font-black tracking-tight text-error/30 font-mono mb-2">
          403
        </h1>

        <h2 className="text-2xl font-bold text-text-primary mb-3">
          Access Denied
        </h2>

        <p className="text-sm text-text-secondary leading-relaxed mb-8 max-w-sm mx-auto">
          You do not have the required administrative permissions to access the requested Super Admin dashboard.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-5 py-3 border border-border bg-bg-secondary hover:bg-bg-tertiary text-text-primary text-sm font-semibold rounded-xl transition-all"
          >
            <Home className="w-4 h-4" />
            Go to Home
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-5 py-3 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl transition-all shadow-[0_0_16px_rgba(234,88,12,0.15)] animate-pulse"
          >
            <ArrowLeft className="w-4 h-4" />
            User Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

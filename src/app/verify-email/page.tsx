"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => {
        if (res.ok) setStatus("success");
        else setStatus("error");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md text-center"
      >
        <Link href="/" className="flex items-center justify-center gap-2 mb-12">
          <span className="text-lg font-extrabold text-text-primary tracking-tight font-display">
            Lcode <span className="text-accent font-display">API</span>
          </span>
        </Link>

        <div className="premium-glass rounded-3xl p-10 shadow-2xl">
          {status === "loading" && (
            <>
              <Loader2 className="w-14 h-14 text-accent animate-spin mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                Verifying your email...
              </h1>
              <p className="text-text-secondary text-sm">
                Please wait while we confirm your email address.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                Email Verified!
              </h1>
              <p className="text-text-secondary text-sm mb-8">
                Your email has been confirmed. You can now use all features of Lcode API.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 premium-btn text-white font-semibold rounded-full transition-all duration-200"
              >
                Go to Dashboard
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-full bg-error/10 border border-error/20 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-error" />
              </div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                Verification Failed
              </h1>
              <p className="text-text-secondary text-sm mb-8">
                This link is invalid or has expired. Please request a new verification email.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-accent hover:text-accent-hover font-medium text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

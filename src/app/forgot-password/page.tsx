"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations";
import { AuthLayout, Input, SubmitButton } from "@/components/AuthLayout";
import { Toaster, toast } from "sonner";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      setSent(true);
      toast.success("Reset link sent! Check your email.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster theme="dark" position="top-center" />
      <AuthLayout
        title="Forgot password?"
        subtitle="Enter your email and we'll send you a reset link"
        footer={
          <p className="text-sm text-text-tertiary">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-accent hover:text-accent-hover font-medium transition-colors"
            >
              Log in
            </Link>
          </p>
        }
      >
        {sent ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-7 h-7 text-success" />
            </div>
            <p className="text-text-secondary text-sm">
              If an account with that email exists, a password reset link has been
              sent. Check your inbox and spam folder.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register("email")}
            />
            <SubmitButton loading={loading}>Send Reset Link</SubmitButton>
          </form>
        )}
      </AuthLayout>
    </>
  );
}

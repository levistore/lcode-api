"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, CheckCircle } from "lucide-react";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations";
import { AuthLayout, Input, SubmitButton } from "@/components/AuthLayout";
import { Toaster, toast } from "sonner";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) {
      toast.error("Invalid reset link");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Reset failed");
        return;
      }

      toast.success("Password reset! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout
        title="Invalid Link"
        subtitle="This password reset link is invalid or has expired"
      >
        <div className="text-center py-4">
          <Link
            href="/forgot-password"
            className="text-accent hover:text-accent-hover font-medium text-sm transition-colors"
          >
            Request a new reset link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <>
      <Toaster theme="dark" position="top-center" />
      <AuthLayout
        title="Reset your password"
        subtitle="Enter your new password below"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="New Password"
            type="password"
            placeholder="Min. 8 characters"
            icon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register("password")}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            icon={<CheckCircle className="w-4 h-4" />}
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
          <SubmitButton loading={loading}>Reset Password</SubmitButton>
        </form>
      </AuthLayout>
    </>
  );
}

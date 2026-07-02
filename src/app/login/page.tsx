"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { AuthLayout, Input, SubmitButton } from "@/components/AuthLayout";
import { Toaster, toast } from "sonner";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Login failed");
        return;
      }

      toast.success("Logged in successfully");
      router.push(redirect);
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
        title="Welcome back"
        subtitle="Log in to your Lcode API account"
        footer={
          <p className="text-sm text-text-tertiary">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-accent hover:text-accent-hover font-medium transition-colors"
            >
              Create one
            </Link>
          </p>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            icon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            icon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register("password")}
          />

          <div className="flex justify-end mt-1">
            <Link
              href="/forgot-password"
              className="text-xs text-accent hover:text-accent-hover transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <SubmitButton loading={loading}>Log In</SubmitButton>
        </form>
      </AuthLayout>
    </>
  );
}

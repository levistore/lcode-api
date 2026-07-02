"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Lock } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { AuthLayout, Input, SubmitButton } from "@/components/AuthLayout";
import { Toaster, toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Registration failed");
        return;
      }

      toast.success("Account created! Check your email to verify.");
      router.push("/dashboard");
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
        title="Create your account"
        subtitle="Get started with Lcode API in minutes"
        footer={
          <p className="text-sm text-text-tertiary">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-accent hover:text-accent-hover font-medium transition-colors"
            >
              Log in
            </Link>
          </p>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            icon={<User className="w-4 h-4" />}
            error={errors.name?.message}
            {...register("name")}
          />
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
            placeholder="Min. 8 characters"
            icon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register("password")}
          />

          <p className="text-xs text-text-tertiary mt-2">
            Password must contain at least one uppercase letter and one number.
          </p>

          <SubmitButton loading={loading}>Create Account</SubmitButton>
        </form>
      </AuthLayout>
    </>
  );
}

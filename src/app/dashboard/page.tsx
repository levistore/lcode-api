"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Key,
  BarChart,
  Settings,
  LogOut,
  ArrowLeft,
  Loader2,
  Shield,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import Logo from "@/components/Logo";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: string | null;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else {
          router.push("/login");
        }
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Logged out");
      router.push("/");
    } catch {
      toast.error("Logout failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <Toaster theme="dark" position="top-center" />
      <div className="min-h-screen bg-bg-primary">
        {/* Header */}
        <header className="border-b border-border bg-bg-primary/80 backdrop-blur-xl sticky top-0 z-40">
          <div className="mx-auto max-w-7xl px-6 flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-base font-extrabold text-text-primary font-display select-none">
                Lcode <span className="text-accent font-display">API</span>
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-xs font-semibold">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>
                <span className="text-sm text-text-secondary hidden sm:block">
                  {user.name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-text-tertiary hover:text-text-primary transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto max-w-7xl px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-secondary transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>

            <div className="mb-10">
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                Dashboard
              </h1>
              <p className="text-text-secondary">
                Welcome back, {user.name}. Manage your API keys and monitor usage.
              </p>
            </div>

            {/* Status banner */}
            {!user.emailVerified && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-8 flex items-center gap-3">
                <Shield className="w-5 h-5 text-amber-400 shrink-0" />
                <p className="text-sm text-amber-200">
                  Please verify your email address to unlock all features.
                </p>
              </div>
            )}

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  icon: Key,
                  title: "API Keys",
                  description: "Generate and manage your API keys",
                  action: "Manage Keys",
                  href: "/account#api-keys",
                },
                {
                  icon: BarChart,
                  title: "Usage Analytics",
                  description: "Monitor your API calls and performance",
                  action: "View Analytics",
                  href: "/account#statistics",
                },
                {
                  icon: Settings,
                  title: "Account Settings",
                  description: "Update your profile and preferences",
                  action: "Edit Settings",
                  href: "/account#profile",
                },
              ].map((card) => (
                <Link
                  key={card.title}
                  href={card.href}
                  className="group premium-glass rounded-3xl p-6 transition-all duration-300 hover:border-accent/35 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.3)] block cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <card.icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    {card.title}
                  </h3>
                  <p className="text-sm text-text-secondary mb-4">
                    {card.description}
                  </p>
                  <span className="text-sm font-medium text-accent group-hover:text-accent-hover transition-colors inline-flex items-center">
                    {card.action} &rarr;
                  </span>
                </Link>
              ))}
            </div>

            {/* User info */}
            <div className="mt-10 premium-glass rounded-3xl p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Account Info
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-text-tertiary">Name</span>
                  <p className="text-text-primary">{user.name}</p>
                </div>
                <div>
                  <span className="text-text-tertiary">Email</span>
                  <p className="text-text-primary">
                    {user.email}
                    {user.emailVerified ? (
                      <span className="ml-2 text-xs text-success font-mono">verified</span>
                    ) : (
                      <span className="ml-2 text-xs text-amber-400 font-mono">pending</span>
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-text-tertiary">Role</span>
                  <p className="text-text-primary font-mono">{user.role}</p>
                </div>
                <div>
                  <span className="text-text-tertiary">Member since</span>
                  <p className="text-text-primary">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  );
}

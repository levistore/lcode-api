"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap, LogOut, LayoutDashboard, ShieldCheck, Bell, Sun, Moon } from "lucide-react";
import Logo from "@/components/Logo";
import { useTheme } from "@/context/ThemeContext";

const desktopLinks = [
  { label: "Home", href: "/" },
  { label: "Docs", href: "/docs" },
  { label: "APIs", href: "/apis" },
  { label: "Top 10", href: "/leaderboard" },
  { label: "Pricing", href: "/pricing" },
];

const tabletLinks = [
  { label: "Home", href: "/" },
  { label: "Docs", href: "/docs" },
  { label: "APIs", href: "/apis" },
  { label: "Pricing", href: "/pricing" },
];

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    setMobileOpen(false);
  };

  const themeToggle = (
    <button
      onClick={toggleTheme}
      className="p-1.5 rounded-full border border-border bg-bg-tertiary hover:bg-bg-tertiary/80 text-text-secondary hover:text-text-primary transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 w-8 h-8"
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {!mounted ? (
        <div className="w-4 h-4" />
      ) : theme === "dark" ? (
        <Sun className="w-4 h-4 text-amber-500" />
      ) : (
        <Moon className="w-4 h-4 text-violet-600" />
      )}
    </button>
  );

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-4 left-0 right-0 mx-auto z-50 w-[calc(100%-48px)] max-w-[1280px] h-16 rounded-full bg-bg-secondary/40 backdrop-blur-xl border border-border shadow-[0_8px_30px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] flex items-center transition-all duration-300"
      >
        <div className="w-full px-6 flex items-center justify-between gap-4">
          {/* Brand Logo (Left Side - all views) */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <span className="text-base font-extrabold text-text-primary tracking-tight font-display flex items-center gap-1 select-none">
              Lcode <span className="bg-gradient-to-r from-accent to-amber-500 bg-clip-text text-transparent font-display">API</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent font-bold uppercase tracking-wider scale-90">v2</span>
            </span>
          </Link>

          {/* ====== 1. DESKTOP VIEW (>= 1024px) ====== */}
          {/* Tengah: Navigation Menu */}
          <div className="hidden lg:flex items-center gap-6">
            {desktopLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs text-text-secondary hover:text-text-primary transition-colors duration-200 font-medium tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Kanan: Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {themeToggle}
            {loaded ? (
              user ? (
                <>
                  <button className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-bg-tertiary border border-transparent hover:border-border text-text-secondary hover:text-text-primary transition-all duration-200 relative cursor-pointer shrink-0">
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  </button>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-text-secondary hover:text-text-primary text-xs font-semibold transition-colors duration-200 shrink-0"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  {user.role === "SUPER_ADMIN" && (
                    <Link
                      href="/admin"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-accent hover:text-accent-hover text-xs font-semibold transition-colors duration-200 shrink-0"
                    >
                      <ShieldCheck className="w-4 h-4 text-accent" />
                      Admin
                    </Link>
                  )}
                  <Link
                    href="/account"
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-amber-500 flex items-center justify-center text-white text-xs font-bold border border-border hover:scale-[1.05] transition-transform duration-200 shrink-0 font-sans"
                  >
                    {user.name[0]?.toUpperCase() || "U"}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-border hover:bg-bg-tertiary text-text-primary text-xs font-semibold rounded-full transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer shrink-0"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="inline-flex items-center px-3 py-1.5 text-text-secondary hover:text-text-primary text-xs font-semibold transition-colors duration-200 font-sans"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center px-4 py-1.5 premium-btn text-white text-xs font-bold rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Get API Key
                  </Link>
                </>
              )
            ) : (
              <div className="w-[100px]" />
            )}
          </div>


          {/* ====== 2. TABLET VIEW (768px - 1023px) ====== */}
          {/* Tengah: Navigation Ringkas */}
          <div className="hidden md:flex lg:hidden items-center gap-4">
            {tabletLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs text-text-secondary hover:text-text-primary transition-colors duration-200 font-medium tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Kanan: Avatar + Hamburger */}
          <div className="hidden md:flex lg:hidden items-center gap-3">
            {themeToggle}
            {loaded && user && (
              <Link
                href="/account"
                className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-amber-500 flex items-center justify-center text-white text-xs font-bold border border-border hover:scale-[1.05] transition-transform duration-200 shrink-0 font-sans"
              >
                {user.name[0]?.toUpperCase() || "U"}
              </Link>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-1.5 text-text-secondary hover:text-text-primary transition-colors cursor-pointer border border-border hover:border-border/80 rounded-full bg-bg-tertiary"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>


          {/* ====== 3. MOBILE VIEW (< 768px) ====== */}
          {/* Kanan: Hamburger Saja */}
          <div className="flex md:hidden items-center gap-3">
            {themeToggle}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-1.5 text-text-secondary hover:text-text-primary transition-colors cursor-pointer border border-border hover:border-border/80 rounded-full bg-bg-tertiary"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </motion.nav>

      {/* Responsive Drawer Overlay (< 1024px) */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed top-20 left-0 right-0 mx-auto z-40 w-[calc(100%-48px)] max-w-[1280px] bg-bg-primary/95 backdrop-blur-2xl border border-border rounded-3xl p-6 flex flex-col gap-6 shadow-[0_20px_40px_rgba(0,0,0,0.5)] lg:hidden"
          >
            <div className="flex flex-col gap-4">
              {desktopLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-lg font-bold text-text-secondary hover:text-text-primary transition-colors font-display block py-1"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {user ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: desktopLinks.length * 0.05 }}
                  >
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="text-lg font-bold text-text-secondary hover:text-text-primary transition-colors font-display block py-1"
                    >
                      Dashboard
                    </Link>
                  </motion.div>
                  {user.role === "SUPER_ADMIN" && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (desktopLinks.length + 0.5) * 0.05 }}
                    >
                      <Link
                        href="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="text-lg font-bold text-accent hover:text-accent-hover transition-colors flex items-center gap-2 font-display py-1"
                      >
                        <ShieldCheck className="w-5 h-5 text-accent" />
                        Admin Panel
                      </Link>
                    </motion.div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (desktopLinks.length + 1) * 0.05 }}
                  >
                    <Link
                      href="/account"
                      onClick={() => setMobileOpen(false)}
                      className="text-lg font-bold text-text-secondary hover:text-text-primary transition-colors font-display block py-1"
                    >
                      Profile & Account
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (desktopLinks.length + 1.5) * 0.05 }}
                  >
                    <button
                      onClick={handleLogout}
                      className="mt-2 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-border hover:bg-bg-tertiary text-text-primary text-xs font-semibold rounded-full transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Logout
                    </button>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: desktopLinks.length * 0.05 }}
                  >
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="text-lg font-bold text-text-secondary hover:text-text-primary transition-colors font-display block py-1"
                    >
                      Login
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (desktopLinks.length + 1) * 0.05 }}
                  >
                    <Link
                      href="/register"
                      onClick={() => setMobileOpen(false)}
                      className="mt-2 w-full inline-flex items-center justify-center px-4 py-2.5 premium-btn text-white text-xs font-semibold rounded-full transition-all"
                    >
                      Get API Key
                    </Link>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

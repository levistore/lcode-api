"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, BookOpen, Key, Trophy, UserRound, Wallet } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const NAV_ITEMS = [
  { name: "Home", href: "/", icon: Home },
  { name: "Docs", href: "/docs", icon: BookOpen },
  { name: "APIs", href: "/apis", icon: Key },
  { name: "Top 10", href: "/leaderboard", icon: Trophy },
  { name: "Account", href: "/account", icon: UserRound },
  { name: "Pricing", href: "/pricing", icon: Wallet },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  // Avoid hydration mismatch by rendering only after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const authPaths = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email"
  ];
  const isAuthPage = authPaths.some((path) => pathname === path || pathname.startsWith(path + "/"));
  const isAdminPage = pathname ? pathname.startsWith("/admin") : false;

  if (isAuthPage || isAdminPage) {
    return null;
  }

  if (!mounted) {
    return <div className="h-24 md:hidden shrink-0" />;
  }

  const isLight = theme === "light";

  return (
    <>
      <div 
        className="fixed left-1/2 z-50 flex items-center justify-center md:hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "90%",
          maxWidth: "400px",
          height: "64px",
          borderRadius: "999px",
          backdropFilter: "blur(30px) saturate(180%)",
          backgroundColor: isLight ? "rgba(255, 255, 255, 0.7)" : "rgba(8, 8, 8, 0.5)",
          border: isLight ? "1px solid rgba(0, 0, 0, 0.08)" : "1px solid rgba(255, 255, 255, 0.08)",
          boxSizing: "border-box",
          overflow: "hidden",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <nav 
          className="flex items-center justify-around w-full h-full px-2"
          style={{
            boxSizing: "border-box",
          }}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className="relative flex flex-col items-center justify-center flex-1 h-full select-none"
                style={{ minWidth: 0 }}
                aria-label={item.name}
              >
                <motion.div
                  className="flex flex-col items-center justify-center relative z-10 w-full max-w-[54px] h-[48px] rounded-full py-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-pill-floating"
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: "rgba(255, 106, 0, 0.12)",
                        border: "1px solid rgba(255, 106, 0, 0.2)",
                        boxShadow: "0 2px 8px rgba(255, 106, 0, 0.12), inset 0 0 4px rgba(255, 106, 0, 0.05)",
                        backdropFilter: "blur(4px)",
                        zIndex: -1,
                      }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon 
                    size={18} 
                    className={`transition-all duration-300 ${
                      isActive ? "text-[#FF6A00] scale-110 drop-shadow-[0_0_6px_rgba(255,106,0,0.4)]" : "text-text-secondary hover:text-text-primary"
                    }`} 
                    strokeWidth={isActive ? 2.5 : 2} 
                  />
                  <span 
                    className={`text-[8.5px] mt-0.5 font-medium transition-colors duration-300 truncate max-w-full text-center ${
                      isActive ? "text-[#FF6A00] font-semibold" : "text-text-secondary"
                    }`}
                  >
                    {item.name}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>
      {/* Spacer to prevent overlapping contents */}
      <div className="h-24 md:hidden shrink-0 pointer-events-none" />
    </>
  );
}



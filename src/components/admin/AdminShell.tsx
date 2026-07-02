"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Terminal,
  FolderKanban,
  Activity,
  Award,
  CreditCard,
  DollarSign,
  Megaphone,
  Mail,
  BarChart3,
  Settings,
  FileClock,
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  ShieldAlert,
  Loader2,
  Zap,
  Diamond,
  Receipt,
  ShieldCheck,
  Cpu,
  Database,
  Save,
  User,
  Key,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import Logo from "@/components/Logo";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

const menuItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "APIs", href: "/admin/apis", icon: Terminal },
  { name: "Categories", href: "/admin/categories", icon: FolderKanban },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Request Logs", href: "/admin/requests", icon: Activity },
  { name: "API Keys", href: "/admin/api-keys", icon: Key },
  { name: "Payments", href: "/admin/payments", icon: DollarSign },
  { name: "Plans", href: "/admin/plans", icon: CreditCard },
  { name: "Leaderboard", href: "/admin/leaderboard", icon: Award },
  { name: "Email", href: "/admin/email", icon: Mail },
  { name: "Database", href: "/admin/database", icon: Database },
  { name: "System", href: "/admin/system", icon: Cpu },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  // Sample Notifications
  const notifications = [
    { id: 1, text: "New manual payment confirmation pending: INV-2941", time: "5m ago" },
    { id: 2, text: "User John Doe registered a new account", time: "1h ago" },
    { id: 3, text: "API failure rate spiked on endpoint: /api/v1/download/tiktok", time: "2h ago" },
  ];

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user && data.user.role === "SUPER_ADMIN") {
          setUser(data.user);
        } else {
          toast.error("Access Denied: Super Admin privilege required.");
          router.push("/403");
        }
      })
      .catch(() => {
        router.push("/login");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Admin logged out");
      router.push("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-accent animate-spin mx-auto mb-4" />
          <p className="text-text-secondary text-sm">Authenticating Admin Session...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex">
      <Toaster theme="dark" position="top-right" />

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 bg-bg-secondary border-r border-border shrink-0 z-30 sticky top-0 h-screen">
        {/* Header Logo */}
        <div className="h-16 flex items-center px-6 gap-2 border-b border-border">
          <span className="font-extrabold text-base tracking-wide text-text-primary font-display select-none">
            Lcode <span className="text-accent">API</span>
            <span className="ml-1.5 text-[9px] bg-accent/20 text-accent border border-accent/30 px-1.5 py-0.5 rounded font-mono font-medium">ADMIN</span>
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1 scrollbar-thin">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-accent/10 border border-accent/25 text-accent shadow-[0_0_12px_rgba(234,88,12,0.05)]"
                    : "text-text-secondary border border-transparent hover:text-text-primary hover:bg-bg-tertiary"
                }`}
              >
                <item.icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-115 ${isActive ? "text-accent" : "text-text-tertiary group-hover:text-text-secondary"}`} />
                {item.name}
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group text-text-secondary border border-transparent hover:text-error hover:bg-error/10"
          >
            <LogOut className="w-4 h-4 text-text-tertiary group-hover:text-error transition-transform duration-200 group-hover:scale-115" />
            Logout
          </button>
        </nav>

        {/* Footer Profile */}
        <div className="p-4 border-t border-border bg-bg-secondary/40">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-bg-tertiary/50 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/25 flex items-center justify-center text-accent text-xs font-bold uppercase">
              {user.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-primary truncate">{user.name}</p>
              <p className="text-[10px] text-text-tertiary truncate font-mono uppercase">{user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-text-tertiary hover:text-error rounded-lg transition-colors"
              title="Logout Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE DRAWER SIDEBAR */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-bg-secondary border-r border-border z-50 flex flex-col lg:hidden"
            >
              <div className="h-16 flex items-center justify-between px-6 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base text-text-primary font-display select-none">
                    Lcode <span className="text-accent">API</span>
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-text-secondary hover:text-text-primary border border-border rounded-lg bg-bg-tertiary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-accent/10 border border-accent/25 text-accent"
                          : "text-text-secondary border border-transparent hover:text-text-primary hover:bg-bg-tertiary"
                      }`}
                    >
                      <item.icon className={`w-4 h-4 ${isActive ? "text-accent" : "text-text-tertiary"}`} />
                      {item.name}
                    </Link>
                  );
                })}

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group text-text-secondary border border-transparent hover:text-error hover:bg-error/10"
                >
                  <LogOut className="w-4 h-4 text-text-tertiary group-hover:text-error" />
                  Logout
                </button>
              </nav>

              <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3 p-2 rounded-xl bg-bg-tertiary/20">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent text-xs font-bold uppercase">
                    {user.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text-primary truncate">{user.name}</p>
                    <p className="text-[10px] text-text-tertiary font-mono uppercase truncate">{user.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-text-tertiary hover:text-error transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* TOPBAR */}
        <header className="h-16 border-b border-border bg-bg-secondary/40 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-text-secondary hover:text-text-primary border border-border bg-bg-secondary rounded-xl"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Topbar Search */}
            <div className="relative max-w-xs sm:max-w-md w-full hidden sm:block">
              <Search className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search resources, users, endpoints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-1.5 text-xs bg-bg-primary border border-border rounded-xl focus:border-accent focus:outline-none placeholder:text-text-tertiary transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle MOCK */}
            <button
              onClick={() => {
                setDarkMode(!darkMode);
                toast.success(darkMode ? "Theme switched to Light" : "Theme switched to Dark");
              }}
              className="p-2 text-text-secondary hover:text-text-primary border border-border bg-bg-secondary hover:bg-bg-tertiary rounded-xl transition-colors"
              title="Toggle Theme"
            >
              {darkMode ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
            </button>

            {/* Notifications Trigger */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-text-secondary hover:text-text-primary border border-border bg-bg-secondary hover:bg-bg-tertiary rounded-xl relative transition-colors"
                title="Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full animate-pulse" />
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2.5 w-80 bg-bg-secondary border border-border rounded-2xl shadow-xl z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                        <span className="text-xs font-semibold text-text-primary">Notifications</span>
                        <button
                          onClick={() => toast.success("Notifications marked as read")}
                          className="text-[10px] text-accent hover:underline font-medium"
                        >
                          Mark all as read
                        </button>
                      </div>
                      <div className="divide-y divide-border">
                        {notifications.map((n) => (
                          <div key={n.id} className="p-3.5 hover:bg-bg-tertiary/30 transition-colors">
                            <p className="text-xs text-text-secondary leading-normal">{n.text}</p>
                            <span className="text-[10px] text-text-tertiary font-mono block mt-1">{n.time}</span>
                          </div>
                        ))}
                      </div>
                      <div className="p-2.5 border-t border-border text-center bg-bg-secondary/40">
                        <button className="text-[10px] text-text-secondary hover:text-text-primary font-medium">
                          View all activity logs
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Avatar Short Profile Details */}
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-xs font-bold uppercase">
                {user.name.charAt(0)}
              </div>
              <div className="hidden md:block text-left">
                <span className="text-xs font-medium text-text-primary block leading-none">{user.name}</span>
                <span className="text-[9px] text-text-tertiary font-mono uppercase">{user.role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* CHILDREN PAGES CONTENT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

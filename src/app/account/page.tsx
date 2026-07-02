"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  User as UserIcon, 
  Key, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  RefreshCw, 
  Activity, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  Settings,
  ChevronRight,
  Loader2,
  Lock,
  Crown
} from "lucide-react";

interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: string | null;
  createdAt: string;
}

const benefits = [
  "Free API Access",
  "API Usage Analytics",
  "Secure API Keys",
  "Developer Dashboard",
  "Premium Features"
];

export default function AccountPage() {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState("lcode_8a2d1f9b3e0c4f8d2b7a");
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Authenticate user
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    showToast("API Key copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    setRegenerating(true);
    setTimeout(() => {
      const chars = "abcdef0123456789";
      let randomString = "";
      for (let i = 0; i < 20; i++) {
        randomString += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setApiKey(`lcode_${randomString}`);
      setRegenerating(false);
      showToast("API Key successfully regenerated!");
    }, 1000);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Masked string representation
  const maskedKey = apiKey.substring(0, 6) + "•".repeat(apiKey.length - 6);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex items-center justify-center min-h-screen bg-bg-primary">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </main>
        <Footer />
      </>
    );
  }

  // --- 1. RENDER GUEST/UNAUTHENTICATED GATEWAY PAGE ---
  if (!user) {
    return (
      <>
        <Navbar />

        {/* Decorative Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[72px] left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-accent/5 blur-[120px]" />
        </div>

        <main className="flex-1 max-w-4xl mx-auto px-6 w-full pt-32 pb-20 flex flex-col items-center justify-center text-center">
          
          <div className="max-w-2xl space-y-6">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-semibold text-accent uppercase tracking-wider mx-auto">
              <Lock className="w-3.5 h-3.5 text-accent" />
              <span>Developer Account</span>
            </div>

            {/* Title & Desc */}
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-text-primary">
              Welcome to <span className="text-accent">Lcode API</span>
            </h1>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed max-w-lg mx-auto">
              Login atau buat akun untuk mendapatkan API key, mengelola endpoint, memantau penggunaan, dan mengakses fitur premium.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4 max-w-md mx-auto">
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-3.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl transition-all duration-200 hover:scale-[1.01] flex items-center justify-center gap-1.5 shadow-lg shadow-accent/20 cursor-pointer"
              >
                <span>Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-3.5 border border-border/80 hover:border-accent/40 hover:bg-accent/5 text-text-primary text-xs font-bold rounded-xl transition-all duration-200 hover:scale-[1.01] flex items-center justify-center cursor-pointer"
              >
                Create Account
              </Link>
            </div>

            {/* Benefits section */}
            <div className="pt-8 border-t border-border/40 mt-10">
              <span className="text-[10px] text-text-tertiary uppercase font-mono tracking-wider block mb-4">
                What you get as a developer
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-2xl mx-auto">
                {benefits.map((benefit) => (
                  <div 
                    key={benefit} 
                    className="flex items-center gap-2.5 p-3.5 rounded-3xl premium-glass hover:border-accent/40 transition-all duration-200"
                  >
                    <Check className="w-4 h-4 text-accent shrink-0" />
                    <span className="text-xs text-text-secondary font-semibold text-left">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </main>

        <Footer />
      </>
    );
  }

  // --- 2. RENDER USER DASHBOARD (AUTHENTICATED) ---
  return (
    <>
      <Navbar />

      {/* Decorative Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[72px] left-1/4 w-96 h-96 rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute top-[500px] right-10 w-80 h-80 rounded-full bg-accent/5 blur-[100px]" />
      </div>

      {/* Dynamic Notification Toast */}
      {toastMsg && (
        <div className="fixed bottom-24 right-6 z-50 animate-slideUp bg-[#161616] border border-accent/40 px-4 py-3 rounded-xl flex items-center gap-2 shadow-[0_8px_24px_rgba(234,88,12,0.15)]">
          <div className="p-1 rounded-full bg-accent/15 text-accent">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-text-primary">{toastMsg}</span>
        </div>
      )}

      <main className="flex-1 max-w-6xl mx-auto px-6 w-full pt-28 pb-16">
        
        <div className="mb-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-semibold text-accent uppercase tracking-wider">
            <Settings className="w-3 h-3 animate-spin-slow" />
            <span>Developer Account</span>
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
            User <span className="text-accent">Dashboard</span>
          </h1>
          <p className="text-text-secondary text-xs md:text-sm">
            Kelola kunci API Anda, lihat analitik penggunaan, dan pantau status akun pengembang Anda.
          </p>
        </div>

        {/* Admin Access Panel */}
        {user.role === "SUPER_ADMIN" && (
          <div className="mb-8 p-5 rounded-3xl border border-accent/40 bg-accent/5 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_24px_rgba(234,88,12,0.06)] group hover:border-accent/50 transition-all duration-300">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0 group-hover:scale-105 transition-transform duration-300">
                <Crown className="w-5.5 h-5.5 text-accent" />
              </div>
              <div>
                <h4 className="font-bold text-text-primary text-sm">Super Admin</h4>
                <p className="text-xs text-text-secondary">Anda memiliki akses ke Control Panel Super Admin.</p>
              </div>
            </div>
            <Link
              href="/admin"
              className="w-full sm:w-auto px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-accent/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Open Admin Panel</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: User Profile & API Key Settings */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* User Profile Card */}
            <div id="profile" className="p-6 rounded-3xl premium-glass flex flex-col sm:flex-row items-center sm:justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-accent/5 blur-xl pointer-events-none -z-10" />
              
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-amber-500 flex items-center justify-center text-text-primary text-2xl font-black shadow-[0_4px_20px_rgba(234,88,12,0.3)] border border-white/10 shrink-0">
                  {user.name[0]?.toUpperCase() || "U"}
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-text-primary flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-2">
                    <span>{user.name}</span>
                    {user.role === "SUPER_ADMIN" && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-accent/20 border border-accent/40 text-[9px] font-bold text-accent uppercase font-mono tracking-wider">
                        <ShieldCheck className="w-3 h-3 text-accent" />
                        <span>SUPER ADMIN</span>
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-xs text-text-tertiary">Username: {user.name}</span>
                    <span className="h-1 w-1 rounded-full bg-text-tertiary" />
                    <span className="text-xs text-text-tertiary font-mono">UID: {user.id.substring(0, 10)}...</span>
                  </div>
                </div>
              </div>

              {/* Upgrade Box / Plan Status */}
              <div className="w-full sm:w-auto p-4 rounded-2xl border border-white/[0.08] bg-white/[0.01] flex items-center justify-between sm:justify-start gap-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-text-tertiary uppercase font-medium">Plan Type</span>
                  <p className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-accent" />
                    <span>Free Plan</span>
                  </p>
                </div>
                <Link
                  href="/pricing"
                  className="px-3.5 py-2 bg-accent/10 border border-accent/35 hover:bg-accent text-accent hover:text-white text-xs font-bold rounded-full transition-all flex items-center gap-1 cursor-pointer hover:scale-[1.01]"
                >
                  <span>Upgrade</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>

            {/* API Key Panel Card */}
            <div id="api-keys" className="p-6 rounded-3xl premium-glass space-y-6">
              
              <div className="flex items-center justify-between gap-4 pb-3 border-b border-white/[0.06]">
                <h3 className="text-sm md:text-base font-bold text-text-primary flex items-center gap-2">
                  <Key className="w-4 h-4 text-accent" />
                  <span>API Credentials</span>
                </h3>
                <span className="text-[10px] text-text-tertiary font-mono bg-bg-tertiary/40 px-2 py-0.5 rounded border border-white/[0.08]">
                  v2 endpoints key
                </span>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
                    Your Secret API Key
                  </label>
                  
                  {/* Key Container Field */}
                  <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.08] rounded-2xl px-4 py-3 font-mono text-sm">
                    <span className="text-text-primary select-all break-all overflow-x-auto whitespace-nowrap scrollbar-none pr-4">
                      {showKey ? apiKey : maskedKey}
                    </span>
                    
                    <button
                      onClick={() => setShowKey(!showKey)}
                      className="p-1 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                      aria-label="Toggle show/hide API key"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Management Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleCopy}
                    className="flex-1 py-3 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-accent/20 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy API Key</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleRegenerate}
                    disabled={regenerating}
                    className="flex-1 py-3 border border-white/[0.08] hover:border-accent/40 hover:bg-accent/5 text-text-primary text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-bg-tertiary/30 disabled:text-text-tertiary"
                  >
                    <RefreshCw className={`w-4 h-4 ${regenerating ? "animate-spin text-accent" : ""}`} />
                    <span>Regenerate Key</span>
                  </button>
                </div>

                <div className="p-3 bg-amber-500/5 border border-amber-500/10 text-[10px] text-amber-500/80 rounded-2xl leading-relaxed">
                  **Keamanan API Key**: Jangan bagikan kunci API Anda kepada siapa pun. Kunci ini mewakili identitas pengembang Anda dan memberikan akses langsung ke kuota request API Anda.
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Statistics */}
          <div className="lg:col-span-4 space-y-6">
            
            <div id="statistics" className="p-6 rounded-3xl premium-glass space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <h3 className="text-sm md:text-base font-bold text-text-primary flex items-center gap-2">
                  <Activity className="w-4 h-4 text-accent animate-pulse" />
                  <span>Key Statistics</span>
                </h3>
              </div>

              <div className="space-y-4">
                
                {/* Metric 1 */}
                <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-2xl space-y-1">
                  <span className="text-[10px] text-text-tertiary uppercase font-medium">Total Requests</span>
                  <p className="text-xl font-extrabold text-text-primary">150</p>
                </div>

                {/* Metric 2 */}
                <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-2xl space-y-1">
                  <span className="text-[10px] text-text-tertiary uppercase font-medium">Remaining Requests</span>
                  <p className="text-xl font-extrabold text-accent">850</p>
                  
                  {/* Progress bar visual */}
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-accent rounded-full" style={{ width: "85%" }} />
                  </div>
                  <div className="flex justify-between text-[8px] text-text-tertiary font-mono pt-1">
                    <span>850 left</span>
                    <span>1.000 limit</span>
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-2xl space-y-1">
                  <span className="text-[10px] text-text-tertiary uppercase font-medium">Active APIs</span>
                  <p className="text-xl font-extrabold text-text-primary">3</p>
                </div>

              </div>

            </div>

            {/* Quick Explore Panel CTA */}
            <div className="p-6 rounded-3xl premium-glass bg-gradient-to-br from-white/[0.01] to-accent/[0.02] text-center space-y-4 shadow-xl">
              <h3 className="text-sm font-extrabold text-text-primary flex items-center justify-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-accent" />
                <span>Explore Endpoints</span>
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Ingin mencoba endpoint baru? Jelajahi katalog API Lcode yang siap digunakan dalam hitungan menit.
              </p>
              <Link
                href="/apis"
                className="w-full py-3 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-full transition-all duration-200 hover:scale-[1.01] flex items-center justify-center gap-1.5 shadow-lg shadow-accent/20 cursor-pointer font-sans"
              >
                <span>Browse API Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </>
  );
}

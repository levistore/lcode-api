"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Trophy, 
  Activity, 
  Users, 
  Layers, 
  Clock, 
  ArrowUpRight, 
  TrendingUp, 
  Cpu, 
  Palette, 
  Wrench, 
  Image as ImageIcon,
  CheckCircle2,
  Calendar
} from "lucide-react";

// Database row data structure
interface LeaderboardApi {
  id: string;
  name: string;
  route: string;
  method: string;
  category: string;
  requestCount: number;
  uniqueUsers: number;
  successRate: number;
  status: string;
}

const categoryFilters = [
  { label: "All APIs", icon: Layers },
  { label: "AI APIs", icon: Cpu },
  { label: "Canva APIs", icon: Palette },
  { label: "Tools APIs", icon: Wrench },
  { label: "Image APIs", icon: ImageIcon }
] as const;

const timeRanges = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "All Time", value: "all" }
] as const;

export default function LeaderboardClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All APIs");
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("all");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardApi[]>([]);
  const [stats, setStats] = useState({
    totalRequests: "0",
    totalApis: 0,
    activeUsers: "0",
    uptime: "99.9%"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?filter=${selectedTimeRange}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.leaderboard) {
          setLeaderboardData(data.leaderboard);
        }
        if (data.stats) {
          setStats(data.stats);
        }
      })
      .catch((err) => console.error("Leaderboard fetch error:", err))
      .finally(() => setLoading(false));
  }, [selectedTimeRange]);

  // Filter & calculate requests
  const processedData = leaderboardData
    .filter((api) => {
      return selectedCategory === "All APIs" || api.category === selectedCategory;
    });

  // Calculate highest request in the current filtered set for relative progress calculations
  const maxRequests = processedData.length > 0 ? processedData[0].requestCount : 1;

  // Sorting for trending APIs
  const trendingApis = [...leaderboardData]
    .sort((a, b) => b.uniqueUsers - a.uniqueUsers)
    .slice(0, 5);

  // Format Helper
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("id-ID").format(num);
  };

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0: return "1";
      case 1: return "2";
      case 2: return "3";
      default: return `${index + 1}`;
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto px-6 w-full pt-28 pb-16">

      {/* Hero Section */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-semibold text-accent uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5 text-accent" />
          <span>Top 10 APIs</span>
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-text-primary">
          Top 10 Most <span className="text-accent">Used APIs</span>
        </h1>
        <p className="text-text-secondary text-sm md:text-base leading-relaxed">
          Lihat endpoint API yang paling sering digunakan oleh developer di platform Lcode API.
        </p>
      </div>

      {/* Global Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16">
        {[
          { label: "Total Requests", value: stats.totalRequests, icon: Activity },
          { label: "Total APIs", value: String(stats.totalApis), icon: Layers },
          { label: "Active Users", value: stats.activeUsers, icon: Users },
          { label: "Uptime", value: stats.uptime, icon: Clock }
        ].map((stat, i) => {
          const StatIcon = stat.icon;
          return (
            <div 
              key={stat.label}
              className="relative p-5 rounded-3xl border border-white/[0.08] bg-bg-secondary/40 backdrop-blur-xl hover:border-accent/40 transition-all duration-300 group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-accent/5 blur-xl pointer-events-none -z-10 group-hover:bg-accent/10 transition-colors" />
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] md:text-xs text-text-tertiary uppercase tracking-wider font-semibold">
                  {stat.label}
                </span>
                <StatIcon className="w-4 h-4 text-accent/80" />
              </div>
              <p className="text-lg md:text-2xl font-black text-text-primary tracking-tight">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Leaderboard Table Section */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Table Header Filter Controls */}
          <div className="flex flex-col gap-4 p-4 rounded-3xl border border-white/[0.08] bg-bg-secondary/30 backdrop-blur-xl">
            
            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
              {categoryFilters.map((filter) => {
                const FilterIcon = filter.icon;
                const isSelected = selectedCategory === filter.label;
                return (
                  <button
                    key={filter.label}
                    onClick={() => setSelectedCategory(filter.label)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-semibold whitespace-nowrap snap-align-start transition-all cursor-pointer ${
                      isSelected
                        ? "bg-accent/15 border-accent text-accent shadow-[0_0_15px_rgba(234,88,12,0.1)]"
                        : "bg-bg-secondary/60 border-border/60 text-text-secondary hover:text-text-primary hover:border-border"
                    }`}
                  >
                    <FilterIcon className="w-3.5 h-3.5" />
                    <span>{filter.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Time Range Filter */}
            <div className="flex items-center gap-2 border-t border-border/40 pt-3">
              <Calendar className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0" />
              <span className="text-xs text-text-tertiary mr-2 font-medium">Time Range:</span>
              <div className="flex bg-bg-secondary border border-border rounded-lg p-0.5 gap-1">
                {timeRanges.map((range) => {
                  const isSelected = selectedTimeRange === range.value;
                  return (
                    <button
                      key={range.value}
                      onClick={() => setSelectedTimeRange(range.value)}
                      className={`px-3 py-1 rounded text-[10px] md:text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-accent text-white"
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {range.label}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Rankings List */}
          {loading ? (
            <div className="text-center py-20 text-text-secondary">
              <span className="inline-block animate-pulse">Memuat data peringkat...</span>
            </div>
          ) : processedData.length > 0 ? (
            <div className="space-y-3">
              {processedData.map((item, index) => {
                const rankBadge = getRankBadge(index);
                const isTopThree = index < 3;
                const usagePercentage = (item.requestCount / maxRequests) * 100;
                
                return (
                  <div
                    key={item.name}
                    className="group relative rounded-3xl border border-white/[0.08] bg-bg-secondary/40 backdrop-blur-xl p-5 transition-all duration-300 hover:border-accent/40 hover:shadow-[0_12px_32px_rgba(0,0,0,0.3)] overflow-hidden"
                  >
                    {/* Orange Hover Light glow */}
                    <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-accent/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      {/* Title, Endpoint, Category */}
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0 ${
                          isTopThree
                            ? "bg-accent/10 border border-accent/25 text-lg"
                            : "bg-bg-tertiary/60 border border-border/60 text-text-secondary text-sm font-mono"
                        }`}>
                          {rankBadge}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm md:text-base font-bold text-text-primary group-hover:text-accent transition-colors duration-200">
                              {item.name}
                            </h3>
                            <span className="flex items-center gap-1 text-[10px] text-text-tertiary bg-bg-tertiary/40 px-2 py-0.5 rounded border border-border/60">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-xs font-mono text-text-tertiary truncate max-w-[240px] md:max-w-sm">
                            {item.route}
                          </p>
                        </div>
                      </div>

                      {/* Requests stats & status */}
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:text-right flex-shrink-0">
                        <div>
                          <span className="text-sm md:text-base font-extrabold text-text-primary">
                            {formatNumber(item.requestCount)}
                          </span>
                          <span className="text-[10px] text-text-tertiary block font-medium">Requests</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>{item.status}</span>
                        </div>
                      </div>

                    </div>

                    {/* Usage Progress Indicator */}
                    <div className="mt-4">
                      <div className="flex justify-between text-[10px] text-text-tertiary mb-1 font-mono">
                        <span>Usage Relative Share</span>
                        <span>{Math.round(usagePercentage)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-bg-tertiary/60 rounded-full overflow-hidden border border-border/40">
                        <div 
                          className="h-full bg-accent rounded-full transition-all duration-500" 
                          style={{ width: `${usagePercentage}%` }}
                        />
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-bg-secondary/10 space-y-3">
              <Trophy className="w-10 h-10 text-text-tertiary mx-auto animate-pulse" />
              <h3 className="text-base font-bold text-text-primary">Tidak ada data ditemukan</h3>
              <p className="text-xs text-text-secondary px-6">
                Tidak ada API pada kategori "{selectedCategory}" untuk jangka waktu pilihan Anda.
              </p>
            </div>
          )}

        </div>

        {/* Trending APIs Sidebar Section */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="p-6 rounded-3xl border border-white/[0.08] bg-bg-secondary/30 backdrop-blur-xl space-y-6">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 pb-3 border-b border-border/60">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span>Trending APIs</span>
            </h2>

            <div className="space-y-4">
              {trendingApis.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between gap-4 p-3 bg-bg-secondary/40 border border-border/40 rounded-xl hover:border-accent/20 transition-all group">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-text-primary group-hover:text-accent transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-[10px] font-mono text-text-tertiary truncate max-w-[140px]">
                      {item.route}
                    </p>
                  </div>
                  <span className="flex items-center gap-0.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {item.uniqueUsers} users
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* View APIs Link Button CTA */}
          <div className="p-6 rounded-3xl border border-white/[0.08] bg-gradient-to-br from-bg-secondary/40 to-accent/5 backdrop-blur-xl text-center space-y-4 shadow-xl">
            <h3 className="text-base font-extrabold text-text-primary">
              Ready to Use These APIs?
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Akses katalog lengkap, lihat detail dokumentasi endpoint, dan jalankan uji coba di live playground.
            </p>
            <Link
              href="/apis"
              className="w-full py-3 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-full transition-all duration-200 hover:scale-[1.01] flex items-center justify-center gap-1.5 shadow-lg shadow-accent/20 cursor-pointer"
            >
              <span>View APIs</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </div>
      </div>
      <Footer />
    </>
  );
}

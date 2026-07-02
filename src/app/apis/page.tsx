"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Search, 
  Brain, 
  Palette, 
  Download, 
  Image as ImageIcon, 
  Wrench, 
  Search as SearchIcon, 
  Activity, 
  ArrowUpRight, 
  ExternalLink,
  Layers,
  Sparkles
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ApiItem {
  name: string;
  description: string;
  path: string;
  method: "GET" | "POST";
  category: string;
  requests: string;
  status: "Online" | "Maintenance";
  slug: string;
}

const categoryTabs = [
  { label: "All", icon: Layers },
  { label: "AI APIs", icon: Brain },
  { label: "Canva APIs", icon: Palette },
  { label: "Downloader APIs", icon: Download },
  { label: "Image APIs", icon: ImageIcon },
  { label: "Utility APIs", icon: Wrench },
  { label: "Search APIs", icon: SearchIcon },
];

export default function ApisPage() {
  const [apisData, setApisData] = useState<ApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetch("/api/apis")
      .then((res) => res.json())
      .then((data) => {
        if (data.endpoints) {
          setApisData(data.endpoints);
        }
      })
      .catch((err) => console.error("Error fetching dynamic APIs catalog:", err))
      .finally(() => setLoading(false));
  }, []);

  // Filtering logic
  const filteredApis = apisData.filter((api) => {
    const matchesSearch = 
      api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.path.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "All" || api.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });


  return (
    <>
      <Navbar />

      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[72px] right-1/4 w-96 h-96 rounded-full bg-accent/5 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[600px] left-10 w-80 h-80 rounded-full bg-accent/5 blur-[100px] pointer-events-none -z-10" />

      <main className="flex-1 max-w-7xl mx-auto px-6 w-full pt-28 pb-16">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-semibold text-accent uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>API Explorer</span>
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-text-primary">
            Explore Lcode <span className="text-accent">API Catalog</span>
          </h1>
          <p className="text-text-secondary text-sm md:text-base">
            Temukan berbagai endpoint API berkecepatan tinggi yang siap diintegrasikan untuk kebutuhan projek aplikasi Anda.
          </p>
        </div>

        {/* Search Bar - Glassmorphism & Orange Accent glow */}
        <div className="max-w-2xl mx-auto mb-10 relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-accent to-accent/40 rounded-xl blur opacity-15 group-hover:opacity-30 transition-all duration-300" />
          <div className="relative flex items-center bg-bg-secondary/60 backdrop-blur-xl border border-border rounded-xl px-4 py-3">
            <Search className="w-5 h-5 text-text-tertiary mr-3 group-hover:text-accent transition-colors" />
            <input
              type="text"
              placeholder="Cari nama API, deskripsi, atau endpoint path..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-text-primary placeholder-text-tertiary text-sm md:text-base font-sans"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="text-xs font-semibold text-text-tertiary hover:text-text-primary transition-colors cursor-pointer px-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Categories Tab Bar - Mobile swipeable horizontal container */}
        <div className="flex overflow-x-auto pb-4 mb-10 gap-2 scrollbar-none snap-x mask-image-horizontal">
          {categoryTabs.map((tab) => {
            const TabIcon = tab.icon;
            const isSelected = selectedCategory === tab.label;
            return (
              <button
                key={tab.label}
                onClick={() => setSelectedCategory(tab.label)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-semibold whitespace-nowrap snap-align-start transition-all cursor-pointer ${
                  isSelected
                    ? "bg-accent/15 border-accent text-accent shadow-[0_0_15px_rgba(234,88,12,0.15)]"
                    : "bg-bg-secondary/40 border-border/80 text-text-secondary hover:text-text-primary hover:border-border"
                }`}
              >
                <TabIcon className={`w-3.5 h-3.5 ${isSelected ? "text-accent" : "text-text-tertiary"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* API Grid - Glassmorphism, animations and responsive logic */}
        {loading ? (
          <div className="text-center py-20 text-text-secondary">
            <span className="inline-block animate-pulse">Memuat katalog API...</span>
          </div>
        ) : filteredApis.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredApis.map((api, idx) => (
              <div
                key={api.name}
                className="group relative bg-bg-secondary/40 backdrop-blur-xl border border-white/[0.08] rounded-3xl overflow-hidden transition-all duration-300 hover:border-accent/40 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.3)] flex flex-col justify-between"
              >
                {/* Visual Top Glow bar on hover */}
                <div className="h-[2px] bg-gradient-to-r from-accent/50 to-transparent w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="p-6 space-y-4">
                  {/* Header Row: Method + Path */}
                  <div className="flex items-center justify-between gap-2 font-mono text-xs">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      api.method === "GET" 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                        : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    }`}>
                      {api.method}
                    </span>
                    <span className="text-text-tertiary truncate max-w-[180px]">
                      {api.path}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-text-primary group-hover:text-accent transition-colors duration-200">
                      {api.name}
                    </h3>
                    <p className="text-text-secondary text-sm leading-relaxed line-clamp-3">
                      {api.description}
                    </p>
                  </div>
                </div>

                {/* Footer Section: Stats + Details */}
                <div className="px-6 py-4 bg-[#0B0B0B]/50 border-t border-white/[0.06] flex items-center justify-between text-xs text-text-tertiary">
                  {/* Total Requests count */}
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-accent/80" />
                    <span><strong className="text-text-secondary font-medium">{api.requests}</strong> requests</span>
                  </div>

                  {/* Online/Active status badge */}
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-text-secondary font-medium">{api.status}</span>
                  </div>
                </div>

                {/* Cover Hover Overlay Link - Now pointing to dynamic routing */}
                <Link 
                  href={`/apis/${api.slug}`} 
                  className="absolute inset-0 z-10 rounded-3xl cursor-pointer"
                  aria-label={`View documentation for ${api.name}`}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Empty Search Results display */
          <div className="text-center py-16 bg-bg-secondary/20 border border-dashed border-border rounded-2xl max-w-xl mx-auto space-y-3">
            <SearchIcon className="w-10 h-10 text-text-tertiary mx-auto animate-pulse" />
            <h3 className="text-lg font-bold text-text-primary">Tidak ada API ditemukan</h3>
            <p className="text-text-secondary text-sm px-6">
              Tidak ada hasil yang cocok untuk kata kunci "{searchQuery}" di kategori "{selectedCategory}". Coba cari kata kunci lainnya.
            </p>
          </div>
        )}

      </main>

      <Footer />
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Zap, 
  Copy, 
  Check, 
  Terminal, 
  Lock, 
  Activity, 
  AlertCircle, 
  BookOpen, 
  ChevronRight, 
  Code,
  Sparkles,
  RefreshCw,
  Layers,
  Cpu,
  Brain,
  Palette,
  Download,
  Image as ImageIcon,
  Wrench,
  Search as SearchIcon
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getSpecByRoute, getSpecBySlug, ApiSpec, ApiParam } from "@/lib/api-specs";

interface DynamicEndpoint {
  id: string;
  name: string;
  description: string;
  path: string;
  method: "GET" | "POST";
  category: string;
  categorySlug: string;
  slug: string;
}

interface DocCategory {
  name: string;
  slug: string;
  endpoints: DynamicEndpoint[];
}

const getCategoryIcon = (slug: string): LucideIcon => {
  switch (slug) {
    case "ai-apis": return Brain;
    case "canva-apis": return Palette;
    case "downloader-apis": return Download;
    case "image-apis": return ImageIcon;
    case "search-apis": return SearchIcon;
    default: return Wrench;
  }
};

// Error codes list
const errorCodes = [
  { status: "200 OK", desc: "Permintaan berhasil diproses." },
  { status: "400 Bad Request", desc: "Parameter yang dikirim tidak lengkap atau tidak valid." },
  { status: "401 Unauthorized", desc: "API Key tidak ada, salah, atau telah kedaluwarsa." },
  { status: "403 Forbidden", desc: "Anda tidak memiliki akses ke endpoint ini." },
  { status: "429 Too Many Requests", desc: "Batas rate limit terlampaui. Silakan tunggu beberapa menit." },
  { status: "500 Internal Error", desc: "Terjadi kesalahan internal pada server kami." },
];

export default function DocsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTabMap, setActiveTabMap] = useState<Record<string, "curl" | "js" | "python">>({});
  const [activeSection, setActiveSection] = useState<string>("getting-started");
  const [categories, setCategories] = useState<DocCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Handle copying code/endpoints
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    fetch("/api/apis")
      .then((res) => res.json())
      .then((data) => {
        if (data.endpoints) {
          // Group endpoints by category
          const grouped: Record<string, DocCategory> = {};
          data.endpoints.forEach((ep: DynamicEndpoint) => {
            const catKey = ep.categorySlug;
            if (!grouped[catKey]) {
              grouped[catKey] = {
                name: ep.category,
                slug: ep.categorySlug,
                endpoints: []
              };
            }
            grouped[catKey].endpoints.push(ep);
          });
          setCategories(Object.values(grouped));
        }
      })
      .catch((err) => console.error("Docs fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  // Setup active section detection based on scroll position
  useEffect(() => {
    if (loading || categories.length === 0) return;

    const handleScroll = () => {
      const allEndpoints = categories.flatMap(c => c.endpoints);
      const sections = [
        "getting-started", 
        "authentication", 
        "rate-limits", 
        "error-codes",
        ...allEndpoints.map(ep => `endpoint-${ep.slug}`)
      ];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, categories]);

  // Smooth scroll handler
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 100,
        behavior: "smooth"
      });
      setActiveSection(targetId);
    }
  };

  // Generate dynamic request code examples
  const getCurlSnippet = (ep: DynamicEndpoint, spec?: ApiSpec) => {
    const paramsList = spec?.parameters || [];
    const queryParams = paramsList
      .filter(p => ep.method === "GET")
      .map(p => `${p.name}=${spec?.defaultPlaygroundParams[p.name] || "value"}`)
      .join("&");
    
    const url = `https://api.lcode.dev${ep.path}${queryParams ? `?${queryParams}` : ""}`;
    if (ep.method === "GET") {
      return `curl -X GET "${url}" \\\n  -H "Authorization: Bearer YOUR_API_KEY"`;
    } else {
      const bodyParams: Record<string, any> = {};
      paramsList.forEach(p => {
        bodyParams[p.name] = spec?.defaultPlaygroundParams[p.name] || "value";
      });
      return `curl -X POST "https://api.lcode.dev${ep.path}" \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(bodyParams, null, 2)}'`;
    }
  };

  const getJsSnippet = (ep: DynamicEndpoint, spec?: ApiSpec) => {
    const paramsList = spec?.parameters || [];
    const queryParams = paramsList
      .filter(p => ep.method === "GET")
      .map(p => `${p.name}=${spec?.defaultPlaygroundParams[p.name] || "value"}`)
      .join("&");
      
    const url = `https://api.lcode.dev${ep.path}${queryParams ? `?${queryParams}` : ""}`;
    if (ep.method === "GET") {
      return `const response = await fetch("${url}", {
  method: "GET",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY"
  }
});
const data = await response.json();
console.log(data);`;
    } else {
      const bodyParams: Record<string, any> = {};
      paramsList.forEach(p => {
        bodyParams[p.name] = spec?.defaultPlaygroundParams[p.name] || "value";
      });
      return `const response = await fetch("https://api.lcode.dev${ep.path}", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify(${JSON.stringify(bodyParams, null, 2).replace(/\n/g, "\n  ")})
});
const data = await response.json();
console.log(data);`;
    }
  };

  const getPythonSnippet = (ep: DynamicEndpoint, spec?: ApiSpec) => {
    const paramsList = spec?.parameters || [];
    const queryParams = paramsList
      .filter(p => ep.method === "GET")
      .map(p => `${p.name}=${spec?.defaultPlaygroundParams[p.name] || "value"}`)
      .join("&");
      
    const url = `https://api.lcode.dev${ep.path}${queryParams ? `?${queryParams}` : ""}`;
    if (ep.method === "GET") {
      return `import requests

url = "${url}"
headers = {
    "Authorization": "Bearer YOUR_API_KEY"
}

response = requests.get(url, headers=headers)
print(response.json())`;
    } else {
      const bodyParams: Record<string, any> = {};
      paramsList.forEach(p => {
        bodyParams[p.name] = spec?.defaultPlaygroundParams[p.name] || "value";
      });
      return `import requests
import json

url = "https://api.lcode.dev${ep.path}"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = ${JSON.stringify(bodyParams, null, 4).replace(/\n/g, "\n")}

response = requests.post(url, headers=headers, data=json.dumps(payload))
print(response.json())`;
    }
  };

  // Build sidebar structure dynamically
  const sidebarNavItems = [
    {
      title: "Guide",
      items: [
        { label: "Getting Started", href: "#getting-started", icon: BookOpen },
        { label: "Authentication", href: "#authentication", icon: Lock },
        { label: "Rate Limits", href: "#rate-limits", icon: Activity },
        { label: "Error Codes", href: "#error-codes", icon: AlertCircle },
      ]
    },
    ...categories.map(cat => ({
      title: cat.name,
      items: cat.endpoints.map(ep => ({
        label: ep.name,
        href: `#endpoint-${ep.slug}`,
        icon: getCategoryIcon(cat.slug)
      }))
    }))
  ];

  return (
    <>
      <Navbar />
      
      {/* Top Background Glow Effect */}
      <div className="absolute top-[72px] left-1/4 -translate-x-1/2 w-96 h-96 rounded-full bg-accent/5 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[500px] right-10 w-80 h-80 rounded-full bg-accent/5 blur-[100px] pointer-events-none -z-10" />

      <main className="flex-1 max-w-7xl mx-auto px-6 w-full pt-28 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sticky Sidebar (Desktop only) */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-28 h-[calc(100vh-140px)] overflow-y-auto pr-4 scrollbar-thin">
            {loading ? (
              <div className="text-xs text-text-tertiary animate-pulse">Loading sidebar navigation...</div>
            ) : (
              <nav className="space-y-6">
                {sidebarNavItems.map((group) => (
                  <div key={group.title} className="space-y-2">
                    <h4 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider pl-3">
                      {group.title}
                    </h4>
                    <ul className="space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.href.replace("#", "");
                        return (
                          <li key={item.label}>
                            <a
                              href={item.href}
                              onClick={(e) => scrollToSection(e, item.href)}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                isActive 
                                  ? "bg-accent/10 border-l-[3px] border-accent text-accent font-medium pl-2.5" 
                                  : "text-text-secondary hover:text-text-primary hover:bg-bg-secondary/40"
                              }`}
                            >
                              <Icon className={`w-4.5 h-4.5 ${isActive ? "text-accent" : "text-text-tertiary"}`} />
                              <span className="truncate">{item.label}</span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </nav>
            )}
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-14">
            
            {/* Header Title Section */}
            <div className="space-y-3 border-b border-border/60 pb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-medium text-accent">
                <Terminal className="w-3.5 h-3.5" />
                <span>Developer Reference</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-text-primary via-text-primary to-accent bg-clip-text text-transparent">
                Documentation
              </h1>
              <p className="text-text-secondary text-base md:text-lg">
                Pelajari seluruh endpoint Lcode API secara interaktif.
              </p>
            </div>

            {/* Quick Navigation Cards (Mobile only) */}
            {!loading && (
              <div className="lg:hidden grid grid-cols-2 gap-3 pb-2 border-b border-border/40 max-h-48 overflow-y-auto">
                {sidebarNavItems.flatMap(g => g.items).map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.href.replace("#", "");
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={(e) => scrollToSection(e, item.href)}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition-all duration-200 ${
                        isActive 
                          ? "bg-accent/10 border-accent/40 text-accent font-medium" 
                          : "bg-bg-secondary/30 border-white/[0.08] text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </a>
                  );
                })}
              </div>
            )}

            {/* Content Sections */}
            <div className="space-y-16">
              
              {/* Getting Started Section */}
              <section id="getting-started" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-2 text-xl md:text-2xl font-bold text-text-primary">
                  <BookOpen className="w-5 h-5 text-accent" />
                  <h2>Getting Started</h2>
                </div>
                <p className="text-text-secondary leading-relaxed">
                  Lcode API menyediakan serangkaian REST API yang cepat, aman, dan mudah diintegrasikan untuk aplikasi modern Anda. Semua request dikirimkan ke base URL di bawah ini menggunakan skema HTTPS.
                </p>
                <div className="p-4 bg-bg-secondary/40 backdrop-blur-md border border-white/[0.08] rounded-2xl flex items-center justify-between gap-4">
                  <div className="font-mono text-sm overflow-x-auto whitespace-nowrap text-text-primary">
                    <span className="text-text-tertiary">BASE URL:</span> <span className="text-accent font-semibold">https://api.lcode.dev</span>
                  </div>
                  <button
                    onClick={() => handleCopy("https://api.lcode.dev", "baseurl")}
                    className="p-2 text-text-secondary hover:text-text-primary bg-bg-tertiary/40 border border-white/[0.08] rounded-xl hover:border-accent/40 transition-all flex-shrink-0"
                    aria-label="Copy Base URL"
                  >
                    {copiedId === "baseurl" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </section>

              {/* Authentication Section */}
              <section id="authentication" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-2 text-xl md:text-2xl font-bold text-text-primary">
                  <Lock className="w-5 h-5 text-accent" />
                  <h2>Authentication</h2>
                </div>
                <p className="text-text-secondary leading-relaxed">
                  Semua permintaan API memerlukan autentikasi menggunakan **API Key**. Daftarkan akun Anda terlebih dahulu untuk mendapatkan kunci API di panel Dashboard Anda. Gunakan kunci tersebut dengan menambahkannya pada header request sebagai token bearer.
                </p>
                <div className="bg-bg-secondary/30 border border-white/[0.08] rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 bg-bg-secondary/80 border-b border-white/[0.06] flex items-center gap-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    <Code className="w-3.5 h-3.5 text-accent" />
                    <span>Header Autentikasi</span>
                  </div>
                  <div className="p-4 bg-[#0A0A0A] font-mono text-sm text-text-primary overflow-x-auto">
                    <code>Authorization: Bearer YOUR_API_KEY</code>
                  </div>
                </div>
              </section>

              {/* Rate Limits Section */}
              <section id="rate-limits" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-2 text-xl md:text-2xl font-bold text-text-primary">
                  <Activity className="w-5 h-5 text-accent" />
                  <h2>Rate Limits</h2>
                </div>
                <p className="text-text-secondary leading-relaxed">
                  Lcode API menerapkan batas kecepatan request (rate limiting) untuk menjamin performa server tetap optimal bagi seluruh pengembang. Detail pembatasan diatur berdasarkan paket langganan Anda.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 bg-bg-secondary/40 border border-white/[0.08] rounded-2xl space-y-1">
                    <span className="text-xs text-text-tertiary uppercase font-medium">Batas Gratis</span>
                    <p className="text-lg font-bold text-text-primary">60 req / menit</p>
                  </div>
                  <div className="p-4 bg-bg-secondary/40 border border-white/[0.08] rounded-2xl space-y-1">
                    <span className="text-xs text-text-tertiary uppercase font-medium">Header Limit</span>
                    <p className="text-lg font-mono text-sm text-accent font-semibold">X-RateLimit-Limit</p>
                  </div>
                  <div className="p-4 bg-bg-secondary/40 border border-white/[0.08] rounded-2xl space-y-1">
                    <span className="text-xs text-text-tertiary uppercase font-medium">Header Sisa</span>
                    <p className="text-lg font-mono text-sm text-accent font-semibold">X-RateLimit-Remaining</p>
                  </div>
                </div>
              </section>

              {/* Error Codes Section */}
              <section id="error-codes" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-2 text-xl md:text-2xl font-bold text-text-primary">
                  <AlertCircle className="w-5 h-5 text-accent" />
                  <h2>Error Codes</h2>
                </div>
                <p className="text-text-secondary leading-relaxed">
                  Lcode API menggunakan kode status HTTP standar untuk menunjukkan keberhasilan atau kegagalan sebuah request API.
                </p>

                {/* Desktop and Mobile responsive Table */}
                <div className="border border-white/[0.08] rounded-3xl overflow-hidden bg-bg-secondary/20 backdrop-blur-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-bg-secondary/60 border-b border-white/[0.06] text-xs font-semibold text-text-secondary uppercase tracking-wider">
                          <th className="px-5 py-3">Status Code</th>
                          <th className="px-5 py-3">Deskripsi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 text-sm text-text-secondary">
                        {errorCodes.map((item) => (
                          <tr key={item.status} className="hover:bg-bg-secondary/30 transition-colors">
                            <td className="px-5 py-3 font-mono font-medium text-text-primary">{item.status}</td>
                            <td className="px-5 py-3">{item.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* Dynamic Categories & Endpoints Render */}
              {loading ? (
                <div className="text-center py-20 text-text-secondary">
                  <span className="inline-block animate-pulse">Memuat dokumentasi endpoint...</span>
                </div>
              ) : (
                categories.map((category) => (
                  <div key={category.slug} className="space-y-12">
                    <div className="border-t border-border/40 pt-10" />
                    
                    <div className="space-y-2">
                      <h2 className="text-2xl font-extrabold text-accent tracking-tight flex items-center gap-2">
                        {category.name}
                      </h2>
                      <p className="text-xs text-text-tertiary">
                        Daftar API pada kategori {category.name}.
                      </p>
                    </div>

                    {category.endpoints.map((ep) => {
                      const spec = getSpecByRoute(ep.path) || getSpecBySlug(ep.slug);
                      const currentTab = activeTabMap[ep.id] || "curl";
                      
                      const curlCode = getCurlSnippet(ep, spec);
                      const jsCode = getJsSnippet(ep, spec);
                      const pythonCode = getPythonSnippet(ep, spec);
                      
                      const activeCodeSnippet = 
                        currentTab === "curl" ? curlCode :
                        currentTab === "js" ? jsCode : pythonCode;

                      const responseExample = spec?.responseExample || JSON.stringify({ status: true, message: "Success" }, null, 2);

                      return (
                        <section key={ep.id} id={`endpoint-${ep.slug}`} className="scroll-mt-28 space-y-6">
                          
                          {/* Endpoint Title */}
                          <div className="space-y-2">
                            <div className="flex items-baseline gap-2">
                              <h3 className="text-lg font-bold text-text-primary">{ep.name}</h3>
                              <span className="text-[10px] text-text-tertiary font-mono">({ep.slug})</span>
                            </div>
                            <p className="text-sm text-text-secondary leading-relaxed">
                              {ep.description}
                            </p>
                          </div>

                          {/* Path & Method Display */}
                          <div className="p-4 bg-bg-secondary/40 backdrop-blur-md border border-white/[0.08] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-3 font-mono text-sm">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                ep.method === "GET" 
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                  : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                              }`}>{ep.method}</span>
                              <span className="text-text-primary font-semibold">{ep.path}</span>
                            </div>
                            
                            <button
                              onClick={() => handleCopy(ep.path, `${ep.id}-path`)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary bg-bg-tertiary/60 hover:bg-bg-tertiary border border-white/[0.08] rounded-full hover:border-accent/40 transition-all cursor-pointer"
                            >
                              {copiedId === `${ep.id}-path` ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Copied Path</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy Path</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Parameters Table */}
                          {spec && spec.parameters && spec.parameters.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-xs font-semibold uppercase text-text-tertiary tracking-wider pl-1">Parameters</h4>
                              <div className="border border-white/[0.08] rounded-2xl overflow-hidden bg-bg-secondary/15 backdrop-blur-sm">
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="bg-bg-secondary/60 border-b border-white/[0.08] text-xs font-semibold text-text-secondary uppercase tracking-wider">
                                      <th className="px-4 py-2.5">Parameter</th>
                                      <th className="px-4 py-2.5">Type</th>
                                      <th className="px-4 py-2.5 text-center">Required</th>
                                      <th className="px-4 py-2.5">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-border/60 text-xs text-text-secondary">
                                    {spec.parameters.map((param) => (
                                      <tr key={param.name} className="hover:bg-bg-secondary/10 transition-colors">
                                        <td className="px-4 py-2.5 font-mono font-semibold text-text-primary">{param.name}</td>
                                        <td className="px-4 py-2.5"><span className="px-1.5 py-0.2 bg-bg-tertiary rounded border border-border font-mono text-[10px]">{param.type}</span></td>
                                        <td className="px-4 py-2.5 text-center">
                                          {param.required ? (
                                            <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">Yes</span>
                                          ) : (
                                            <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-text-tertiary/10 text-text-tertiary border border-border/80">No</span>
                                          )}
                                        </td>
                                        <td className="px-4 py-2.5 leading-relaxed">{param.description}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {/* Code Request Example Tabs */}
                          <div className="space-y-2">
                            <h4 className="text-xs font-semibold uppercase text-text-tertiary tracking-wider pl-1">Request Example</h4>
                            <div className="bg-bg-secondary/20 border border-white/[0.08] rounded-3xl overflow-hidden">
                              <div className="flex border-b border-white/[0.06] bg-bg-secondary/50 px-2 pt-1 gap-1">
                                {(["curl", "js", "python"] as const).map((tab) => (
                                  <button
                                    key={tab}
                                    onClick={() => setActiveTabMap(prev => ({ ...prev, [ep.id]: tab }))}
                                    className={`px-4 py-2 text-xs font-medium border-b-2 transition-all cursor-pointer ${
                                      currentTab === tab
                                        ? "border-accent text-accent font-semibold"
                                        : "border-transparent text-text-tertiary hover:text-text-secondary"
                                    }`}
                                  >
                                    {tab === "curl" ? "cURL" : tab === "js" ? "JavaScript" : "Python"}
                                  </button>
                                ))}
                              </div>

                              <div className="relative">
                                <pre className="p-4 bg-[#0A0A0A] overflow-x-auto text-xs font-mono text-text-primary leading-relaxed scrollbar-thin max-h-64">
                                  <code>{activeCodeSnippet}</code>
                                </pre>
                                
                                <button
                                  onClick={() => handleCopy(activeCodeSnippet, `${ep.id}-code`)}
                                  className="absolute right-3 top-3 p-1.5 bg-bg-tertiary/40 border border-white/[0.08] text-text-secondary hover:text-text-primary rounded-lg transition-all"
                                  aria-label="Copy Request Code"
                                >
                                  {copiedId === `${ep.id}-code` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Dynamic JSON Response Block */}
                          <div className="space-y-2">
                            <h4 className="text-xs font-semibold uppercase text-text-tertiary tracking-wider pl-1">Response Example</h4>
                            <div className="relative border border-white/[0.08] rounded-3xl overflow-hidden">
                              <div className="px-4 py-2 bg-bg-secondary/40 border-b border-white/[0.06] flex items-center justify-between text-xs text-text-tertiary">
                                <span className="font-semibold uppercase tracking-wider font-mono">application/json</span>
                                <span className="text-emerald-400 font-mono font-bold">200 OK</span>
                              </div>
                              
                              <pre className="p-4 bg-[#0A0A0A] overflow-x-auto text-xs font-mono text-text-primary leading-relaxed scrollbar-thin max-h-64">
                                <code>{responseExample}</code>
                              </pre>

                              <button
                                onClick={() => handleCopy(responseExample, `${ep.id}-response`)}
                                className="absolute right-3 top-[44px] p-1.5 bg-bg-tertiary/40 border border-white/[0.08] text-text-secondary hover:text-text-primary rounded-lg transition-all"
                                aria-label="Copy Response JSON"
                              >
                                {copiedId === `${ep.id}-response` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                        </section>
                      );
                    })}
                  </div>
                ))
              )}

            </div>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}

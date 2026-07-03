"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Play, 
  Code as CodeIcon, 
  Info, 
  Terminal, 
  Check, 
  Copy, 
  ArrowLeft, 
  Cpu, 
  Database, 
  Globe, 
  Key, 
  ShieldAlert,
  Loader2,
  AlertTriangle
} from "lucide-react";

interface ApiParam {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

interface ApiDetail {
  slug: string;
  name: string;
  description: string;
  method: "GET" | "POST";
  path: string;
  requests: string;
  status: "Online" | "Maintenance";
  isPremium: boolean;
  parameters: ApiParam[];
  responseExample: string;
  defaultPlaygroundParams: Record<string, string>;
}

// Database of all detailed API specs
const apisDetailData: Record<string, ApiDetail> = {
  "ai-chat-completion": {
    slug: "ai-chat-completion",
    name: "AI Chat Completion",
    description: "Hubungkan aplikasi Anda ke kecerdasan buatan (AI) canggih untuk percakapan alami, pembuatan teks kustom, dan penyelesaian tugas cerdas.",
    method: "GET",
    path: "/api/ai/chat",
    requests: "1.240.490",
    status: "Online",
    isPremium: false,
    parameters: [
      { name: "message", type: "string", required: true, description: "Pesan atau pertanyaan yang ingin dikirimkan ke model AI." },
      { name: "model", type: "string", required: false, description: "Model AI yang digunakan. Pilihan: gpt-4, gpt-3.5 (default: gpt-4)." }
    ],
    responseExample: `{
  "status": true,
  "result": "Halo! Saya adalah asisten AI Lcode. Ada yang bisa saya bantu hari ini?"
}`,
    defaultPlaygroundParams: { message: "Halo, siapa pencipta kamu?", model: "gpt-4" }
  },
  "quillbot-ai-chat": {
    slug: "quillbot-ai-chat",
    name: "Quillbot AI Chat",
    description: "Hubungkan ke AI Quillbot Chat untuk percakapan alami, menjawab pertanyaan, dan interaksi chat pintar.",
    method: "GET",
    path: "/api/quillbot",
    requests: "210.840",
    status: "Online",
    isPremium: false,
    parameters: [
      { name: "text", type: "string", required: true, description: "Pesan atau pertanyaan yang ingin dikirimkan ke Quillbot." },
      { name: "apikey", type: "string", required: true, description: "Kunci API Developer Lcode Anda." }
    ],
    responseExample: `{
  "status": true,
  "code": 200,
  "creator": "LeviCodex",
  "result": "Halo! Saya adalah Quillbot AI. Ada yang bisa saya bantu hari ini?"
}`,
    defaultPlaygroundParams: { text: "Halo, siapa kamu?" }
  },
  "ai-text-to-image": {
    slug: "ai-text-to-image",
    name: "AI Text to Image",
    description: "Buat gambar berkualitas tinggi dan sangat artistik secara otomatis hanya dari deskripsi teks (prompt) menggunakan model difusi termutakhir.",
    method: "POST",
    path: "/api/ai/text-to-image",
    requests: "840.120",
    status: "Online",
    isPremium: true,
    parameters: [
      { name: "prompt", type: "string", required: true, description: "Deskripsi detail tentang gambar yang ingin Anda buat." },
      { name: "aspect_ratio", type: "string", required: false, description: "Rasio aspek gambar. Pilihan: 1:1, 16:9, 9:16 (default: 1:1)." }
    ],
    responseExample: `{
  "status": true,
  "result": "https://api.lcode.dev/storage/generated-image-123.png"
}`,
    defaultPlaygroundParams: { prompt: "Futuristic city with neon lights and flying cars, cyberpunk style, hyper-detailed, 8k", aspect_ratio: "16:9" }
  },
  "sentiment-analysis": {
    slug: "sentiment-analysis",
    name: "Sentiment Analysis",
    description: "Analisis emosi dan sentimen (positif, negatif, atau netral) dari teks secara real-time. Cocok untuk memantau ulasan produk atau media sosial.",
    method: "POST",
    path: "/api/ai/sentiment",
    requests: "340.510",
    status: "Online",
    isPremium: false,
    parameters: [
      { name: "text", type: "string", required: true, description: "Teks yang ingin dianalisis sentimennya." }
    ],
    responseExample: `{
  "status": true,
  "result": {
    "sentiment": "positive",
    "score": 0.95,
    "breakdown": {
      "positive": 0.95,
      "neutral": 0.04,
      "negative": 0.01
    }
  }
}`,
    defaultPlaygroundParams: { text: "Saya sangat senang menggunakan layanan Lcode API! Responnya sangat cepat." }
  },
  "canva-template-render": {
    slug: "canva-template-render",
    name: "Canva Template Render",
    description: "Render template desain Canva secara dinamis lewat kode dengan mengubah nilai teks, gambar, dan elemen warna secara otomatis.",
    method: "POST",
    path: "/api/canva/render",
    requests: "450.230",
    status: "Online",
    isPremium: true,
    parameters: [
      { name: "template_id", type: "string", required: true, description: "ID template Canva yang sudah didaftarkan." },
      { name: "title", type: "string", required: true, description: "Teks judul baru untuk menggantikan teks bawaan template." },
      { name: "image_url", type: "string", required: false, description: "URL gambar baru untuk mengganti gambar placeholder." }
    ],
    responseExample: `{
  "status": true,
  "result": "https://api.lcode.dev/storage/canva-rendered-99.png"
}`,
    defaultPlaygroundParams: { template_id: "tpl_banner_01", title: "Promo Spesial Akhir Tahun!", image_url: "https://api.lcode.dev/assets/promo.jpg" }
  },
  "canva-asset-exporter": {
    slug: "canva-asset-exporter",
    name: "Canva Asset Exporter",
    description: "Export desain Canva Anda secara instan ke berbagai format (PDF, PNG, JPG) beresolusi tinggi langsung melalui API.",
    method: "GET",
    path: "/api/canva/export",
    requests: "210.840",
    status: "Online",
    isPremium: true,
    parameters: [
      { name: "design_id", type: "string", required: true, description: "ID desain Canva Anda." },
      { name: "format", type: "string", required: true, description: "Format output file. Pilihan: pdf, png, jpg." }
    ],
    responseExample: `{
  "status": true,
  "result": "https://api.lcode.dev/storage/exported-asset.pdf"
}`,
    defaultPlaygroundParams: { design_id: "des_987654321", format: "pdf" }
  },
  "tiktok-downloader": {
    slug: "tiktok-downloader",
    name: "TikTok Downloader",
    description: "Ambil link download video TikTok tanpa watermark, audio musik MP3, serta cover video secara mudah dengan memasukkan link postingan.",
    method: "GET",
    path: "/api/download/tiktok",
    requests: "3.240.500",
    status: "Online",
    isPremium: false,
    parameters: [
      { name: "url", type: "string", required: true, description: "Tautan URL postingan video TikTok." }
    ],
    responseExample: `{
  "status": true,
  "result": {
    "title": "Video Lucu Kucing Hari Ini",
    "author": "cat_lover",
    "video_no_watermark": "https://video.tiktokcdn.com/example-nowm.mp4",
    "audio": "https://video.tiktokcdn.com/example-music.mp3"
  }
}`,
    defaultPlaygroundParams: { url: "https://www.tiktok.com/@tiktok/video/7123456789012345678" }
  },
  "youtube-mp3-converter": {
    slug: "youtube-mp3-converter",
    name: "YouTube MP3 Converter",
    description: "Konversi video YouTube menjadi file audio MP3 berkualitas tinggi (hingga 320kbps) dengan proses ekstraksi super cepat.",
    method: "GET",
    path: "/api/download/ytmp3",
    requests: "5.120.430",
    status: "Online",
    isPremium: false,
    parameters: [
      { name: "url", type: "string", required: true, description: "Tautan URL video YouTube yang ingin dikonversi." }
    ],
    responseExample: `{
  "status": true,
  "result": {
    "title": "Lofi Chill Beats for Coding",
    "duration": 3600,
    "audio_url": "https://api.lcode.dev/storage/yt-audio-lofi.mp3",
    "size": "82.4 MB"
  }
}`,
    defaultPlaygroundParams: { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
  },
  "instagram-post-downloader": {
    slug: "instagram-post-downloader",
    name: "Instagram Post Downloader",
    description: "Ekstrak dan download konten dari Instagram (Reels, Postingan Foto/Video, Carousel) langsung ke server Anda.",
    method: "GET",
    path: "/api/download/instagram",
    requests: "2.840.110",
    status: "Online",
    isPremium: false,
    parameters: [
      { name: "url", type: "string", required: true, description: "Tautan URL postingan Instagram." }
    ],
    responseExample: `{
  "status": true,
  "result": {
    "type": "carousel",
    "caption": "Liburan seru!",
    "media": [
      "https://instagram.com/p/example-image1.jpg",
      "https://instagram.com/p/example-image2.jpg"
    ]
  }
}`,
    defaultPlaygroundParams: { url: "https://www.instagram.com/p/Cg123456789/" }
  },
  "ai-background-remover": {
    slug: "ai-background-remover",
    name: "AI Background Remover",
    description: "Hapus latar belakang gambar secara otomatis hanya dalam hitungan detik. Sempurna untuk e-commerce dan profil profesional.",
    method: "POST",
    path: "/api/image/removebg",
    requests: "1.890.320",
    status: "Online",
    isPremium: true,
    parameters: [
      { name: "image_url", type: "string", required: true, description: "Tautan URL langsung (direct link) ke file gambar." }
    ],
    responseExample: `{
  "status": true,
  "result": "https://api.lcode.dev/storage/removed-bg-image.png"
}`,
    defaultPlaygroundParams: { image_url: "https://api.lcode.dev/assets/sample-portrait.jpg" }
  },
  "image-optimizer": {
    slug: "image-optimizer",
    name: "Image Optimizer",
    description: "Kompres ukuran file gambar secara optimal tanpa mengorbankan ketajaman dan detail piksel asli gambar.",
    method: "POST",
    path: "/api/image/compress",
    requests: "920.400",
    status: "Online",
    isPremium: false,
    parameters: [
      { name: "image_url", type: "string", required: true, description: "Tautan URL langsung gambar." },
      { name: "quality", type: "number", required: false, description: "Kualitas output gambar (1-100, default: 80)." }
    ],
    responseExample: `{
  "status": true,
  "result": {
    "original_size": "2.4 MB",
    "optimized_size": "480 KB",
    "saved_percent": "80%",
    "optimized_url": "https://api.lcode.dev/storage/optimized-image.jpg"
  }
}`,
    defaultPlaygroundParams: { image_url: "https://api.lcode.dev/assets/huge-banner.png", quality: "75" }
  },
  "dynamic-image-resizer": {
    slug: "dynamic-image-resizer",
    name: "Dynamic Image Resizer",
    description: "Ubah ukuran resolusi lebar (width) dan tinggi (height) gambar Anda secara proporsional atau fit-crop.",
    method: "POST",
    path: "/api/image/resize",
    requests: "640.150",
    status: "Online",
    isPremium: false,
    parameters: [
      { name: "image_url", type: "string", required: true, description: "Tautan URL langsung gambar." },
      { name: "width", type: "number", required: true, description: "Lebar gambar baru dalam pixel." },
      { name: "height", type: "number", required: true, description: "Tinggi gambar baru dalam pixel." }
    ],
    responseExample: `{
  "status": true,
  "result": "https://api.lcode.dev/storage/resized-image.jpg"
}`,
    defaultPlaygroundParams: { image_url: "https://api.lcode.dev/assets/hero.jpg", width: "800", height: "600" }
  },
  "custom-qr-generator": {
    slug: "custom-qr-generator",
    name: "Custom QR Generator",
    description: "Buat kode QR bergaya futuristik dengan warna gradasi, logo di tengah, dan modifikasi sudut border.",
    method: "GET",
    path: "/api/util/qrcode",
    requests: "830.100",
    status: "Online",
    isPremium: false,
    parameters: [
      { name: "text", type: "string", required: true, description: "Teks atau URL yang ingin disimpan di dalam kode QR." },
      { name: "color", type: "string", required: false, description: "Warna utama kode QR (format Hex, default: #000000)." }
    ],
    responseExample: `{
  "status": true,
  "result": "https://api.lcode.dev/storage/qr-code-generated.png"
}`,
    defaultPlaygroundParams: { text: "https://api.lcode.dev", color: "#EA580C" }
  },
  "url-shortener-tracker": {
    slug: "url-shortener-tracker",
    name: "URL Shortener & Tracker",
    description: "Buat link pendek kustom (alias) yang mudah diingat sekaligus lacak statistik lengkap jumlah klik pengunjung.",
    method: "POST",
    path: "/api/util/shorten",
    requests: "1.490.200",
    status: "Online",
    isPremium: false,
    parameters: [
      { name: "url", type: "string", required: true, description: "Tautan panjang asli yang ingin dipendekkan." },
      { name: "alias", type: "string", required: false, description: "Kustom nama pendek tautan (opsional)." }
    ],
    responseExample: `{
  "status": true,
  "result": {
    "original_url": "https://www.google.com/search?q=lcode+api",
    "short_url": "https://lco.de/google-api",
    "alias": "google-api"
  }
}`,
    defaultPlaygroundParams: { url: "https://api.lcode.dev/docs#ai-chat", alias: "chatdocs" }
  },
  "ip-geolocation-details": {
    slug: "ip-geolocation-details",
    name: "IP Geolocation Details",
    description: "Dapatkan info lokasi wilayah, kota, kode pos, penyedia internet (ISP), serta koordinat lintang/bujur dari alamat IP target.",
    method: "GET",
    path: "/api/util/ip",
    requests: "2.150.900",
    status: "Online",
    isPremium: false,
    parameters: [
      { name: "ip", type: "string", required: true, description: "Alamat IP publik (IPv4/IPv6) yang ingin dilacak." }
    ],
    responseExample: `{
  "status": true,
  "result": {
    "ip": "8.8.8.8",
    "country": "United States",
    "city": "Mountain View",
    "zip": "94043",
    "isp": "Google LLC",
    "timezone": "America/Los_Angeles"
  }
}`,
    defaultPlaygroundParams: { ip: "8.8.8.8" }
  },
  "google-search-api": {
    slug: "google-search-api",
    name: "Google Search API",
    description: "Gunakan API scraping Google Search berkecepatan tinggi ini untuk mengambil data organik mesin pencari secara bersih tanpa batas blokir.",
    method: "GET",
    path: "/api/search/google",
    requests: "1.980.450",
    status: "Online",
    isPremium: true,
    parameters: [
      { name: "q", type: "string", required: true, description: "Kata kunci pencarian Google." },
      { name: "page", type: "number", required: false, description: "Halaman pencarian hasil (default: 1)." }
    ],
    responseExample: `{
  "status": true,
  "result": [
    {
      "title": "Lcode API — Powerful APIs for Modern Applications",
      "link": "https://api.lcode.dev",
      "snippet": "Lcode API provides fast, secure, and scalable APIs for developers."
    }
  ]
}`,
    defaultPlaygroundParams: { q: "lcode api documentation", page: "1" }
  },
  "anime-character-finder": {
    slug: "anime-character-finder",
    name: "Anime Character Finder",
    description: "Dapatkan profil lengkap karakter anime, aktor pengisi suara (seiyuu), gambar galeri, dan daftar kemunculan serinya.",
    method: "GET",
    path: "/api/search/anime",
    requests: "320.100",
    status: "Online",
    isPremium: false,
    parameters: [
      { name: "name", type: "string", required: true, description: "Nama karakter anime yang ingin dicari." }
    ],
    responseExample: `{
  "status": true,
  "result": {
    "name": "Monkey D. Luffy",
    "anime": "One Piece",
    "role": "Main",
    "voice_actor": "Mayumi Tanaka",
    "image": "https://api.lcode.dev/assets/luffy.jpg"
  }
}`,
    defaultPlaygroundParams: { name: "Luffy" }
  },
  "duckduckgo-web-search": {
    slug: "duckduckgo-web-search",
    name: "DuckDuckGo Web Search",
    description: "Dapatkan data pencarian DuckDuckGo secara bersih, cepat, dan sepenuhnya aman untuk privasi tanpa log aktivitas.",
    method: "GET",
    path: "/api/search/ddg",
    requests: "480.290",
    status: "Online",
    isPremium: false,
    parameters: [
      { name: "q", type: "string", required: true, description: "Kata kunci pencarian." }
    ],
    responseExample: `{
  "status": true,
  "result": [
    {
      "title": "DuckDuckGo — Privacy, simplified.",
      "link": "https://duckduckgo.com",
      "snippet": "The internet privacy company that empowers you to seamlessly take control."
    }
  ]
}`,
    defaultPlaygroundParams: { q: "next.js 15 routing" }
  }
};

import { getSpecBySlug, getSpecByRoute } from "@/lib/api-specs";

export default function ApiDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [api, setApi] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "code" | "playground">("info");
  const [activeLang, setActiveLang] = useState<"js" | "python" | "php" | "curl">("curl");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Playground States
  const [playgroundParams, setPlaygroundParams] = useState<Record<string, string>>({});
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [playgroundResponse, setPlaygroundResponse] = useState<string>("");
  const [isSimulated, setIsSimulated] = useState(false);
  const [playgroundStatusCode, setPlaygroundStatusCode] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/apis?slug=${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("API not found");
        return res.json();
      })
      .then((data) => {
        if (data.endpoint) {
          const spec = getSpecBySlug(slug) || getSpecByRoute(data.endpoint.route);
          setApi({
            ...data.endpoint,
            path: spec?.path || data.endpoint.route,
            parameters: spec?.parameters || [],
            responseExample: spec?.responseExample || JSON.stringify({ status: true, message: "Success" }, null, 2),
            defaultPlaygroundParams: spec?.defaultPlaygroundParams || {},
            isPremium: data.endpoint.accessLevel !== "FREE"
          });
          setPlaygroundParams(spec?.defaultPlaygroundParams || {});
        }
      })
      .catch((err) => {
        console.error("Fetch API detail error:", err);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const updateParamValue = (name: string, value: string) => {
    setPlaygroundParams((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExecutePlayground = () => {
    setIsLoading(true);
    setIsSimulated(false);
    setPlaygroundStatusCode(null);
    
    if (apiKey.trim() === "") {
      // Simulate API Response using local specs example
      setTimeout(() => {
        setPlaygroundResponse(api.responseExample);
        setIsSimulated(true);
        setPlaygroundStatusCode(200);
        setIsLoading(false);
      }, 1000);
    } else {
      // Make real gateway call to authenticate, measure duration and output real result
      const headers: Record<string, string> = {
        "Authorization": `Bearer ${apiKey.trim()}`
      };
      
      let fetchPromise: Promise<Response>;
      const queryStr = Object.entries(playgroundParams)
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join("&");

      const finalPath = api.route; // E.g. /api/v1/download/tiktok
      
      if (api.method === "GET") {
        fetchPromise = fetch(`${finalPath}${queryStr ? `?${queryStr}` : ""}`, {
          method: "GET",
          headers
        });
      } else {
        headers["Content-Type"] = "application/json";
        fetchPromise = fetch(finalPath, {
          method: "POST",
          headers,
          body: JSON.stringify(playgroundParams)
        });
      }

      fetchPromise
        .then(async (res) => {
          setPlaygroundStatusCode(res.status);
          const data = await res.json();
          setPlaygroundResponse(JSON.stringify(data, null, 2));
        })
        .catch((err) => {
          setPlaygroundStatusCode(500);
          setPlaygroundResponse(JSON.stringify({ error: err.message || "Failed to contact gateway server" }, null, 2));
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  // Generate code examples dynamically
  const getCodeSnippet = (lang: typeof activeLang) => {
    const queryStr = Object.entries(playgroundParams)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    
    const fullUrl = `https://api.lcode.dev${api.path}${queryStr ? `?${queryStr}` : ""}`;

    switch (lang) {
      case "curl":
        return `curl -X ${api.method} "${fullUrl}" \\
  -H "Authorization: Bearer YOUR_API_KEY"`;
      case "js":
        return `const response = await fetch("${fullUrl}", {
  method: "${api.method}",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY"
  }
});
const data = await response.json();
console.log(data);`;
      case "python":
        return `import requests

url = "${fullUrl}"
headers = {
    "Authorization": "Bearer YOUR_API_KEY"
}

response = requests.request("${api.method}", url, headers=headers)
print(response.json())`;
      case "php":
        return `<?php

$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "${fullUrl}",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => "${api.method}",
  CURLOPT_HTTPHEADER => [
    "Authorization: Bearer YOUR_API_KEY"
  ],
]);

$response = curl_exec($curl);
curl_close($curl);
echo $response;`;
    }
  };

  if (loading || !api) {
    return (
      <>
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto px-6 w-full pt-28 pb-16 text-center text-text-secondary min-h-[60vh] flex flex-col justify-center items-center">
          <span className="inline-block animate-pulse text-base font-medium">Memuat detail API...</span>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* Background Glow */}
      <div className="absolute top-[72px] right-10 w-96 h-96 rounded-full bg-accent/5 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[400px] left-10 w-80 h-80 rounded-full bg-accent/5 blur-[100px] pointer-events-none -z-10" />

      <main className="flex-1 max-w-5xl mx-auto px-6 w-full pt-28 pb-16">
        
        {/* Back navigation */}
        <Link 
          href="/apis"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary hover:text-accent transition-colors mb-6 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Kembali ke API Catalog</span>
        </Link>

        {/* API Details Header */}
        <div className="space-y-4 border-b border-border pb-8 mb-8">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className={`px-2.5 py-0.5 text-xs font-bold rounded border ${
              api.method === "GET" 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
            }`}>
              {api.method}
            </span>

            <span className="flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded bg-emerald-500/5 text-emerald-400 border border-emerald-500/10">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>READY / ONLINE</span>
            </span>

            <span className={`px-2.5 py-0.5 text-xs font-bold rounded border ${
              api.isPremium 
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                : "bg-text-tertiary/10 text-text-secondary border-border/80"
            }`}>
              {api.isPremium ? "PREMIUM" : "FREE"}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-text-primary">
            {api.name}
          </h1>
          <p className="text-text-secondary text-sm md:text-base max-w-3xl leading-relaxed">
            {api.description}
          </p>

          <div className="p-3 bg-bg-secondary/40 backdrop-blur-md border border-white/[0.08] rounded-2xl flex items-center justify-between gap-4 font-mono text-xs md:text-sm max-w-2xl">
            <span className="text-text-tertiary">ENDPOINT:</span>
            <span className="text-text-primary font-semibold select-all break-all">{api.path}</span>
            <button
              onClick={() => handleCopy(api.path, "endpoint")}
              className="p-1.5 text-text-secondary hover:text-text-primary bg-bg-tertiary/50 rounded border border-white/[0.08] cursor-pointer flex-shrink-0"
            >
              {copiedId === "endpoint" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex border-b border-white/[0.08] mb-8 bg-bg-secondary/20 rounded-t-2xl overflow-hidden">
          {([
            { id: "info", label: "Overview & Info", icon: Info },
            { id: "code", label: "Code Example", icon: CodeIcon },
            { id: "playground", label: "Live Playground", icon: Play },
          ] as const).map((tab) => {
            const TabIcon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-3.5 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                  isSelected
                    ? "border-accent text-accent bg-accent/5 font-bold"
                    : "border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-secondary/40"
                }`}
              >
                <TabIcon className="w-4 h-4 flex-shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="space-y-8 min-h-[400px]">
          
          {/* 1. INFO TAB CONTENT */}
          {activeTab === "info" && (
            <div className="space-y-8 animate-fadeIn">
              
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-text-primary">Endpoint Overview</h3>
                <div className="border border-white/[0.08] rounded-3xl overflow-hidden bg-bg-secondary/10">
                  <div className="grid grid-cols-2 border-b border-white/[0.08] p-4 text-sm hover:bg-bg-secondary/20">
                    <span className="text-text-tertiary font-medium">Method</span>
                    <span className="font-mono text-text-primary font-bold">{api.method}</span>
                  </div>
                  <div className="grid grid-cols-2 border-b border-border p-4 text-sm hover:bg-bg-secondary/20">
                    <span className="text-text-tertiary font-medium">Path</span>
                    <span className="font-mono text-text-primary">{api.path}</span>
                  </div>
                  <div className="grid grid-cols-2 border-b border-border p-4 text-sm hover:bg-bg-secondary/20">
                    <span className="text-text-tertiary font-medium">Access</span>
                    <span className="text-text-primary">{api.isPremium ? "Premium Subscription Required" : "Free Tier / API Key"}</span>
                  </div>
                  <div className="grid grid-cols-2 p-4 text-sm hover:bg-bg-secondary/20">
                    <span className="text-text-tertiary font-medium">Total Usage</span>
                    <span className="text-text-primary">{api.requests} requests</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-bold text-text-primary">Parameters</h3>
                <div className="border border-white/[0.08] rounded-3xl overflow-hidden bg-bg-secondary/15 backdrop-blur-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-bg-secondary/60 border-b border-white/[0.08] text-xs font-semibold text-text-secondary uppercase tracking-wider">
                          <th className="px-4 py-3.5">Parameter</th>
                          <th className="px-4 py-3.5">Type</th>
                          <th className="px-4 py-3.5 text-center">Required</th>
                          <th className="px-4 py-3.5">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 text-sm text-text-secondary">
                        {api.parameters.map((param: ApiParam) => (
                          <tr key={param.name} className="hover:bg-bg-secondary/20 transition-colors">
                            <td className="px-4 py-3.5 font-mono font-semibold text-text-primary">{param.name}</td>
                            <td className="px-4 py-3.5"><span className="px-2 py-0.5 text-xs font-medium bg-bg-tertiary rounded border border-border text-text-secondary font-mono">{param.type}</span></td>
                            <td className="px-4 py-3.5 text-center">
                              {param.required ? (
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">Yes</span>
                              ) : (
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-text-tertiary/10 text-text-tertiary border border-border/80">No</span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 leading-relaxed text-text-secondary">{param.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-bold text-text-primary">Response Example</h3>
                <div className="relative border border-white/[0.08] rounded-3xl overflow-hidden">
                  <div className="px-4 py-2 bg-bg-secondary/40 border-b border-white/[0.08] flex items-center justify-between text-xs text-text-tertiary font-medium uppercase tracking-wider">
                    <span>application/json</span>
                    <span>200 OK</span>
                  </div>
                  
                  <pre className="p-4 bg-[#0A0A0A] overflow-x-auto text-xs sm:text-sm font-mono text-text-primary leading-relaxed scrollbar-thin">
                    <code>{api.responseExample}</code>
                  </pre>

                  <button
                    onClick={() => handleCopy(api.responseExample, "response_example")}
                    className="absolute right-3 top-[44px] p-2 bg-bg-tertiary/40 border border-border/80 text-text-secondary hover:text-text-primary rounded-lg transition-all cursor-pointer"
                  >
                    {copiedId === "response_example" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* 2. CODE TAB CONTENT */}
          {activeTab === "code" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-lg font-bold text-text-primary">Code Snippets</h3>
                
                <div className="flex bg-bg-secondary/50 border border-white/[0.08] rounded-xl p-1 gap-1">
                  {([
                    { id: "curl", label: "cURL" },
                    { id: "js", label: "JavaScript" },
                    { id: "python", label: "Python" },
                    { id: "php", label: "PHP" },
                  ] as const).map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => setActiveLang(lang.id)}
                      className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                        activeLang === lang.id
                          ? "bg-accent text-white"
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative border border-white/[0.08] rounded-3xl overflow-hidden">
                <div className="px-4 py-2.5 bg-bg-secondary/50 border-b border-white/[0.08] text-xs text-text-tertiary flex items-center justify-between uppercase tracking-wider font-mono">
                  <span>{activeLang === "curl" ? "Bash / cURL" : activeLang === "js" ? "Fetch / JS" : activeLang === "python" ? "Requests / Python" : "cURL / PHP"}</span>
                </div>
                
                <pre className="p-4 bg-[#0A0A0A] overflow-x-auto text-xs sm:text-sm font-mono text-text-primary leading-relaxed scrollbar-thin">
                  <code>{getCodeSnippet(activeLang)}</code>
                </pre>

                <button
                  onClick={() => handleCopy(getCodeSnippet(activeLang), "code_snippet")}
                  className="absolute right-3 top-[44px] p-2 bg-bg-tertiary/40 border border-border/80 text-text-secondary hover:text-text-primary rounded-lg transition-all cursor-pointer"
                >
                  {copiedId === "code_snippet" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* 3. PLAYGROUND TAB CONTENT */}
          {activeTab === "playground" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
              
              <div className="lg:col-span-5 space-y-6">
                <h3 className="text-lg font-bold text-text-primary">Request Parameters</h3>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5 uppercase tracking-wider">
                    <Key className="w-3.5 h-3.5 text-accent" />
                    <span>API Authorization Key</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Bearer token (opsional, kosong = simulasi)"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-bg-secondary/40 border border-white/[0.08] rounded-2xl px-4 py-2.5 text-sm outline-none text-text-primary placeholder-text-tertiary focus:border-accent/40"
                  />
                  <p className="text-[11px] text-text-tertiary leading-relaxed">
                    Kosongkan kolom ini jika ingin menjalankan *simulated request* tanpa memanggil server.
                  </p>
                </div>

                <div className="border border-white/[0.08] bg-bg-secondary/20 p-4 rounded-2xl space-y-4">
                  {api.parameters.map((param: ApiParam) => (
                    <div key={param.name} className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-semibold text-text-primary">{param.name}</span>
                        {param.required && <span className="text-[10px] font-bold text-rose-400">Required</span>}
                      </div>
                      <input
                        type="text"
                        placeholder={`Masukkan ${param.name}`}
                        value={playgroundParams[param.name] || ""}
                        onChange={(e) => updateParamValue(param.name, e.target.value)}
                        className="w-full bg-bg-secondary border border-white/[0.08] rounded-xl px-3 py-2 text-sm outline-none text-text-primary focus:border-accent/40"
                      />
                    </div>
                  ))}

                  <button
                    onClick={handleExecutePlayground}
                    disabled={isLoading}
                    className="w-full py-3 bg-accent hover:bg-accent-hover disabled:bg-bg-tertiary disabled:text-text-tertiary text-white font-bold rounded-full transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_16px_rgba(234,88,12,0.15)]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Executing...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white text-white" />
                        <span>Send Request</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-4">
                <h3 className="text-lg font-bold text-text-primary">Response</h3>
                
                <div className="relative border border-white/[0.08] rounded-3xl overflow-hidden flex flex-col h-[380px]">
                  
                  <div className="px-4 py-3 bg-bg-secondary/40 border-b border-white/[0.08] flex items-center justify-between text-xs text-text-tertiary">
                    <span className="font-semibold uppercase tracking-wider">Output Result</span>
                    {playgroundResponse ? (
                      <span className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        200 OK
                      </span>
                    ) : (
                      <span>No Request Sent</span>
                    )}
                  </div>

                  <div className="flex-1 p-4 bg-[#0A0A0A] font-mono text-xs sm:text-sm text-text-primary overflow-auto leading-relaxed relative">
                    {playgroundResponse ? (
                      <pre><code>{playgroundResponse}</code></pre>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-2">
                        <Terminal className="w-10 h-10 text-text-tertiary animate-pulse" />
                        <p className="text-sm font-semibold text-text-secondary">Siap Menguji?</p>
                        <p className="text-xs text-text-tertiary max-w-[280px]">
                          Isi parameter di samping dan klik tombol **Send Request** untuk melihat hasil output JSON.
                        </p>
                      </div>
                    )}
                  </div>

                  {isSimulated && playgroundResponse && (
                    <div className="px-4 py-2.5 bg-amber-500/10 border-t border-border flex items-center gap-2 text-[11px] text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>**Simulated Response**: Menampilkan contoh data karena dijalankan tanpa API Key.</span>
                    </div>
                  )}

                  {playgroundResponse && (
                    <button
                      onClick={() => handleCopy(playgroundResponse, "playground_res")}
                      className="absolute right-3 top-[52px] p-2 bg-bg-tertiary/40 border border-border/80 text-text-secondary hover:text-text-primary rounded-lg transition-all cursor-pointer"
                    >
                      {copiedId === "playground_res" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}

                </div>
              </div>

            </div>
          )}

        </div>

      </main>

      <Footer />
    </>
  );
}


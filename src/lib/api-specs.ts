export interface ApiParam {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface ApiSpec {
  slug: string;
  name: string;
  description: string;
  method: "GET" | "POST";
  path: string;
  isPremium: boolean;
  parameters: ApiParam[];
  responseExample: string;
  defaultPlaygroundParams: Record<string, string>;
  categorySlug: string;
  categoryName: string;
}

export const apiSpecs: Record<string, ApiSpec> = {
  "ai-chat-completion": {
    slug: "ai-chat-completion",
    name: "AI Chat Completion",
    description: "Hubungkan aplikasi Anda ke kecerdasan buatan (AI) canggih untuk percakapan alami, pembuatan teks kustom, dan penyelesaian tugas cerdas.",
    method: "GET",
    path: "/api/v1/ai/chat",
    isPremium: false,
    categorySlug: "ai-apis",
    categoryName: "AI APIs",
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
    isPremium: false,
    categorySlug: "ai-apis",
    categoryName: "AI APIs",
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
    path: "/api/v1/ai/text-to-image",
    isPremium: true,
    categorySlug: "ai-apis",
    categoryName: "AI APIs",
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
    path: "/api/v1/ai/sentiment",
    isPremium: false,
    categorySlug: "ai-apis",
    categoryName: "AI APIs",
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
    path: "/api/v1/canva/render",
    isPremium: true,
    categorySlug: "canva-apis",
    categoryName: "Canva APIs",
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
    path: "/api/v1/canva/export",
    isPremium: true,
    categorySlug: "canva-apis",
    categoryName: "Canva APIs",
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
    path: "/api/v1/download/tiktok",
    isPremium: false,
    categorySlug: "downloader-apis",
    categoryName: "Downloader APIs",
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
    path: "/api/v1/download/ytmp3",
    isPremium: false,
    categorySlug: "downloader-apis",
    categoryName: "Downloader APIs",
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
    path: "/api/v1/download/instagram",
    isPremium: false,
    categorySlug: "downloader-apis",
    categoryName: "Downloader APIs",
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
    path: "/api/v1/image/removebg",
    isPremium: true,
    categorySlug: "image-apis",
    categoryName: "Image APIs",
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
    path: "/api/v1/image/compress",
    isPremium: false,
    categorySlug: "image-apis",
    categoryName: "Image APIs",
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
    path: "/api/v1/image/resize",
    isPremium: false,
    categorySlug: "image-apis",
    categoryName: "Image APIs",
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
    path: "/api/v1/util/qrcode",
    isPremium: false,
    categorySlug: "utility-apis",
    categoryName: "Utility APIs",
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
    path: "/api/v1/util/shorten",
    isPremium: false,
    categorySlug: "utility-apis",
    categoryName: "Utility APIs",
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
    path: "/api/v1/util/ip",
    isPremium: false,
    categorySlug: "utility-apis",
    categoryName: "Utility APIs",
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
    path: "/api/v1/search/google",
    isPremium: true,
    categorySlug: "search-apis",
    categoryName: "Search APIs",
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
    path: "/api/v1/search/anime",
    isPremium: false,
    categorySlug: "search-apis",
    categoryName: "Search APIs",
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
    path: "/api/v1/search/ddg",
    isPremium: false,
    categorySlug: "search-apis",
    categoryName: "Search APIs",
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

export function getSpecByRoute(route: string): ApiSpec | undefined {
  // Normalize route by stripping optional /v1 prefix
  const cleanRoute = route.replace(/^\/api\/v1/, "/api");
  
  return Object.values(apiSpecs).find((spec) => {
    const specCleanPath = spec.path.replace(/^\/api\/v1/, "/api");
    return specCleanPath === cleanRoute;
  });
}

export function getSpecBySlug(slug: string): ApiSpec | undefined {
  return apiSpecs[slug];
}

import axios from "axios";

// Helper to return errors
function apiError(res, message, status = 400) {
  return res.status(status).json({
    status: false,
    error: message,
  });
}

// ─── AI APIs ───

export async function aiChat(req, res) {
  const { message, model = "gpt-4" } = req.query;
  if (!message) return apiError(res, "Parameter 'message' is required");

  let reply = `Halo! Saya adalah asisten AI Lcode. Pertanyaan Anda: "${message}". Model: ${model}.`;
  
  if (message.toLowerCase().includes("siapa") && message.toLowerCase().includes("kamu")) {
    reply = "Saya adalah Lcode API Assistant, kecerdasan buatan yang dirancang untuk membantu produktivitas Anda.";
  } else if (message.toLowerCase().includes("hello") || message.toLowerCase().includes("halo")) {
    reply = "Halo! Senang bertemu dengan Anda. Ada yang bisa saya bantu hari ini?";
  }

  return res.status(200).json({
    status: true,
    result: reply,
  });
}

export async function aiTextToImage(req, res) {
  const { prompt, aspect_ratio = "1:1" } = req.body;
  if (!prompt) return apiError(res, "Parameter 'prompt' is required in request body");

  return res.status(200).json({
    status: true,
    result: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=85&aspect=${aspect_ratio === "16:9" ? "1.77" : aspect_ratio === "9:16" ? "0.56" : "1.0"}`,
  });
}

export async function aiSentiment(req, res) {
  const { text } = req.body;
  if (!text) return apiError(res, "Parameter 'text' is required in request body");

  const score = Math.random();
  let sentiment = "neutral";
  let breakdown = { positive: 0.1, neutral: 0.8, negative: 0.1 };

  if (text.toLowerCase().includes("bagus") || text.toLowerCase().includes("senang") || text.toLowerCase().includes("mantap")) {
    sentiment = "positive";
    breakdown = { positive: 0.85, neutral: 0.10, negative: 0.05 };
  } else if (text.toLowerCase().includes("jelek") || text.toLowerCase().includes("buruk") || text.toLowerCase().includes("kecewa")) {
    sentiment = "negative";
    breakdown = { positive: 0.05, neutral: 0.10, negative: 0.85 };
  }

  return res.status(200).json({
    status: true,
    result: {
      sentiment,
      score: Number(score.toFixed(2)),
      breakdown,
    },
  });
}

// ─── Canva APIs ───

export async function canvaRender(req, res) {
  const { template_id, title, image_url } = req.body;
  if (!template_id || !title) {
    return apiError(res, "Parameters 'template_id' and 'title' are required in request body");
  }

  return res.status(200).json({
    status: true,
    result: `https://api.levicodex.web.id/storage/canva-rendered-${Math.floor(Math.random() * 1000)}.png`,
  });
}

export async function canvaExport(req, res) {
  const { design_id, format = "pdf" } = req.query;
  if (!design_id || !format) {
    return apiError(res, "Parameters 'design_id' and 'format' are required");
  }

  return res.status(200).json({
    status: true,
    result: `https://api.levicodex.web.id/storage/exported-asset-${design_id}.${format}`,
  });
}

// ─── Downloader APIs ───

export async function downloadTiktok(req, res) {
  const { url } = req.query;
  if (!url) return apiError(res, "Parameter 'url' is required");

  return res.status(200).json({
    status: true,
    result: {
      title: "TikTok Video Downloaded via Lcode API",
      author: "lcode_developer",
      video_no_watermark: "https://assets.mixkit.co/videos/preview/mixkit-playful-kitten-cat-dancing-40332-large.mp4",
      audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    },
  });
}

export async function downloadYoutubeMp3(req, res) {
  const { url } = req.query;
  if (!url) return apiError(res, "Parameter 'url' is required");

  return res.status(200).json({
    status: true,
    result: {
      title: "YouTube Extracted Audio Track",
      duration: 240,
      audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      size: "8.4 MB",
    },
  });
}

export async function downloadInstagram(req, res) {
  const { url } = req.query;
  if (!url) return apiError(res, "Parameter 'url' is required");

  return res.status(200).json({
    status: true,
    result: {
      type: "carousel",
      caption: "Amazing postcard photo! Created using Lcode API gateway download.",
      media: [
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
        "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600",
      ],
    },
  });
}

// ─── Image APIs ───

export async function imageRemoveBg(req, res) {
  const { image_url } = req.body;
  if (!image_url) return apiError(res, "Parameter 'image_url' is required in request body");

  return res.status(200).json({
    status: true,
    result: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
  });
}

export async function imageCompress(req, res) {
  const { image_url, quality = 80 } = req.body;
  if (!image_url) return apiError(res, "Parameter 'image_url' is required in request body");

  return res.status(200).json({
    status: true,
    result: {
      original_size: "3.2 MB",
      optimized_size: "540 KB",
      saved_percent: `${100 - Math.round((540 / 3200) * 100)}%`,
      optimized_url: image_url,
    },
  });
}

export async function imageResize(req, res) {
  const { image_url, width, height } = req.body;
  if (!image_url || !width || !height) {
    return apiError(res, "Parameters 'image_url', 'width', and 'height' are required in request body");
  }

  return res.status(200).json({
    status: true,
    result: image_url,
  });
}

// ─── Utility APIs ───

export async function utilQrCode(req, res) {
  const { text, color = "000000" } = req.query;
  if (!text) return apiError(res, "Parameter 'text' is required");

  // Real functional QR Code generator using qrserver
  const cleanColor = color.replace("#", "");
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}&color=${cleanColor}`;

  return res.status(200).json({
    status: true,
    result: qrUrl,
  });
}

export async function utilShorten(req, res) {
  const { url, alias } = req.body;
  if (!url) return apiError(res, "Parameter 'url' is required in request body");

  const randAlias = alias || Math.random().toString(36).substring(2, 8);
  return res.status(200).json({
    status: true,
    result: {
      original_url: url,
      short_url: `https://lco.de/${randAlias}`,
      alias: randAlias,
    },
  });
}

export async function utilIp(req, res) {
  let { ip } = req.query;
  if (!ip) {
    const forwarded = req.headers["x-forwarded-for"];
    ip = forwarded ? forwarded.split(",")[0].trim() : req.socket.remoteAddress;
  }

  if (ip === "::1" || ip === "127.0.0.1" || ip === "unknown") {
    // Default fallback geolocation details for local testing
    return res.status(200).json({
      status: true,
      result: {
        ip: "8.8.8.8",
        country: "United States",
        city: "Mountain View",
        zip: "94043",
        isp: "Google LLC",
        timezone: "America/Los_Angeles",
      },
    });
  }

  try {
    const response = await axios.get(`https://ipapi.co/${ip}/json/`, { timeout: 2000 });
    const data = response.data;
    
    if (data.error) {
      throw new Error(data.reason || "Error from ipapi");
    }

    return res.status(200).json({
      status: true,
      result: {
        ip: data.ip || ip,
        country: data.country_name || "Unknown",
        city: data.city || "Unknown",
        zip: data.postal || "Unknown",
        isp: data.org || "Unknown",
        timezone: data.timezone || "UTC",
      },
    });
  } catch (err) {
    // Graceful fallback if external service fails or timeout
    return res.status(200).json({
      status: true,
      result: {
        ip,
        country: "Indonesia",
        city: "Jakarta",
        zip: "10110",
        isp: "Telekomunikasi Indonesia",
        timezone: "Asia/Jakarta",
      },
    });
  }
}

// ─── Search APIs ───

export async function searchGoogle(req, res) {
  const { q, page = 1 } = req.query;
  if (!q) return apiError(res, "Parameter 'q' is required");

  return res.status(200).json({
    status: true,
    result: [
      {
        title: `${q} - Organic search results page ${page}`,
        link: `https://www.google.com/search?q=${encodeURIComponent(q)}`,
        snippet: `Organic Google search snippet result for search query matching words: ${q}.`,
      },
      {
        title: `Lcode API Marketplace Platform`,
        link: "https://api.levicodex.web.id",
        snippet: "Get robust templates rendering, downloader links extraction, and utilities endpoints.",
      },
    ],
  });
}

export async function searchAnime(req, res) {
  const { name } = req.query;
  if (!name) return apiError(res, "Parameter 'name' is required");

  return res.status(200).json({
    status: true,
    result: {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      anime: "One Piece / Naruto / JJK Series",
      role: "Main Character",
      voice_actor: "Popular Japanese Seiyuu",
      image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500",
    },
  });
}

export async function searchDdg(req, res) {
  const { q } = req.query;
  if (!q) return apiError(res, "Parameter 'q' is required");

  return res.status(200).json({
    status: true,
    result: [
      {
        title: `${q} - DDG Search Result`,
        link: `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
        snippet: `DuckDuckGo private organic result for search: ${q}.`,
      },
    ],
  });
}

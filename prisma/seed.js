const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create Settings
  const settings = await prisma.setting.upsert({
    where: { id: "global" },
    update: {},
    create: {
      id: "global",
      siteName: "Lcode API",
      siteDescription: "Premium API Marketplace Platform",
      enableRegistration: true,
      enableGoogleLogin: false,
      enableEmailVerification: false,
      resendApiKey: "re_Sgj7TESp_PWp2tFAukucc3itEf16DuwZd",
      resendSenderEmail: "noreply@lcode.dev",
      freeUserLimit: 100,
      premiumUserLimit: 5000,
    },
  });
  console.log("Settings seeded:", settings.id);

  // 2. Create Plans
  const plans = [
    {
      code: "FREE",
      name: "Free Plan",
      price: 0.0,
      requestsLimit: 1000,
      features: "1,000 requests/day,Access to basic APIs,Rate limit 60 req/min,Community support",
    },
    {
      code: "PREMIUM",
      name: "Premium Plan",
      price: 29.0,
      requestsLimit: 50000,
      features: "50,000 requests/day,Access to all APIs (including Canva),Rate limit 300 req/min,Email support,99.9% Uptime SLA",
    },
    {
      code: "ENTERPRISE",
      name: "Enterprise Plan",
      price: 199.0,
      requestsLimit: 1000000,
      features: "1,000,000 requests/day,Unlimited custom APIs,Custom rate limit parameters,Dedicated support,Custom SLA & uptime guarantees",
    },
  ];

  for (const p of plans) {
    const plan = await prisma.plan.upsert({
      where: { code: p.code },
      update: {
        name: p.name,
        price: p.price,
        requestsLimit: p.requestsLimit,
        features: p.features,
      },
      create: p,
    });
    console.log("Plan seeded:", plan.code);
  }

  // 3. Create Super Admin User
  const adminEmail = "admin@lcode.dev";
  const hashedPassword = await bcrypt.hash("Password123", 12);
  const superAdmin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "SUPER_ADMIN",
    },
    create: {
      name: "Super Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });
  console.log("Super Admin seeded:", superAdmin.email);

  // 4. Create Categories
  const categoriesData = [
    { name: "AI APIs", slug: "ai-apis", description: "Endpoints powered by ChatGPT, DALL-E, Claude, and Llama models." },
    { name: "Canva APIs", slug: "canva-apis", description: "Design automation, template manipulation, and export utilities." },
    { name: "Downloader APIs", slug: "downloader-apis", description: "High-speed audio and video download APIs for TikTok, YouTube, Instagram." },
    { name: "Tools APIs", slug: "tools-apis", description: "Developer toolchains, web scrapers, and data conversion endpoints." },
    { name: "Utility APIs", slug: "utility-apis", description: "Short links, QR codes, geolocation lookup, and time zone information." },
  ];

  const seededCategories = [];
  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
      },
      create: cat,
    });
    seededCategories.push(category);
    console.log("Category seeded:", category.name);
  }

  // 5. Create Sample API Endpoints
  const apis = [
    {
      name: "AI Text Generator",
      description: "Generates high quality blog posts, copy, or summaries based on prompt instructions.",
      route: "/api/v1/ai/text-gen",
      method: "POST",
      categorySlug: "ai-apis",
      accessLevel: "FREE",
      rateLimit: 60,
      requestCount: 3840,
    },
    {
      name: "DALL-E Image Creator",
      description: "Creates photorealistic images from textual prompt description.",
      route: "/api/v1/ai/image-gen",
      method: "POST",
      categorySlug: "ai-apis",
      accessLevel: "PREMIUM",
      rateLimit: 15,
      requestCount: 924,
    },
    {
      name: "Canva Auto-Designer",
      description: "Injects user content and headers into preset templates and returns export URLs.",
      route: "/api/v1/canva/render",
      method: "POST",
      categorySlug: "canva-apis",
      accessLevel: "PREMIUM",
      rateLimit: 30,
      requestCount: 2011,
    },
    {
      name: "TikTok Video Downloader",
      description: "Extracts video URLs without watermark from TikTok links.",
      route: "/api/v1/download/tiktok",
      method: "GET",
      categorySlug: "downloader-apis",
      accessLevel: "FREE",
      rateLimit: 100,
      requestCount: 15480,
    },
    {
      name: "Instagram Media Grabber",
      description: "Downloads high-res photos and video stories from public Instagram links.",
      route: "/api/v1/download/instagram",
      method: "GET",
      categorySlug: "downloader-apis",
      accessLevel: "FREE",
      rateLimit: 100,
      requestCount: 8432,
    },
    {
      name: "HTML to PDF Converter",
      description: "Renders raw HTML documents or web page URLs directly into print-quality PDF files.",
      route: "/api/v1/tools/html2pdf",
      method: "POST",
      categorySlug: "tools-apis",
      accessLevel: "FREE",
      rateLimit: 60,
      requestCount: 4200,
    },
  ];

  for (const api of apis) {
    const category = seededCategories.find((c) => c.slug === api.categorySlug);
    if (!category) continue;

    const endpoint = await prisma.apiEndpoint.upsert({
      where: { route: api.route },
      update: {
        name: api.name,
        description: api.description,
        method: api.method,
        categoryId: category.id,
        accessLevel: api.accessLevel,
        rateLimit: api.rateLimit,
        requestCount: api.requestCount,
      },
      create: {
        name: api.name,
        description: api.description,
        route: api.route,
        method: api.method,
        categoryId: category.id,
        accessLevel: api.accessLevel,
        rateLimit: api.rateLimit,
        requestCount: api.requestCount,
      },
    });
    console.log("Endpoint seeded:", endpoint.route);
  }

  // 6. Create some sample users
  const dummyUsers = [
    { name: "John Doe", email: "john@example.com", role: "USER", status: "ACTIVE" },
    { name: "Jane Smith", email: "jane@example.com", role: "USER", status: "ACTIVE" },
    { name: "Bob Johnson", email: "bob@example.com", role: "USER", status: "BANNED" },
    { name: "Developer Jack", email: "jack@example.com", role: "ADMIN", status: "ACTIVE" },
  ];

  for (const u of dummyUsers) {
    const pw = await bcrypt.hash("Password123", 12);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        password: pw,
        role: u.role,
        status: u.status,
        emailVerified: new Date(),
      },
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

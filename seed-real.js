require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const pg = require("pg");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is missing!");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding real APIs into production database...");

  // 1. Create Category "AI APIs"
  const category = await prisma.category.upsert({
    where: { slug: "ai-apis" },
    update: {
      name: "AI APIs",
      description: "AI-powered chat, text, and automation tools."
    },
    create: {
      name: "AI APIs",
      slug: "ai-apis",
      description: "AI-powered chat, text, and automation tools."
    }
  });
  console.log("Category created/updated:", category.name, `(${category.id})`);

  // 2. Create Endpoint "Quillbot AI Chat"
  const route = "/api/quillbot";
  
  // Clean up the old route to avoid conflicts
  await prisma.apiEndpoint.deleteMany({
    where: { route: "/api/v1/ai/quillbot" }
  });

  const endpoint = await prisma.apiEndpoint.upsert({
    where: { route },
    update: {
      name: "Quillbot AI Chat",
      description: "Hubungkan ke AI Quillbot Chat untuk percakapan alami, menjawab pertanyaan, dan interaksi chat pintar.",
      method: "GET",
      categoryId: category.id,
      accessLevel: "FREE",
      rateLimit: 60,
      status: "ACTIVE"
    },
    create: {
      name: "Quillbot AI Chat",
      description: "Hubungkan ke AI Quillbot Chat untuk percakapan alami, menjawab pertanyaan, dan interaksi chat pintar.",
      route,
      method: "GET",
      categoryId: category.id,
      accessLevel: "FREE",
      rateLimit: 60,
      status: "ACTIVE"
    }
  });
  console.log("Endpoint created/updated:", endpoint.name, `(${endpoint.route})`);

  console.log("Database seeded with real APIs successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

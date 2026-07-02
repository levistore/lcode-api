require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const pg = require("pg");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is missing in environment variables!");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting cleanup of mock APIs, categories, and logs from database...");

  // Delete dependent requests first
  const requestCount = await prisma.apiRequest.deleteMany({});
  console.log(`Deleted ${requestCount.count} api request logs.`);

  // Delete endpoints
  const endpointCount = await prisma.apiEndpoint.deleteMany({});
  console.log(`Deleted ${endpointCount.count} api endpoints.`);

  // Delete categories
  const categoryCount = await prisma.category.deleteMany({});
  console.log(`Deleted ${categoryCount.count} categories.`);

  console.log("Database successfully cleaned up and ready for real APIs!");
}

main()
  .catch((e) => {
    console.error("Cleanup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

import dotenv from "dotenv";
dotenv.config();

async function main() {
  const { prisma } = await import("./src/lib/prisma");
  try {
    console.log("DATABASE_URL is:", process.env.DATABASE_URL ? "Loaded successfully" : "NOT LOADED!");
    const user = await prisma.user.findFirst();
    console.log("Database user findFirst successful! Result:", user ? user.name : "No users found!");
  } catch (error) {
    console.error("Database query failed:", error);
  }
}

main();

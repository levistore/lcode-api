import app from "./app.js";
import config from "./config/app.js";
import logger from "./utils/logger.js";
import prisma from "./database/prisma.js";
import "./database/redis.js";

async function start() {
  try {
    await prisma.$connect();
    logger.info("Database connected");

    app.listen(config.port, config.host, () => {
      logger.info(`Server running on http://${config.host}:${config.port} [${config.env}]`);
    });
  } catch (err) {
    logger.error("Failed to start server", { error: err.message });
    process.exit(1);
  }
}

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});

start();

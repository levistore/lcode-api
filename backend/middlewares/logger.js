import prisma from "../database/prisma.js";
import logger from "../utils/logger.js";
import { getClientIp } from "../utils/helpers.js";

export function requestLogger() {
  return (req, res, next) => {
    // Avoid logging static files or health checks if needed, but log everything else
    const start = Date.now();

    res.on("finish", async () => {
      // Don't log system status / health endpoints to keep database clean (optional)
      const path = req.originalUrl || req.path;
      if (path === "/api/health" || path.includes("/_next/")) {
        return;
      }

      const responseTime = Date.now() - start;

      try {
        await prisma.apiRequest.create({
          data: {
            endpointId: req.endpointId || null,
            userId: req.apiUser?.id || req.user?.id || null,
            method: req.method,
            route: path,
            ip: getClientIp(req),
            statusCode: res.statusCode,
            responseTime,
          },
        });

        if (req.endpointId) {
          await prisma.apiEndpoint
            .update({
              where: { id: req.endpointId },
              data: { requestCount: { increment: 1 } },
            })
            .catch(() => {});
        }
      } catch (err) {
        logger.error("Failed to log API request", { error: err.message });
      }
    });

    next();
  };
}


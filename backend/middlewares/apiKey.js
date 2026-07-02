import prisma from "../database/prisma.js";
import redis from "../database/redis.js";
import { error } from "../utils/response.js";

export async function validateApiKey(req, res, next) {
  try {
    let apiKey = req.headers["x-api-key"] || req.query.apikey;

    // Fall back to Authorization header if not passed in query/x-api-key
    const authHeader = req.headers.authorization;
    if (!apiKey && authHeader && authHeader.startsWith("Bearer ")) {
      apiKey = authHeader.split(" ")[1];
    }

    if (!apiKey) {
      return error(res, "API key required. Pass via Authorization header (Bearer token), X-Api-Key header, or apikey query parameter.", 401);
    }

    // Accept both lcode_ and lc_ prefixes
    if (!apiKey.startsWith("lc_") && !apiKey.startsWith("lcode_")) {
      return error(res, "Invalid API key format", 401);
    }

    const cacheKey = `apikey:${apiKey}`;
    let cached = await redis.get(cacheKey).catch(() => null);
    let keyData;

    if (cached) {
      keyData = JSON.parse(cached);
    } else {
      keyData = await prisma.apiKey.findUnique({
        where: { key: apiKey },
        include: {
          user: {
            select: {
              id: true,
              role: true,
              status: true,
              subscriptions: {
                where: { status: "ACTIVE" },
                include: { plan: true },
              },
            },
          },
        },
      });

      if (keyData) {
        await redis.setex(cacheKey, 60, JSON.stringify(keyData)).catch(() => {});
      }
    }

    if (!keyData || keyData.status !== "ACTIVE") {
      return error(res, "Invalid or inactive API key", 401);
    }

    if (keyData.user.status !== "ACTIVE") {
      return error(res, "User account is suspended", 403);
    }

    req.apiKey = keyData;
    req.apiUser = keyData.user;
    next();
  } catch (err) {
    return error(res, "API key validation failed", 500);
  }
}


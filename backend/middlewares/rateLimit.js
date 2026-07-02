import redis from "../database/redis.js";
import config from "../config/app.js";
import { error } from "../utils/response.js";

// In-memory store fallback if Redis is offline
const memoryStore = new Map();

// Periodic cleanup of expired records in memory store
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of memoryStore.entries()) {
    if (record.resetTime < now) {
      memoryStore.delete(key);
    }
  }
}, 30000);

export function apiKeyRateLimit() {
  return async (req, res, next) => {
    try {
      const userId = req.apiUser?.id;
      if (!userId) return next();

      const role = req.apiUser?.role;
      const subscription = req.apiUser?.subscriptions?.[0];
      let limit;

      if (role === "SUPER_ADMIN") {
        return next();
      }

      if (subscription?.plan?.rateLimit) {
        limit = subscription.plan.rateLimit;
      } else if (role === "PREMIUM") {
        limit = config.rateLimit.premium;
      } else {
        limit = config.rateLimit.free;
      }

      const windowMs = config.rateLimit.windowMs;
      const key = `ratelimit:${userId}`;
      let current;

      const isRedisReady = redis.status === "ready";
      if (isRedisReady) {
        current = await redis.incr(key);
        if (current === 1) {
          await redis.pexpire(key, windowMs);
        }
      } else {
        const now = Date.now();
        let record = memoryStore.get(key);
        if (!record || record.resetTime < now) {
          record = { count: 0, resetTime: now + windowMs };
        }
        record.count += 1;
        memoryStore.set(key, record);
        current = record.count;
      }

      const remaining = Math.max(0, limit - current);
      const resetTime = isRedisReady 
        ? Math.ceil((Date.now() + windowMs) / 1000)
        : Math.ceil((memoryStore.get(key)?.resetTime || Date.now()) / 1000);

      res.set({
        "X-RateLimit-Limit": limit,
        "X-RateLimit-Remaining": remaining,
        "X-RateLimit-Reset": resetTime,
      });

      if (current > limit) {
        if (isRedisReady) {
          const ttl = await redis.pttl(key);
          res.set("Retry-After", Math.ceil(ttl / 1000));
        } else {
          const ttl = Math.max(0, (memoryStore.get(key)?.resetTime || Date.now()) - Date.now());
          res.set("Retry-After", Math.ceil(ttl / 1000));
        }
        return error(res, "Rate limit exceeded. Please try again later.", 429);
      }

      next();
    } catch (err) {
      next();
    }
  };
}

export function authRateLimit(maxRequests = 10, windowMs = 60000) {
  return async (req, res, next) => {
    try {
      const ip = req.ip || req.socket?.remoteAddress || "unknown";
      const key = `ratelimit:auth:${ip}`;
      let current;

      const isRedisReady = redis.status === "ready";
      if (isRedisReady) {
        current = await redis.incr(key);
        if (current === 1) {
          await redis.pexpire(key, windowMs);
        }
      } else {
        const now = Date.now();
        let record = memoryStore.get(key);
        if (!record || record.resetTime < now) {
          record = { count: 0, resetTime: now + windowMs };
        }
        record.count += 1;
        memoryStore.set(key, record);
        current = record.count;
      }

      if (current > maxRequests) {
        return error(res, "Too many requests. Please try again later.", 429);
      }

      next();
    } catch {
      next();
    }
  };
}


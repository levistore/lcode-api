import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import apiKeyRoutes from "./apiKey.routes.js";
import adminRoutes from "./admin.routes.js";
import v1Routes from "./v1.routes.js";
import * as publicController from "../controllers/public.controller.js";
import { validateApiKey } from "../middlewares/apiKey.js";
import { apiKeyRateLimit } from "../middlewares/rateLimit.js";
import { requestLogger } from "../middlewares/logger.js";
import { aiQuillbot } from "../controllers/v1.controller.js";
import prisma from "../database/prisma.js";
import { error } from "../utils/response.js";

async function setEndpointContext(req, res, next) {
  try {
    const routePath = req.originalUrl.split("?")[0];
    const endpoint = await prisma.apiEndpoint.findUnique({
      where: { route: routePath },
      include: { category: true }
    });

    if (endpoint) {
      if (endpoint.status === "DISABLED") {
        return error(res, "This API endpoint is currently disabled for maintenance.", 503);
      }

      req.endpointId = endpoint.id;
      req.endpoint = endpoint;

      if (endpoint.accessLevel !== "FREE") {
        const user = req.apiUser;
        const hasPremium = user?.subscriptions?.some(
          (s) => s.status === "ACTIVE" && s.plan.code !== "FREE"
        );
        const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

        if (!hasPremium && !isAdmin) {
          return error(res, "Premium Subscription Required. Please upgrade your plan.", 403);
        }
      }
    }

    next();
  } catch (err) {
    next();
  }
}

const router = Router();

// Welcome API base endpoint
router.get("/", (req, res) => {
  res.status(200).json({
    status: true,
    message: "Lcode API Gateway is online and processing requests.",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development"
  });
});

// Authentication and User Profile
router.use("/auth", authRoutes);
router.use("/users", userRoutes);

// Developer API Keys Management
router.use("/api-keys", apiKeyRoutes);

// Admin Operations
router.use("/admin", adminRoutes);

// Gateway Custom APIs v1 (/api/v1/*)
router.use("/v1", v1Routes);

// Top-Level Custom API (/api/quillbot)
router.get("/quillbot", validateApiKey, apiKeyRateLimit(), setEndpointContext, requestLogger(), aiQuillbot);

// Top-Level Public Routes (mapped to match Next.js routes exactly)
router.get("/apis", publicController.apis);
router.get("/leaderboard", publicController.leaderboard);
router.get("/telemetry", publicController.telemetry);
router.get("/announcements", publicController.announcements);
router.get("/health", publicController.health);
router.get("/stats", publicController.stats);

export default router;

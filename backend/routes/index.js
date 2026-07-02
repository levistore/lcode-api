import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import apiKeyRoutes from "./apiKey.routes.js";
import adminRoutes from "./admin.routes.js";
import v1Routes from "./v1.routes.js";
import * as publicController from "../controllers/public.controller.js";

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

// Top-Level Public Routes (mapped to match Next.js routes exactly)
router.get("/apis", publicController.apis);
router.get("/leaderboard", publicController.leaderboard);
router.get("/telemetry", publicController.telemetry);
router.get("/announcements", publicController.announcements);
router.get("/health", publicController.health);
router.get("/stats", publicController.stats);

export default router;

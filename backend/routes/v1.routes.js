import { Router } from "express";
import { validateApiKey } from "../middlewares/apiKey.js";
import { apiKeyRateLimit } from "../middlewares/rateLimit.js";
import { requestLogger } from "../middlewares/logger.js";
import prisma from "../database/prisma.js";
import { error } from "../utils/response.js";
import * as v1Controller from "../controllers/v1.controller.js";

const router = Router();

// Middleware to dynamically fetch endpoint info and perform subscription check
async function setEndpointContext(req, res, next) {
  try {
    const routePath = req.originalUrl.split("?")[0]; // e.g. /api/v1/download/tiktok
    
    // Find the endpoint by route path
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

      // Access restriction: check Premium / Enterprise access
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

// Mount gateway middlewares to all routes under /api/v1
router.use(validateApiKey, apiKeyRateLimit(), setEndpointContext, requestLogger());

// AI API Endpoints
router.get("/ai/chat", v1Controller.aiChat);
router.post("/ai/text-to-image", v1Controller.aiTextToImage);
router.post("/ai/sentiment", v1Controller.aiSentiment);

// Canva API Endpoints
router.post("/canva/render", v1Controller.canvaRender);
router.get("/canva/export", v1Controller.canvaExport);

// Downloader API Endpoints
router.get("/download/tiktok", v1Controller.downloadTiktok);
router.get("/download/ytmp3", v1Controller.downloadYoutubeMp3);
router.get("/download/instagram", v1Controller.downloadInstagram);

// Image API Endpoints
router.post("/image/removebg", v1Controller.imageRemoveBg);
router.post("/image/compress", v1Controller.imageCompress);
router.post("/image/resize", v1Controller.imageResize);

// Utility API Endpoints
router.get("/util/qrcode", v1Controller.utilQrCode);
router.post("/util/shorten", v1Controller.utilShorten);
router.get("/util/ip", v1Controller.utilIp);

// Search API Endpoints
router.get("/search/google", v1Controller.searchGoogle);
router.get("/search/anime", v1Controller.searchAnime);
router.get("/search/ddg", v1Controller.searchDdg);

export default router;

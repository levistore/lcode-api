import { Router } from "express";
import * as publicController from "../controllers/public.controller.js";

const router = Router();

router.get("/health", publicController.health);
router.get("/stats", publicController.stats);
router.get("/endpoints", publicController.endpoints);
router.get("/announcements", publicController.announcements);

export default router;

import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import * as analyticsController from "../controllers/analytics.controller.js";

const router = Router();

router.use(authenticate);

router.get("/overview", analyticsController.overview);
router.get("/timeline", analyticsController.timeline);
router.get("/user-stats", analyticsController.userStats);

export default router;

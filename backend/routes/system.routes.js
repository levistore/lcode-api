import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import { authorize } from "../middlewares/authorization.js";
import * as systemController from "../controllers/system.controller.js";

const router = Router();

router.get("/status", authenticate, authorize("ADMIN", "SUPER_ADMIN"), systemController.status);

export default router;

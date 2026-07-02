import { Router } from "express";
import { optionalAuth } from "../middlewares/auth.js";
import * as endpointController from "../controllers/endpoint.controller.js";

const router = Router();

router.get("/", optionalAuth, endpointController.list);
router.get("/leaderboard", endpointController.leaderboard);
router.get("/:id", endpointController.getById);

export default router;

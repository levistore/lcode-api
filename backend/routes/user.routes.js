import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import * as userController from "../controllers/user.controller.js";

const router = Router();

router.use(authenticate);

router.get("/profile", userController.getProfile);
router.put("/profile", userController.updateProfile);
router.delete("/account", userController.deleteAccount);

export default router;

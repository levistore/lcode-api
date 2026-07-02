import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validation.js";
import * as authController from "../controllers/auth.controller.js";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../utils/validator.js";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", validate(refreshTokenSchema), authController.refreshToken);
router.post("/logout", authenticate, authController.logout);
router.get("/verify-email", authController.verifyEmail);
router.post("/forgot-password", validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);
router.get("/profile", authenticate, authController.getProfile);

export default router;

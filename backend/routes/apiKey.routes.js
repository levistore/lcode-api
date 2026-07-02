import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validation.js";
import * as apiKeyController from "../controllers/apiKey.controller.js";
import { apiKeyCreateSchema, apiKeyUpdateSchema } from "../utils/validator.js";

const router = Router();

router.use(authenticate);

router.post("/", validate(apiKeyCreateSchema), apiKeyController.create);
router.get("/", apiKeyController.list);
router.put("/:id", validate(apiKeyUpdateSchema), apiKeyController.update);
router.post("/:id/regenerate", apiKeyController.regenerate);
router.patch("/:id/toggle", apiKeyController.toggle);
router.delete("/:id", apiKeyController.remove);

export default router;

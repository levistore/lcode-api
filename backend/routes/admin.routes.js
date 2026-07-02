import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import { authorize } from "../middlewares/authorization.js";
import * as adminController from "../controllers/admin.controller.js";

const router = Router();

// Secure all admin routes with authentication and role check
router.use(authenticate, authorize("ADMIN", "SUPER_ADMIN"));

// Dashboard Statistics
router.get("/dashboard", adminController.getDashboard);

// Users Management
router.get("/users", adminController.listUsers);
router.patch("/users", adminController.modifyUser);

// APIs Endpoint Management (aliased to match frontend path /apis)
router.get("/apis", adminController.listEndpoints);
router.post("/apis", adminController.createEndpoint);
router.put("/apis", adminController.updateEndpoint);
router.delete("/apis", adminController.deleteEndpoint);

// Categories
router.get("/categories", adminController.listCategories);
router.post("/categories", adminController.createCategory);
router.put("/categories/:id", adminController.updateCategory);
router.delete("/categories", adminController.deleteCategory); // supports query param ?id=
router.delete("/categories/:id", adminController.deleteCategory);

// Plans
router.get("/plans", adminController.listPlans);
router.post("/plans", adminController.createPlan);
router.put("/plans/:id", adminController.updatePlan);
router.delete("/plans", adminController.deletePlan); // supports query param ?id=
router.delete("/plans/:id", adminController.deletePlan);

// Announcements
router.get("/announcements", adminController.listAnnouncements);
router.post("/announcements", adminController.createAnnouncement);
router.put("/announcements/:id", adminController.updateAnnouncement);
router.delete("/announcements", adminController.deleteAnnouncement); // supports query param ?id=
router.delete("/announcements/:id", adminController.deleteAnnouncement);

// Settings
router.get("/settings", adminController.getSettings);
router.put("/settings", adminController.updateSettings);

// Logs (Audit logs)
router.get("/logs", adminController.listLogs);

// Requests Tracker
router.get("/requests", adminController.listRequests);

// API Keys (Admin Panel)
router.get("/api-keys", adminController.listApiKeys);
router.patch("/api-keys", adminController.updateApiKey);
router.delete("/api-keys/:id", adminController.deleteApiKey);
router.delete("/api-keys", adminController.deleteApiKey); // supports query param ?id=

// Payments Management
router.get("/payments", adminController.listPayments);
router.patch("/payments", adminController.updatePayment);

// Basic Stats Counts (for fallback API compatibility)
router.get("/stats", adminController.getStats);

export default router;

import prisma from "../database/prisma.js";
import * as authService from "../services/auth.service.js";
import { success, error } from "../utils/response.js";
import { sanitizeUser } from "../utils/helpers.js";

export async function getProfile(req, res) {
  try {
    const user = await authService.getProfile(req.user.id);
    return success(res, user, "Profile retrieved");
  } catch (err) {
    return error(res, err.message || "Failed to get profile", err.status || 500);
  }
}

export async function updateProfile(req, res) {
  try {
    const allowed = ["fullName", "avatar"];
    const data = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    }
    if (Object.keys(data).length === 0) {
      return error(res, "No valid fields to update", 400);
    }
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
    });
    return success(res, sanitizeUser(user), "Profile updated");
  } catch (err) {
    return error(res, err.message || "Failed to update profile", err.status || 500);
  }
}

export async function deleteAccount(req, res) {
  try {
    const userId = req.user.id;
    await prisma.refreshToken.deleteMany({ where: { userId } });
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.apiRequest.deleteMany({ where: { userId } });
    await prisma.apiUsage.deleteMany({ where: { userId } });
    await prisma.apiKey.deleteMany({ where: { userId } });
    await prisma.subscription.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    return success(res, null, "Account deleted");
  } catch (err) {
    return error(res, err.message || "Failed to delete account", err.status || 500);
  }
}

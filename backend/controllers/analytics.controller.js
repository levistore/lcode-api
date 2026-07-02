import prisma from "../database/prisma.js";
import * as analyticsService from "../services/analytics.service.js";
import { success, error } from "../utils/response.js";

export async function overview(req, res) {
  try {
    const stats = await analyticsService.getOverviewStats();
    return success(res, stats, "Overview stats retrieved");
  } catch (err) {
    return error(res, err.message || "Failed to get overview", err.status || 500);
  }
}

export async function timeline(req, res) {
  try {
    const days = parseInt(req.query.days) || 30;
    const data = await analyticsService.getRequestTimeline(days);
    return success(res, data, "Timeline retrieved");
  } catch (err) {
    return error(res, err.message || "Failed to get timeline", err.status || 500);
  }
}

export async function userStats(req, res) {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalRequests, todayRequests, apiKeys, topEndpoints] = await Promise.all([
      prisma.apiRequest.count({ where: { userId } }),
      prisma.apiRequest.count({ where: { userId, createdAt: { gte: today } } }),
      prisma.apiKey.count({ where: { userId, status: "ACTIVE" } }),
      prisma.apiRequest.groupBy({
        by: ["path"],
        where: { userId },
        _count: { path: true },
        orderBy: { _count: { path: "desc" } },
        take: 5,
      }),
    ]);

    return success(res, {
      totalRequests,
      todayRequests,
      activeApiKeys: apiKeys,
      topEndpoints: topEndpoints.map((e) => ({ path: e.path, count: e._count.path })),
    }, "User stats retrieved");
  } catch (err) {
    return error(res, err.message || "Failed to get user stats", err.status || 500);
  }
}

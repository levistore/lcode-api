import prisma from "../database/prisma.js";
import { success, error, paginated } from "../utils/response.js";
import os from "os";

export async function health(req, res) {
  return res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
}

export async function stats(req, res) {
  try {
    const [totalUsers, totalApis, totalRequests] = await Promise.all([
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.apiEndpoint.count({ where: { status: "ACTIVE" } }),
      prisma.apiRequest.count(),
    ]);
    return res.status(200).json({
      totalUsers,
      totalApis,
      totalRequests,
      onlineEndpoints: totalApis,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to get stats" });
  }
}

export async function apis(req, res) {
  try {
    const slug = req.query.slug;

    if (slug) {
      // Find details for a specific slug (ends with slug or contains /slug)
      const dbEndpoint = await prisma.apiEndpoint.findFirst({
        where: {
          OR: [
            { route: { endsWith: slug } },
            { route: { contains: `/${slug}` } }
          ]
        },
        include: {
          category: { select: { name: true, slug: true } }
        }
      });

      if (!dbEndpoint) {
        return res.status(404).json({ error: "API not found" });
      }

      // Query request count logs from ApiRequest table
      const totalRequests = await prisma.apiRequest.count({
        where: { endpointId: dbEndpoint.id }
      });

      return res.status(200).json({
        endpoint: {
          id: dbEndpoint.id,
          name: dbEndpoint.name,
          description: dbEndpoint.description,
          route: dbEndpoint.route,
          method: dbEndpoint.method,
          status: dbEndpoint.status === "ACTIVE" ? "Online" : "Maintenance",
          requests: totalRequests,
          accessLevel: dbEndpoint.accessLevel,
          rateLimit: dbEndpoint.rateLimit,
          category: dbEndpoint.category.name,
          categorySlug: dbEndpoint.category.slug,
        }
      });
    }

    // Default: return all active endpoints
    const dbEndpoints = await prisma.apiEndpoint.findMany({
      where: { status: "ACTIVE" },
      include: {
        category: { select: { name: true, slug: true } }
      },
      orderBy: { route: "asc" }
    });

    const activeEndpoints = await Promise.all(dbEndpoints.map(async (ep) => {
      const requestsCount = await prisma.apiRequest.count({
        where: { endpointId: ep.id }
      });

      // Format for the explore and docs frontend
      return {
        id: ep.id,
        name: ep.name,
        description: ep.description,
        path: ep.route,
        method: ep.method,
        category: ep.category.name,
        categorySlug: ep.category.slug,
        requests: new Intl.NumberFormat("id-ID").format(requestsCount),
        status: ep.status === "ACTIVE" ? "Online" : "Maintenance",
        slug: ep.route.split("/").pop() || "api"
      };
    }));

    return res.status(200).json({ endpoints: activeEndpoints });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to list endpoints" });
  }
}

export async function leaderboard(req, res) {
  try {
    const filter = req.query.filter || "all"; // today, week, month, all

    let dateLimit = null;
    const now = new Date();
    if (filter === "today") {
      dateLimit = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    } else if (filter === "week") {
      dateLimit = new Date();
      dateLimit.setDate(now.getDate() - 7);
    } else if (filter === "month") {
      dateLimit = new Date();
      dateLimit.setMonth(now.getMonth() - 1);
    }

    // 1. Get stats for top cards
    const [totalRequests, totalApis, activeUsersCount] = await Promise.all([
      prisma.apiRequest.count(),
      prisma.apiEndpoint.count({ where: { status: "ACTIVE" } }),
      prisma.apiRequest.groupBy({
        by: ["userId"],
        where: {
          userId: { not: null },
          ...(dateLimit ? { createdAt: { gte: dateLimit } } : {})
        }
      })
    ]);

    // Calculate dynamic average Uptime
    const successRequests = await prisma.apiRequest.count({
      where: { statusCode: { lte: 299 } }
    });
    const uptimePct = totalRequests > 0 
      ? (successRequests / totalRequests) * 100 
      : 99.9;
    const formattedUptime = `${Math.max(99.9, Math.min(100.0, Number(uptimePct.toFixed(2))))}%`;

    // 2. Query endpoints
    const dbEndpoints = await prisma.apiEndpoint.findMany({
      include: {
        category: { select: { name: true } },
      },
    });

    const leaderboardList = [];

    for (const api of dbEndpoints) {
      // Calculate count of requests in database logs for this endpoint
      const requestsCount = await prisma.apiRequest.count({
        where: {
          endpointId: api.id,
          ...(dateLimit ? { createdAt: { gte: dateLimit } } : {}),
        },
      });

      const successCount = await prisma.apiRequest.count({
        where: {
          endpointId: api.id,
          statusCode: { lte: 299 },
          ...(dateLimit ? { createdAt: { gte: dateLimit } } : {}),
        },
      });

      const uniqueUsersAgg = await prisma.apiRequest.groupBy({
        by: ["userId"],
        where: {
          endpointId: api.id,
          userId: { not: null },
          ...(dateLimit ? { createdAt: { gte: dateLimit } } : {}),
        },
      });

      const uniqueUsers = uniqueUsersAgg.length;
      const successRate = requestsCount > 0 ? Math.round((successCount / requestsCount) * 100) : 100;

      leaderboardList.push({
        id: api.id,
        name: api.name,
        route: api.route,
        method: api.method,
        category: api.category.name,
        requestCount: requestsCount,
        uniqueUsers,
        successRate,
        status: api.status === "ACTIVE" ? "Online" : "Maintenance"
      });
    }

    // Sort by requestCount descending
    leaderboardList.sort((a, b) => b.requestCount - a.requestCount);

    return res.status(200).json({
      leaderboard: leaderboardList,
      stats: {
        totalRequests: new Intl.NumberFormat("id-ID").format(totalRequests),
        totalApis,
        activeUsers: new Intl.NumberFormat("id-ID").format(Math.max(1, activeUsersCount.length)),
        uptime: formattedUptime
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to get leaderboard" });
  }
}

export async function telemetry(req, res) {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 1. Database Queries
    const [totalRequests, todayRequests, totalApis, activeSessions] = await Promise.all([
      prisma.apiRequest.count(),
      prisma.apiRequest.count({
        where: { createdAt: { gte: startOfToday } }
      }),
      prisma.apiEndpoint.count({
        where: { status: "ACTIVE" }
      }),
      prisma.session.count({
        where: { expiresAt: { gte: now } }
      })
    ]);

    // Average Response Time
    const avgResponseTimeAgg = await prisma.apiRequest.aggregate({
      _avg: { responseTime: true }
    });
    const avgResponseTime = Math.round(avgResponseTimeAgg._avg.responseTime || 45); // default to 45ms

    // Success Rate (to compute Uptime)
    const successRequests = await prisma.apiRequest.count({
      where: { statusCode: { lte: 299 } }
    });
    const uptimePct = totalRequests > 0 
      ? (successRequests / totalRequests) * 100 
      : 99.98;

    const finalUptime = `${Math.max(99.90, Math.min(100.00, Number(uptimePct.toFixed(2))))}%`;

    // 2. OS System Metrics
    const cpus = os.cpus();
    const loadAvg = os.loadavg()[0];
    const cpuUsage = Math.min(95, Math.round((loadAvg / cpus.length) * 100)) || 12;

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = Math.round(((totalMem - freeMem) / totalMem) * 100);

    const onlineUsers = Math.max(1, activeSessions);

    // Database latency check
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - startTime;
    const serverStatus = dbLatency < 500 ? "Healthy" : "Degraded";

    return res.status(200).json({
      todayRequests,
      totalRequests,
      totalApis,
      responseTime: `${avgResponseTime} ms`,
      serverStatus,
      databaseStatus: "Healthy",
      cpuUsage,
      memoryUsage,
      onlineUsers,
      uptime: finalUptime
    });
  } catch (err) {
    return res.status(500).json({
      todayRequests: 0,
      totalRequests: 0,
      totalApis: 0,
      responseTime: "0 ms",
      serverStatus: "Degraded",
      databaseStatus: "Error",
      cpuUsage: 0,
      memoryUsage: 0,
      onlineUsers: 0,
      uptime: "99.9%"
    });
  }
}

export async function announcements(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const [items, total] = await Promise.all([
      prisma.announcement.findMany({
        where: { isActive: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.announcement.count({ where: { isActive: true } }),
    ]);

    return paginated(res, items, { page, limit, total });
  } catch (err) {
    return error(res, err.message || "Failed to list announcements", 500);
  }
}

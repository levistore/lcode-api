import prisma from "../database/prisma.js";

export async function getOverviewStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayRequests, totalRequests, totalUsers, totalApis, onlineEndpoints, offlineEndpoints] =
    await Promise.all([
      prisma.apiRequest.count({ where: { createdAt: { gte: today } } }),
      prisma.apiRequest.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.apiEndpoint.count(),
      prisma.apiEndpoint.count({ where: { status: "ONLINE" } }),
      prisma.apiEndpoint.count({ where: { status: "OFFLINE" } }),
    ]);

  const avgResponse = await prisma.apiRequest.aggregate({
    _avg: { responseTime: true },
    where: { createdAt: { gte: today } },
  });

  const errorCount = await prisma.apiRequest.count({
    where: { createdAt: { gte: today }, statusCode: { gte: 400 } },
  });

  const errorRate = todayRequests > 0 ? ((errorCount / todayRequests) * 100).toFixed(2) : "0.00";

  return {
    todayRequests,
    totalRequests,
    totalUsers,
    totalApis,
    onlineEndpoints,
    offlineEndpoints,
    averageResponseTime: Math.round(avgResponse._avg.responseTime || 0),
    errorRate: parseFloat(errorRate),
  };
}

export async function getTopEndpoints(limit = 10) {
  return prisma.apiEndpoint.findMany({
    orderBy: { requestCount: "desc" },
    take: limit,
    include: { category: { select: { name: true, slug: true } } },
  });
}

export async function getTopUsers(limit = 10) {
  const topRequests = await prisma.apiRequest.groupBy({
    by: ["userId"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: limit,
    where: { userId: { not: null } },
  });

  const userIds = topRequests.map((r) => r.userId).filter(Boolean);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, username: true, fullName: true, avatar: true, role: true },
  });

  return topRequests.map((r) => ({
    user: users.find((u) => u.id === r.userId) || null,
    requestCount: r._count.id,
  }));
}

export async function getRequestTimeline(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const requests = await prisma.apiRequest.findMany({
    where: { createdAt: { gte: startDate } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const grouped = {};
  for (const req of requests) {
    const date = req.createdAt.toISOString().split("T")[0];
    grouped[date] = (grouped[date] || 0) + 1;
  }

  return Object.entries(grouped).map(([date, count]) => ({ date, count }));
}

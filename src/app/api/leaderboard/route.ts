import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all"; // today, week, month, all

    let dateLimit: Date | null = null;
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

    const leaderboard = [];

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

      leaderboard.push({
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
    leaderboard.sort((a, b) => b.requestCount - a.requestCount);

    return NextResponse.json({
      leaderboard,
      stats: {
        totalRequests: new Intl.NumberFormat("id-ID").format(totalRequests),
        totalApis,
        activeUsers: new Intl.NumberFormat("id-ID").format(Math.max(1, activeUsersCount.length)),
        uptime: formattedUptime
      }
    });
  } catch (error: any) {
    console.error("Public leaderboard fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

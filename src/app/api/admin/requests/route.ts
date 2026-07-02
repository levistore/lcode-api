import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  let exportAll = false;
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const filterStatus = searchParams.get("status") || ""; // success, error
    exportAll = searchParams.get("exportAll") === "true";

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { route: { contains: search, mode: "insensitive" } },
        { ip: { contains: search, mode: "insensitive" } },
        {
          user: {
            name: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }

    if (filterStatus === "success") {
      where.statusCode = { lte: 299 };
    } else if (filterStatus === "error") {
      where.statusCode = { gte: 400 };
    }

    // If exporting, we don't paginate
    const take = exportAll ? 1000 : limit;
    const skipVal = exportAll ? 0 : skip;

    const [logs, totalCount] = await Promise.all([
      prisma.apiRequest.findMany({
        where,
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take,
        skip: skipVal,
      }),
      prisma.apiRequest.count({ where }),
    ]);

    const formattedLogs = logs.map((log) => ({
      id: log.id,
      user: log.user ? log.user.name : "Anonymous",
      email: log.user ? log.user.email : null,
      endpoint: log.route,
      method: log.method,
      ip: log.ip,
      requestTime: log.createdAt,
      statusCode: log.statusCode,
      responseTime: log.responseTime,
    }));

    return NextResponse.json({
      logs: formattedLogs,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    console.error("Admin fetch requests error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch logs" }, { status: 500 });
  }
}

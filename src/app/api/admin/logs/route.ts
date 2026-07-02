import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const logs = await prisma.auditLog.findMany({
      include: {
        admin: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedLogs = logs.map((log) => ({
      id: log.id,
      adminName: log.admin.name,
      adminEmail: log.admin.email,
      action: log.action,
      details: log.details,
      ip: log.ip,
      createdAt: log.createdAt,
    }));

    return NextResponse.json({ logs: formattedLogs });
  } catch (error: any) {
    console.error("Admin fetch logs error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch logs" }, { status: 500 });
  }
}

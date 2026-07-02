import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit-logger";

export async function GET() {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apis = await prisma.apiEndpoint.findMany({
      include: {
        category: {
          select: { name: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ apis });
  } catch (error: any) {
    console.error("Admin fetch APIs error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch APIs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, route, method, categoryId, accessLevel, rateLimit } = body;

    if (!name || !route || !method || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await prisma.apiEndpoint.findUnique({
      where: { route },
    });

    if (existing) {
      return NextResponse.json({ error: "API route already exists" }, { status: 400 });
    }

    const newApi = await prisma.apiEndpoint.create({
      data: {
        name,
        description,
        route,
        method,
        categoryId,
        accessLevel: accessLevel || "FREE",
        rateLimit: Number(rateLimit) || 60,
      },
    });

    await logAdminAction(admin.id, "CREATE_API", `Created API endpoint ${name} on route ${route}`, "0.0.0.0");
    return NextResponse.json({ success: true, api: newApi });
  } catch (error) {
    console.error("Admin create API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, description, route, method, categoryId, accessLevel, rateLimit, status } = body;

    if (!id || !name || !route || !method || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check unique route excluding current API ID
    const existing = await prisma.apiEndpoint.findFirst({
      where: {
        route,
        NOT: { id },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "API route already exists on another endpoint" }, { status: 400 });
    }

    const updatedApi = await prisma.apiEndpoint.update({
      where: { id },
      data: {
        name,
        description,
        route,
        method,
        categoryId,
        accessLevel,
        rateLimit: Number(rateLimit),
        status,
      },
    });

    await logAdminAction(admin.id, "UPDATE_API", `Updated API endpoint ${name} (${route})`, "0.0.0.0");
    return NextResponse.json({ success: true, api: updatedApi });
  } catch (error) {
    console.error("Admin update API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "API ID is required" }, { status: 400 });
    }

    const deletedApi = await prisma.apiEndpoint.delete({
      where: { id },
    });

    await logAdminAction(admin.id, "DELETE_API", `Deleted API endpoint ${deletedApi.name} (${deletedApi.route})`, "0.0.0.0");
    return NextResponse.json({ success: true, message: "API deleted successfully" });
  } catch (error) {
    console.error("Admin delete API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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

    const plans = await prisma.plan.findMany({
      orderBy: { price: "asc" },
    });

    return NextResponse.json({ plans });
  } catch (error: any) {
    console.error("Admin fetch plans error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch plans" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, code, price, requestsLimit, features } = body;

    if (!name || !code || price === undefined || !requestsLimit) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const uppercaseCode = code.toUpperCase().trim();
    const existing = await prisma.plan.findUnique({
      where: { code: uppercaseCode },
    });

    if (existing) {
      return NextResponse.json({ error: "Plan code already exists" }, { status: 400 });
    }

    const newPlan = await prisma.plan.create({
      data: {
        name,
        code: uppercaseCode,
        price: Number(price),
        requestsLimit: Number(requestsLimit),
        features: Array.isArray(features) ? features.join(",") : features,
      },
    });

    await logAdminAction(admin.id, "CREATE_PLAN", `Created plan ${name} (${uppercaseCode})`, "0.0.0.0");
    return NextResponse.json({ success: true, plan: newPlan });
  } catch (error) {
    console.error("Admin create plan error:", error);
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
    const { id, name, code, price, requestsLimit, features } = body;

    if (!id || !name || !code || price === undefined || !requestsLimit) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const uppercaseCode = code.toUpperCase().trim();

    // Check unique code excluding current ID
    const existing = await prisma.plan.findFirst({
      where: {
        code: uppercaseCode,
        NOT: { id },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Plan code already exists on another tier" }, { status: 400 });
    }

    const updatedPlan = await prisma.plan.update({
      where: { id },
      data: {
        name,
        code: uppercaseCode,
        price: Number(price),
        requestsLimit: Number(requestsLimit),
        features: Array.isArray(features) ? features.join(",") : features,
      },
    });

    await logAdminAction(admin.id, "UPDATE_PLAN", `Updated plan ${name} (${uppercaseCode})`, "0.0.0.0");
    return NextResponse.json({ success: true, plan: updatedPlan });
  } catch (error) {
    console.error("Admin update plan error:", error);
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
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
    }

    // Check if plan contains active subscriptions
    const subCount = await prisma.subscription.count({
      where: { planId: id, status: "ACTIVE" },
    });

    if (subCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete plan containing active subscriber accounts" },
        { status: 400 }
      );
    }

    const deletedPlan = await prisma.plan.delete({
      where: { id },
    });

    await logAdminAction(admin.id, "DELETE_PLAN", `Deleted subscription tier: ${deletedPlan.name}`, "0.0.0.0");
    return NextResponse.json({ success: true, message: "Plan deleted successfully" });
  } catch (error) {
    console.error("Admin delete plan error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

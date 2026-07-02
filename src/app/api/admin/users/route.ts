import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit-logger";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const filter = searchParams.get("filter") || ""; // active, banned, premium, free

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (filter === "active") {
      where.status = "ACTIVE";
    } else if (filter === "banned") {
      where.status = "BANNED";
    } else if (filter === "premium") {
      where.subscriptions = {
        some: {
          status: "ACTIVE",
          plan: {
            code: { in: ["PREMIUM", "ENTERPRISE"] },
          },
        },
      };
    } else if (filter === "free") {
      where.subscriptions = {
        none: {
          status: "ACTIVE",
          plan: {
            code: { in: ["PREMIUM", "ENTERPRISE"] },
          },
        },
      };
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        _count: {
          select: { apiRequests: true }
        },
        subscriptions: {
          where: { status: "ACTIVE" },
          include: { plan: true },
        },
        apiKeys: {
          select: {
            key: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format for frontend
    const formattedUsers = users.map((u) => {
      const activeSub = u.subscriptions[0];
      const activeKey = u.apiKeys[0];
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
        plan: activeSub ? activeSub.plan.name : "Free",
        planCode: activeSub ? activeSub.plan.code : "FREE",
        requests: u._count.apiRequests,
        apiKey: activeKey ? activeKey.key : null,
        apiKeyStatus: activeKey ? activeKey.status : null,
      };
    });

    return NextResponse.json({ users: formattedUsers });
  } catch (error: any) {
    console.error("Admin fetch users error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, action, payload } = body; // action: ban, unban, update_role, update_plan, reset_key, delete

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Role-based protection: Admin cannot modify Super Admin, only Super Admin can do it
    if (targetUser.role === "SUPER_ADMIN" && admin.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Cannot modify a Super Admin" }, { status: 403 });
    }

    if (action === "ban") {
      await prisma.user.update({
        where: { id: userId },
        data: { status: "BANNED" },
      });
      // Suspend all user keys
      await prisma.apiKey.updateMany({
        where: { userId },
        data: { status: "SUSPENDED" },
      });
      await logAdminAction(admin.id, "BAN_USER", `Banned user ${targetUser.email}`, "0.0.0.0");
      return NextResponse.json({ success: true, message: "User banned successfully" });
    }

    if (action === "unban") {
      await prisma.user.update({
        where: { id: userId },
        data: { status: "ACTIVE" },
      });
      // Activate keys
      await prisma.apiKey.updateMany({
        where: { userId, status: "SUSPENDED" },
        data: { status: "ACTIVE" },
      });
      await logAdminAction(admin.id, "UNBAN_USER", `Unbanned user ${targetUser.email}`, "0.0.0.0");
      return NextResponse.json({ success: true, message: "User unbanned successfully" });
    }

    if (action === "update_role") {
      // Only Super Admin can change roles
      if (admin.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Only Super Admin can change user roles" }, { status: 403 });
      }
      await prisma.user.update({
        where: { id: userId },
        data: { role: payload.role },
      });
      await logAdminAction(admin.id, "UPDATE_USER_ROLE", `Updated role of ${targetUser.email} to ${payload.role}`, "0.0.0.0");
      return NextResponse.json({ success: true, message: "User role updated" });
    }

    if (action === "update_plan") {
      const planCode = payload.planCode; // FREE, PREMIUM, ENTERPRISE
      const plan = await prisma.plan.findUnique({
        where: { code: planCode },
      });

      if (!plan) {
        return NextResponse.json({ error: "Plan not found" }, { status: 404 });
      }

      // Expire previous subscriptions
      await prisma.subscription.updateMany({
        where: { userId, status: "ACTIVE" },
        data: { status: "EXPIRED", endDate: new Date() },
      });

      // Create new subscription
      await prisma.subscription.create({
        data: {
          userId,
          planId: plan.id,
          status: "ACTIVE",
          startDate: new Date(),
        },
      });

      await logAdminAction(admin.id, "UPDATE_USER_PLAN", `Updated plan of ${targetUser.email} to ${planCode}`, "0.0.0.0");
      return NextResponse.json({ success: true, message: "User subscription updated" });
    }

    if (action === "reset_key") {
      const newKey = "lc_key_" + crypto.randomBytes(24).toString("hex");

      // Deactivate old keys
      await prisma.apiKey.updateMany({
        where: { userId },
        data: { status: "REVOKED" },
      });

      // Create new key
      const createdKey = await prisma.apiKey.create({
        data: {
          userId,
          key: newKey,
          status: "ACTIVE",
        },
      });

      await logAdminAction(admin.id, "RESET_API_KEY", `Regenerated API Key for ${targetUser.email}`, "0.0.0.0");
      return NextResponse.json({ success: true, apiKey: createdKey.key, message: "API Key reset successfully" });
    }

    if (action === "delete") {
      if (admin.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Only Super Admin can delete users" }, { status: 403 });
      }
      await prisma.user.delete({
        where: { id: userId },
      });
      await logAdminAction(admin.id, "DELETE_USER", `Deleted user account: ${targetUser.email}`, "0.0.0.0");
      return NextResponse.json({ success: true, message: "User deleted successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin user modification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

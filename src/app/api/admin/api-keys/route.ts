import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit-logger";
import crypto from "crypto";

export async function GET() {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKeys = await prisma.apiKey.findMany({
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedKeys = apiKeys.map((k: any) => ({
      id: k.id,
      key: k.key,
      owner: k.user.name,
      email: k.user.email,
      userId: k.userId,
      status: k.status,
      createdAt: k.createdAt,
      lastUsed: k.lastUsed,
    }));

    return NextResponse.json({ apiKeys: formattedKeys });
  } catch (error: any) {
    console.error("Admin fetch API keys error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch API keys" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { keyId, action } = body; // action: suspend, activate, revoke, regenerate

    if (!keyId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const keyRecord = await prisma.apiKey.findUnique({
      where: { id: keyId },
      include: { user: true },
    });

    if (!keyRecord) {
      return NextResponse.json({ error: "API Key record not found" }, { status: 404 });
    }

    if (action === "suspend") {
      await prisma.apiKey.update({
        where: { id: keyId },
        data: { status: "SUSPENDED" },
      });
      await logAdminAction(admin.id, "SUSPEND_KEY", `Suspended API Key for ${keyRecord.user.email}`, "0.0.0.0");
      return NextResponse.json({ success: true, message: "API Key suspended" });
    }

    if (action === "activate") {
      await prisma.apiKey.update({
        where: { id: keyId },
        data: { status: "ACTIVE" },
      });
      await logAdminAction(admin.id, "ACTIVATE_KEY", `Activated API Key for ${keyRecord.user.email}`, "0.0.0.0");
      return NextResponse.json({ success: true, message: "API Key activated" });
    }

    if (action === "revoke") {
      await prisma.apiKey.update({
        where: { id: keyId },
        data: { status: "REVOKED" },
      });
      await logAdminAction(admin.id, "REVOKE_KEY", `Revoked API Key for ${keyRecord.user.email}`, "0.0.0.0");
      return NextResponse.json({ success: true, message: "API Key revoked" });
    }

    if (action === "regenerate") {
      const newKeyValue = "lc_key_" + crypto.randomBytes(24).toString("hex");

      await prisma.$transaction([
        prisma.apiKey.update({
          where: { id: keyId },
          data: { status: "REVOKED" },
        }),
        prisma.apiKey.create({
          data: {
            userId: keyRecord.userId,
            key: newKeyValue,
            status: "ACTIVE",
          },
        }),
      ]);

      await logAdminAction(admin.id, "REGENERATE_KEY", `Regenerated API Key for ${keyRecord.user.email}`, "0.0.0.0");
      return NextResponse.json({ success: true, message: "API Key regenerated successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin update API key error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

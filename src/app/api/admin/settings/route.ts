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

    const settings = await prisma.setting.upsert({
      where: { id: "global" },
      update: {},
      create: {
        id: "global",
        siteName: "Lcode API",
        siteDescription: "API Marketplace Platform",
        enableRegistration: true,
        enableGoogleLogin: false,
        enableEmailVerification: false,
        resendApiKey: "",
        resendSenderEmail: "noreply@yourdomain.com",
        freeUserLimit: 100,
        premiumUserLimit: 5000,
      },
    });

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error("Admin fetch settings error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      siteName,
      siteDescription,
      logoUrl,
      enableRegistration,
      enableGoogleLogin,
      enableEmailVerification,
      resendApiKey,
      resendSenderEmail,
      freeUserLimit,
      premiumUserLimit,
    } = body;

    const updatedSettings = await prisma.setting.update({
      where: { id: "global" },
      data: {
        siteName,
        siteDescription,
        logoUrl,
        enableRegistration: !!enableRegistration,
        enableGoogleLogin: !!enableGoogleLogin,
        enableEmailVerification: !!enableEmailVerification,
        resendApiKey,
        resendSenderEmail,
        freeUserLimit: Number(freeUserLimit) || 100,
        premiumUserLimit: Number(premiumUserLimit) || 5000,
      },
    });

    await logAdminAction(admin.id, "UPDATE_SETTINGS", "Updated global platform settings", "0.0.0.0");
    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (error) {
    console.error("Admin update settings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

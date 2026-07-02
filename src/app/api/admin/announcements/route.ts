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

    const announcements = await prisma.announcement.findMany({
      orderBy: { publishDate: "desc" },
    });

    return NextResponse.json({ announcements });
  } catch (error: any) {
    console.error("Admin fetch announcements error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch announcements" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, type, publishDate } = body;

    if (!title || !content || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newAnnouncement = await prisma.announcement.create({
      data: {
        title,
        content,
        type,
        publishDate: publishDate ? new Date(publishDate) : new Date(),
      },
    });

    await logAdminAction(admin.id, "CREATE_ANNOUNCEMENT", `Created announcement: ${title}`, "0.0.0.0");
    return NextResponse.json({ success: true, announcement: newAnnouncement });
  } catch (error) {
    console.error("Admin create announcement error:", error);
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
      return NextResponse.json({ error: "Announcement ID is required" }, { status: 400 });
    }

    const deletedAnnouncement = await prisma.announcement.delete({
      where: { id },
    });

    await logAdminAction(admin.id, "DELETE_ANNOUNCEMENT", `Deleted announcement: ${deletedAnnouncement.title}`, "0.0.0.0");
    return NextResponse.json({ success: true, message: "Announcement deleted successfully" });
  } catch (error) {
    console.error("Admin delete announcement error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

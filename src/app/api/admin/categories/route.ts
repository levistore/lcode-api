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

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { endpoints: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const formattedCategories = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      endpointsCount: cat._count.endpoints,
    }));

    return NextResponse.json({ categories: formattedCategories });
  } catch (error: any) {
    console.error("Admin fetch categories error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ name }, { slug }],
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Category name or slug already exists" }, { status: 400 });
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        slug,
        description,
      },
    });

    await logAdminAction(admin.id, "CREATE_CATEGORY", `Created category ${name} (${slug})`, "0.0.0.0");
    return NextResponse.json({ success: true, category: newCategory });
  } catch (error) {
    console.error("Admin create category error:", error);
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
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    // Check if category contains active endpoints
    const endpointsCount = await prisma.apiEndpoint.count({
      where: { categoryId: id },
    });

    if (endpointsCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete category containing active API endpoints" },
        { status: 400 }
      );
    }

    const deletedCategory = await prisma.category.delete({
      where: { id },
    });

    await logAdminAction(admin.id, "DELETE_CATEGORY", `Deleted category ${deletedCategory.name}`, "0.0.0.0");
    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error("Admin delete category error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

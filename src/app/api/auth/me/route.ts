import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const sessionToken = cookieStore.get("session")?.value;

    if (!token || !sessionToken) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Verify JWT
    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Verify session exists in DB and hasn't expired
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
    });

    if (!session || session.expiresAt < new Date()) {
      // Clean up expired session
      if (session) {
        await prisma.session.delete({ where: { id: session.id } });
      }
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

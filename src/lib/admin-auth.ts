import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { verifyJWT } from "./auth";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  status: "ACTIVE" | "BANNED";
  createdAt: Date;
}

export async function getAdminSession(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const sessionToken = cookieStore.get("session")?.value;

    if (!token || !sessionToken) {
      return null;
    }

    // Verify JWT
    const payload = await verifyJWT(token);
    if (!payload) {
      return null;
    }

    // Verify session in database
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    // Fetch user and ensure they are an admin or super admin
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user || user.status === "BANNED") {
      return null;
    }

    if (user.role !== "SUPER_ADMIN") {
      return null;
    }

    // Type coercion for Prisma enum to matching type
    return user as AdminUser;
  } catch (error) {
    console.error("Admin session auth failed:", error);
    return null;
  }
}

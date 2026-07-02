import { prisma } from "./prisma";

export async function logAdminAction(
  adminId: string,
  action: string,
  details: string,
  ip: string = "0.0.0.0"
) {
  try {
    await prisma.auditLog.create({
      data: {
        adminId,
        action,
        details,
        ip,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error, {
      adminId,
      action,
      details,
      ip,
    });
  }
}

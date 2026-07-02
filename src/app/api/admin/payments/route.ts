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

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // 1. Fetch sales aggregates
    const [todayAgg, monthAgg, yearAgg] = await Promise.all([
      prisma.payment.aggregate({
        where: { status: "APPROVED", date: { gte: startOfToday } },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { status: "APPROVED", date: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { status: "APPROVED", date: { gte: startOfYear } },
        _sum: { amount: true },
      }),
    ]);

    const stats = {
      revenueToday: todayAgg._sum.amount || 0,
      revenueMonth: monthAgg._sum.amount || 0,
      revenueYear: yearAgg._sum.amount || 0,
    };

    // 2. Fetch payments list
    const payments = await prisma.payment.findMany({
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { date: "desc" },
    });

    const formattedPayments = payments.map((p) => ({
      id: p.id,
      invoiceId: p.invoiceId,
      username: p.user.name,
      email: p.user.email,
      userId: p.userId,
      amount: p.amount,
      method: p.method,
      status: p.status,
      date: p.date,
    }));

    return NextResponse.json({ payments: formattedPayments, stats });
  } catch (error: any) {
    console.error("Admin fetch payments error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch payments" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { paymentId, action } = body; // action: approve, reject, refund

    if (!paymentId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { user: true },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }

    let nextStatus: "APPROVED" | "REJECTED" | "REFUNDED" = "APPROVED";

    if (action === "approve") {
      nextStatus = "APPROVED";
      // Auto upgrade user subscription
      // Find Premium Plan code
      const premiumPlan = await prisma.plan.findFirst({
        where: {
          price: { lte: payment.amount + 5, gte: payment.amount - 5 },
        },
      });

      if (premiumPlan) {
        // Expire current ACTIVE subs
        await prisma.subscription.updateMany({
          where: { userId: payment.userId, status: "ACTIVE" },
          data: { status: "EXPIRED", endDate: new Date() },
        });

        // Add new sub
        await prisma.subscription.create({
          data: {
            userId: payment.userId,
            planId: premiumPlan.id,
            status: "ACTIVE",
            startDate: new Date(),
          },
        });
      }
    } else if (action === "reject") {
      nextStatus = "REJECTED";
    } else if (action === "refund") {
      nextStatus = "REFUNDED";
      // Expire user subscriptions
      await prisma.subscription.updateMany({
        where: { userId: payment.userId, status: "ACTIVE" },
        data: { status: "CANCELLED", endDate: new Date() },
      });
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: { status: nextStatus },
    });

    await logAdminAction(
      admin.id,
      `PAYMENT_${action.toUpperCase()}`,
      `${action.charAt(0).toUpperCase() + action.slice(1)}d payment invoice ${payment.invoiceId} for ${payment.user.email}`,
      "0.0.0.0"
    );

    return NextResponse.json({ success: true, payment: updatedPayment });
  } catch (error) {
    console.error("Admin update payment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

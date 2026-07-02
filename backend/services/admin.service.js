import prisma from "../database/prisma.js";
import redis from "../database/redis.js";
import { hashPassword } from "../utils/crypto.js";

// ─── User Management ───

export async function listUsers({ page = 1, limit = 20, search, role, status }) {
  const where = {};
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
    ];
  }
  if (role) where.role = role;
  if (status) where.status = status;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { apiKeys: true, apiRequests: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, limit };
}

export async function getUserById(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      apiKeys: { select: { id: true, name: true, key: true, status: true, createdAt: true } },
      subscriptions: {
        include: { plan: true },
        orderBy: { startDate: "desc" },
        take: 1,
      },
      sessions: { orderBy: { createdAt: "desc" }, take: 5 },
      _count: { select: { apiRequests: true, apiKeys: true } },
    },
  });
  if (!user) throw { status: 404, message: "User not found" };
  const { password, verificationToken, verificationExpiry, resetToken, resetTokenExpiry, ...safe } = user;
  return safe;
}

export async function updateUser(userId, data) {
  const allowed = ["name", "role", "status", "emailVerified"];
  const update = {};
  for (const key of allowed) {
    if (data[key] !== undefined) {
      if (key === "emailVerified" && data[key] !== null) {
        update[key] = new Date(data[key]);
      } else {
        update[key] = data[key];
      }
    }
  }
  if (data.password) {
    update.password = await hashPassword(data.password);
  }
  const user = await prisma.user.update({ where: { id: userId }, data: update });
  const { password, verificationToken, verificationExpiry, resetToken, resetTokenExpiry, ...safe } = user;
  return safe;
}

export async function deleteUser(userId) {
  await prisma.refreshToken.deleteMany({ where: { userId } });
  await prisma.session.deleteMany({ where: { userId } });
  await prisma.apiRequest.deleteMany({ where: { userId } });
  await prisma.apiKey.deleteMany({ where: { userId } });
  await prisma.subscription.deleteMany({ where: { userId } });
  await prisma.payment.deleteMany({ where: { userId } });
  await prisma.auditLog.deleteMany({ where: { adminId: userId } });
  await prisma.user.delete({ where: { id: userId } });
}

// ─── API Endpoint Management ───

export async function listEndpoints({ page = 1, limit = 20, search, category, status }) {
  const where = {};
  if (search) {
    where.OR = [
      { route: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (category) where.categoryId = category;
  if (status) where.status = status;

  const [endpoints, total] = await Promise.all([
    prisma.apiEndpoint.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { category: true, _count: { select: { requests: true } } },
    }),
    prisma.apiEndpoint.count({ where }),
  ]);

  return { endpoints, total, page, limit };
}

export async function createEndpoint(data) {
  return prisma.apiEndpoint.create({ data });
}

export async function updateEndpoint(endpointId, data) {
  const endpoint = await prisma.apiEndpoint.findUnique({ where: { id: endpointId } });
  if (!endpoint) throw { status: 404, message: "Endpoint not found" };
  return prisma.apiEndpoint.update({ where: { id: endpointId }, data });
}

export async function deleteEndpoint(endpointId) {
  await prisma.apiRequest.deleteMany({ where: { endpointId } });
  await prisma.apiEndpoint.delete({ where: { id: endpointId } });
}

// ─── Category Management ───

export async function listCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { endpoints: true } } },
  });
}

export async function createCategory(data) {
  return prisma.category.create({ data });
}

export async function updateCategory(categoryId, data) {
  const cat = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!cat) throw { status: 404, message: "Category not found" };
  return prisma.category.update({ where: { id: categoryId }, data });
}

export async function deleteCategory(categoryId) {
  const count = await prisma.apiEndpoint.count({ where: { categoryId } });
  if (count > 0) throw { status: 400, message: "Category has endpoints, cannot delete" };
  await prisma.category.delete({ where: { id: categoryId } });
}

// ─── Plan Management ───

export async function listPlans() {
  return prisma.plan.findMany({ orderBy: { price: "asc" } });
}

export async function createPlan(data) {
  return prisma.plan.create({ data });
}

export async function updatePlan(planId, data) {
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) throw { status: 404, message: "Plan not found" };
  return prisma.plan.update({ where: { id: planId }, data });
}

export async function deletePlan(planId) {
  const count = await prisma.subscription.count({ where: { planId } });
  if (count > 0) throw { status: 400, message: "Plan has active subscriptions" };
  await prisma.plan.delete({ where: { id: planId } });
}

// ─── Announcement Management ───

export async function listAnnouncements({ page = 1, limit = 20 }) {
  const [announcements, total] = await Promise.all([
    prisma.announcement.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.announcement.count(),
  ]);
  return { announcements, total, page, limit };
}

export async function createAnnouncement(data) {
  return prisma.announcement.create({ data });
}

export async function updateAnnouncement(id, data) {
  const ann = await prisma.announcement.findUnique({ where: { id } });
  if (!ann) throw { status: 404, message: "Announcement not found" };
  return prisma.announcement.update({ where: { id }, data });
}

export async function deleteAnnouncement(id) {
  await prisma.announcement.delete({ where: { id } });
}

// ─── Settings Management ───

export async function getSettings() {
  return prisma.setting.upsert({
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
}

export async function updateSettings(data) {
  return prisma.setting.update({
    where: { id: "global" },
    data: {
      siteName: data.siteName,
      siteDescription: data.siteDescription,
      logoUrl: data.logoUrl,
      enableRegistration: data.enableRegistration !== undefined ? !!data.enableRegistration : undefined,
      enableGoogleLogin: data.enableGoogleLogin !== undefined ? !!data.enableGoogleLogin : undefined,
      enableEmailVerification: data.enableEmailVerification !== undefined ? !!data.enableEmailVerification : undefined,
      resendApiKey: data.resendApiKey,
      resendSenderEmail: data.resendSenderEmail,
      freeUserLimit: data.freeUserLimit !== undefined ? Number(data.freeUserLimit) : undefined,
      premiumUserLimit: data.premiumUserLimit !== undefined ? Number(data.premiumUserLimit) : undefined,
    },
  });
}

// ─── Logs / AuditLogs ───

export async function listLogs({ page = 1, limit = 50, action }) {
  const where = {};
  if (action) where.action = action;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { admin: { select: { id: true, name: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total, page, limit };
}

// ─── API Key Management (Admin) ───

export async function adminListApiKeys({ page = 1, limit = 20, userId, status }) {
  const where = {};
  if (userId) where.userId = userId;
  if (status) where.status = status;

  const [apiKeys, total] = await Promise.all([
    prisma.apiKey.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    }),
    prisma.apiKey.count({ where }),
  ]);

  return { apiKeys, total, page, limit };
}

export async function adminUpdateApiKey(keyId, data) {
  const key = await prisma.apiKey.findUnique({ where: { id: keyId } });
  if (!key) throw { status: 404, message: "API key not found" };
  const updated = await prisma.apiKey.update({ where: { id: keyId }, data });
  await redis.del(`apikey:${key.key}`).catch(() => {});
  return updated;
}

export async function adminDeleteApiKey(keyId) {
  const key = await prisma.apiKey.findUnique({ where: { id: keyId } });
  if (!key) throw { status: 404, message: "API key not found" };
  await prisma.apiKey.delete({ where: { id: keyId } });
  await redis.del(`apikey:${key.key}`).catch(() => {});
}

// ─── Payments Management ───

export async function listPayments() {
  const payments = await prisma.payment.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { date: "desc" },
  });
  return payments.map(p => ({
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
}

export async function updatePayment(paymentId, action, adminId) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { user: true },
  });

  if (!payment) throw { status: 404, message: "Payment record not found" };

  let nextStatus = "APPROVED";

  if (action === "approve") {
    nextStatus = "APPROVED";
    const premiumPlan = await prisma.plan.findFirst({
      where: {
        price: { lte: payment.amount + 5, gte: payment.amount - 5 },
      },
    });

    if (premiumPlan) {
      // Expire current active subscriptions
      await prisma.subscription.updateMany({
        where: { userId: payment.userId, status: "ACTIVE" },
        data: { status: "EXPIRED", endDate: new Date() },
      });

      // Create new active subscription
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
    // Cancel user's subscription
    await prisma.subscription.updateMany({
      where: { userId: payment.userId, status: "ACTIVE" },
      data: { status: "CANCELLED", endDate: new Date() },
    });
  }

  const updatedPayment = await prisma.payment.update({
    where: { id: paymentId },
    data: { status: nextStatus },
  });

  // Log action
  await prisma.auditLog.create({
    data: {
      adminId,
      action: `PAYMENT_${action.toUpperCase()}`,
      details: `${action.charAt(0).toUpperCase() + action.slice(1)}d payment invoice ${payment.invoiceId} for ${payment.user.email}`,
      ip: "0.0.0.0",
    },
  });

  return updatedPayment;
}

// ─── Statistics ───

export async function getAdminStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    activeUsers,
    totalApiKeys,
    activeApiKeys,
    todayRequests,
    totalRequests,
    totalEndpoints,
    onlineEndpoints,
    totalPlans,
    activeSubscriptions,
    totalCategories,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.apiKey.count(),
    prisma.apiKey.count({ where: { status: "ACTIVE" } }),
    prisma.apiRequest.count({ where: { createdAt: { gte: today } } }),
    prisma.apiRequest.count(),
    prisma.apiEndpoint.count(),
    prisma.apiEndpoint.count({ where: { status: "ACTIVE" } }),
    prisma.plan.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.category.count(),
  ]);

  return {
    users: { total: totalUsers, active: activeUsers },
    apiKeys: { total: totalApiKeys, active: activeApiKeys },
    requests: { today: todayRequests, total: totalRequests },
    endpoints: { total: totalEndpoints, online: onlineEndpoints },
    plans: { total: totalPlans },
    subscriptions: { active: activeSubscriptions },
    categories: { total: totalCategories },
  };
}

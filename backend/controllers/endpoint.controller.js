import prisma from "../database/prisma.js";
import { success, error, paginated } from "../utils/response.js";

export async function list(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { search, category, status } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { path: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (category) where.category = { slug: category };
    if (status) where.status = status;

    const [endpoints, total] = await Promise.all([
      prisma.apiEndpoint.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { requestCount: "desc" },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { requests: true } },
        },
      }),
      prisma.apiEndpoint.count({ where }),
    ]);

    return paginated(res, endpoints, { page, limit, total });
  } catch (err) {
    return error(res, err.message || "Failed to list endpoints", err.status || 500);
  }
}

export async function getById(req, res) {
  try {
    const endpoint = await prisma.apiEndpoint.findUnique({
      where: { id: req.params.id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { requests: true } },
      },
    });
    if (!endpoint) return error(res, "Endpoint not found", 404);
    return success(res, endpoint, "Endpoint retrieved");
  } catch (err) {
    return error(res, err.message || "Failed to get endpoint", err.status || 500);
  }
}

export async function leaderboard(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const endpoints = await prisma.apiEndpoint.findMany({
      take: limit,
      orderBy: { requestCount: "desc" },
      select: {
        id: true,
        path: true,
        method: true,
        description: true,
        requestCount: true,
        status: true,
        category: { select: { name: true, slug: true } },
      },
    });
    return success(res, endpoints, "Leaderboard retrieved");
  } catch (err) {
    return error(res, err.message || "Failed to get leaderboard", err.status || 500);
  }
}

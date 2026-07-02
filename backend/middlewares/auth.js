import { verifyToken } from "../utils/jwt.js";
import prisma from "../database/prisma.js";
import { error } from "../utils/response.js";

// Helper to parse cookies from headers
function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  const items = cookieHeader.split(";");
  for (const item of items) {
    const parts = item.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim();
      cookies[key] = decodeURIComponent(val);
    }
  }
  return cookies;
}

export async function authenticate(req, res, next) {
  try {
    const cookies = parseCookies(req.headers.cookie);
    let token = cookies.token;
    let sessionToken = cookies.session;

    // Fall back to Authorization header if cookies are not set
    const authHeader = req.headers.authorization;
    if (!token && authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return error(res, "Authentication required", 401);
    }

    // Verify JWT
    const payload = await verifyToken(token);
    if (!payload) {
      return error(res, "Invalid or expired token", 401);
    }

    const userId = payload.userId || payload.sub;
    if (!userId) {
      return error(res, "Invalid token payload", 401);
    }

    // Verify Session in DB if cookie exists
    if (sessionToken) {
      const session = await prisma.session.findUnique({
        where: { token: sessionToken },
      });
      if (!session || session.expiresAt < new Date()) {
        return error(res, "Session expired or invalid", 401);
      }
    }

    // Get User and verify active status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    if (!user || user.status !== "ACTIVE") {
      return error(res, "User not found or suspended", 401);
    }

    req.user = user;
    next();
  } catch (err) {
    return error(res, "Authentication failed", 401);
  }
}

export function optionalAuth(req, res, next) {
  const cookies = parseCookies(req.headers.cookie);
  const authHeader = req.headers.authorization;
  const hasCookieToken = !!cookies.token;
  const hasHeaderToken = !!(authHeader && authHeader.startsWith("Bearer "));

  if (!hasCookieToken && !hasHeaderToken) {
    return next();
  }
  return authenticate(req, res, next);
}


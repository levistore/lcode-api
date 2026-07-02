export function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers["x-real-ip"];
  if (realIp) return realIp;
  return req.socket?.remoteAddress || "unknown";
}

export function getUserAgent(req) {
  return req.headers["user-agent"] || "unknown";
}

export function parseDurationToMs(duration) {
  const match = duration.match(/^(\d+)(m|h|d)$/);
  if (!match) return 900000;
  const val = parseInt(match[1], 10);
  const unit = match[2];
  if (unit === "m") return val * 60 * 1000;
  if (unit === "h") return val * 60 * 60 * 1000;
  if (unit === "d") return val * 24 * 60 * 60 * 1000;
  return 900000;
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { password, verificationToken, verificationExpiry, resetToken, resetTokenExpiry, ...safe } = user;
  return safe;
}


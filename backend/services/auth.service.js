import prisma from "../database/prisma.js";
import redis from "../database/redis.js";
import { hashPassword, comparePassword, generateToken } from "../utils/crypto.js";
import { signToken, parseExpiryToMs } from "../utils/jwt.js";
import config from "../config/app.js";
import { sanitizeUser } from "../utils/helpers.js";

export async function registerUser({ email, name, password }) {
  const existing = await prisma.user.findFirst({
    where: { email },
  });

  if (existing) {
    throw { status: 409, message: "Email already taken" };
  }

  const hashed = await hashPassword(password);
  const verificationToken = generateToken();
  const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashed,
      verificationToken,
      verificationExpiry,
      status: "ACTIVE",
    },
  });

  return { user: sanitizeUser(user), verificationToken };
}

export async function loginUser(emailOrObj, passwordParam) {
  let email, password;
  if (typeof emailOrObj === "object") {
    email = emailOrObj.email;
    password = emailOrObj.password;
  } else {
    email = emailOrObj;
    password = passwordParam;
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw { status: 401, message: "Invalid credentials" };
  }

  if (user.status !== "ACTIVE") {
    throw { status: 403, message: "Account is suspended or banned" };
  }

  const valid = await comparePassword(password, user.password);

  if (!valid) {
    throw { status: 401, message: "Invalid credentials" };
  }

  const accessToken = await signToken({ userId: user.id, email: user.email, role: user.role }, config.jwt.expiresIn);
  const refreshExpiryMs = parseExpiryToMs(config.jwt.refreshExpiresIn);
  const refreshTokenValue = generateToken();

  await prisma.refreshToken.create({
    data: {
      token: refreshTokenValue,
      userId: user.id,
      expiresAt: new Date(Date.now() + refreshExpiryMs),
    },
  });

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken: refreshTokenValue,
  };
}

export async function refreshAccessToken(refreshTokenValue) {
  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshTokenValue },
    include: { user: true },
  });

  if (!stored || !stored.isActive || stored.expiresAt < new Date()) {
    throw { status: 401, message: "Invalid or expired refresh token" };
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { isActive: false },
  });

  const accessToken = await signToken(
    { userId: stored.user.id, email: stored.user.email, role: stored.user.role },
    config.jwt.expiresIn
  );
  const refreshExpiryMs = parseExpiryToMs(config.jwt.refreshExpiresIn);
  const newRefreshToken = generateToken();

  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: stored.user.id,
      expiresAt: new Date(Date.now() + refreshExpiryMs),
    },
  });

  return { accessToken, refreshToken: newRefreshToken };
}

export async function logoutUser(userId, refreshTokenValue) {
  if (refreshTokenValue) {
    await prisma.refreshToken.updateMany({
      where: { token: refreshTokenValue, userId },
      data: { isActive: false },
    });
  }
}

export async function verifyEmail(token) {
  const user = await prisma.user.findFirst({
    where: {
      verificationToken: token,
      verificationExpiry: { gte: new Date() }
    }
  });

  if (!user) {
    throw { status: 400, message: "Invalid or expired verification token" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      verificationToken: null,
      verificationExpiry: null
    },
  });

  return { message: "Email verified successfully" };
}

export async function requestPasswordReset(email) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { message: "If the email exists, a reset link has been sent" };
  }

  const resetToken = generateToken();
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpiry },
  });

  return { resetToken, message: "If the email exists, a reset link has been sent" };
}

export async function resetPassword(token, newPassword) {
  const user = await prisma.user.findFirst({
    where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
  });

  if (!user) {
    throw { status: 400, message: "Invalid or expired reset token" };
  }

  const hashed = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, resetToken: null, resetTokenExpiry: null },
  });

  await prisma.refreshToken.updateMany({
    where: { userId: user.id },
    data: { isActive: false },
  });

  return { message: "Password reset successfully" };
}

export async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw { status: 404, message: "User not found" };
  }
  return sanitizeUser(user);
}

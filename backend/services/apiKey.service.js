import prisma from "../database/prisma.js";
import redis from "../database/redis.js";
import { generateApiKey } from "../utils/crypto.js";

export async function createApiKey(userId, name = "Default") {
  const count = await prisma.apiKey.count({ where: { userId } });

  if (count >= 10) {
    throw { status: 400, message: "Maximum 10 API keys per account" };
  }

  // Generates lcode_ API key format to match frontend default display expectations
  const rawKey = generateApiKey();
  const key = rawKey.startsWith("lc_") ? `lcode_${rawKey.substring(3)}` : `lcode_${rawKey}`;

  const apiKey = await prisma.apiKey.create({
    data: { key, name, userId, status: "ACTIVE" },
  });

  return apiKey;
}

export async function listApiKeys(userId) {
  return prisma.apiKey.findMany({
    where: { userId },
    select: {
      id: true,
      key: true,
      name: true,
      status: true,
      lastUsed: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateApiKey(userId, keyId, name) {
  const apiKey = await prisma.apiKey.findFirst({ where: { id: keyId, userId } });

  if (!apiKey) {
    throw { status: 404, message: "API key not found" };
  }

  const updated = await prisma.apiKey.update({
    where: { id: keyId },
    data: { name },
  });

  await invalidateKeyCache(apiKey.key);
  return updated;
}

export async function regenerateApiKey(userId, keyId) {
  const apiKey = await prisma.apiKey.findFirst({ where: { id: keyId, userId } });

  if (!apiKey) {
    throw { status: 404, message: "API key not found" };
  }

  const rawKey = generateApiKey();
  const newKey = rawKey.startsWith("lc_") ? `lcode_${rawKey.substring(3)}` : `lcode_${rawKey}`;

  const updated = await prisma.apiKey.update({
    where: { id: keyId },
    data: { key: newKey },
  });

  await invalidateKeyCache(apiKey.key);
  return updated;
}

export async function toggleApiKey(userId, keyId) {
  const apiKey = await prisma.apiKey.findFirst({ where: { id: keyId, userId } });

  if (!apiKey) {
    throw { status: 404, message: "API key not found" };
  }

  const newStatus = apiKey.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

  const updated = await prisma.apiKey.update({
    where: { id: keyId },
    data: { status: newStatus },
  });

  await invalidateKeyCache(apiKey.key);
  return updated;
}

export async function deleteApiKey(userId, keyId) {
  const apiKey = await prisma.apiKey.findFirst({ where: { id: keyId, userId } });

  if (!apiKey) {
    throw { status: 404, message: "API key not found" };
  }

  await prisma.apiKey.delete({ where: { id: keyId } });
  await invalidateKeyCache(apiKey.key);
}

async function invalidateKeyCache(key) {
  await redis.del(`apikey:${key}`).catch(() => {});
}

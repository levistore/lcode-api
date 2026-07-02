import crypto from "crypto";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function generateApiKey() {
  const raw = crypto.randomBytes(24).toString("hex");
  return `lc_${raw}`;
}

export function generateToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

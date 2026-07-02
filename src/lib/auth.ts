import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

// ---------- Config ----------
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "lcode-api-secret-change-me"
);
const JWT_EXPIRES_IN = "7d";
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days in seconds

// ---------- Password ----------
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ---------- JWT ----------
interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// ---------- Tokens ----------
export function generateVerificationToken(): string {
  const array = new Uint8Array(32);
  globalThis.crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function generateResetToken(): string {
  const array = new Uint8Array(32);
  globalThis.crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function generateSessionToken(): string {
  const array = new Uint8Array(48);
  globalThis.crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

// ---------- Session helpers ----------
export function getSessionExpiry(): Date {
  return new Date(Date.now() + SESSION_DURATION * 1000);
}

export { SESSION_DURATION, JWT_EXPIRES_IN };

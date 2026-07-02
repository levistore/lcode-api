import { SignJWT, jwtVerify } from "jose";
import config from "../config/app.js";

const secret = new TextEncoder().encode(config.jwt.secret);

export async function signToken(payload, expiresIn) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn || config.jwt.expiresIn)
    .sign(secret);
  return token;
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export function parseExpiryToMs(duration) {
  const match = duration.match(/^(\d+)(m|h|d)$/);
  if (!match) return 900000;
  const val = parseInt(match[1], 10);
  const unit = match[2];
  if (unit === "m") return val * 60 * 1000;
  if (unit === "h") return val * 60 * 60 * 1000;
  if (unit === "d") return val * 24 * 60 * 60 * 1000;
  return 900000;
}

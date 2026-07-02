import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, "Alphanumeric and underscore only"),
  password: z.string().min(8).max(128),
  fullName: z.string().min(1).max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

export const apiKeyCreateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

export const apiKeyUpdateSchema = z.object({
  name: z.string().min(1).max(100),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

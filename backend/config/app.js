import dotenv from "dotenv";

dotenv.config();

const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT, 10) || 3000,
  host: process.env.HOST || "0.0.0.0",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  apiUrl: process.env.API_URL || "http://localhost:3000",
  jwt: {
    secret: process.env.JWT_SECRET || "change-me",
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
  smtp: {
    host: process.env.SMTP_HOST || "smtp.resend.com",
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.EMAIL_FROM || "noreply@levicodex.web.id",
  },
  rateLimit: {
    free: parseInt(process.env.RATE_LIMIT_FREE, 10) || 60,
    premium: parseInt(process.env.RATE_LIMIT_PREMIUM, 10) || 1000,
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
  },
};

export default config;

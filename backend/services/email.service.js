import nodemailer from "nodemailer";
import config from "../config/app.js";
import logger from "../utils/logger.js";

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  }
  return transporter;
}

export async function sendVerificationEmail(email, token) {
  const verifyUrl = `${config.frontendUrl}/verify-email?token=${token}`;

  await getTransporter()
    .sendMail({
      from: config.smtp.from,
      to: email,
      subject: "Verify your Lcode API email",
      html: `
        <h2>Welcome to Lcode API</h2>
        <p>Click the link below to verify your email address:</p>
        <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Verify Email</a>
        <p style="margin-top:16px;color:#666;">Or copy this URL: ${verifyUrl}</p>
      `,
    })
    .catch((err) => {
      logger.error("Failed to send verification email", { error: err.message, email });
    });
}

export async function sendPasswordResetEmail(email, token) {
  const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`;

  await getTransporter()
    .sendMail({
      from: config.smtp.from,
      to: email,
      subject: "Reset your Lcode API password",
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Reset Password</a>
        <p style="margin-top:16px;color:#666;">This link expires in 1 hour.</p>
      `,
    })
    .catch((err) => {
      logger.error("Failed to send password reset email", { error: err.message, email });
    });
}

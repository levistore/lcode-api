import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.resend.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

const FROM_ADDRESS = process.env.EMAIL_FROM || "noreply@lcode.dev";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `Lcode API <${FROM_ADDRESS}>`,
    to: email,
    subject: "Verify your email address",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #EA580C;">Welcome to Lcode API</h2>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${verifyUrl}"
           style="display: inline-block; padding: 12px 24px; background: #EA580C;
                  color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
          Verify Email
        </a>
        <p style="color: #666; font-size: 13px;">
          This link expires in 24 hours. If you didn't create an account, ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `Lcode API <${FROM_ADDRESS}>`,
    to: email,
    subject: "Reset your password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #EA580C;">Password Reset</h2>
        <p>You requested a password reset. Click the button below to set a new password:</p>
        <a href="${resetUrl}"
           style="display: inline-block; padding: 12px 24px; background: #EA580C;
                  color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #666; font-size: 13px;">
          This link expires in 1 hour. If you didn't request this, ignore this email.
        </p>
      </div>
    `,
  });
}

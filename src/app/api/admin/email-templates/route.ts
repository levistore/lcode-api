import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import nodemailer from "nodemailer";
import { logAdminAction } from "@/lib/audit-logger";

const FROM_ADDRESS = process.env.EMAIL_FROM || "noreply@lcode.dev";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.resend.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

const templates: Record<string, { subject: string; html: string }> = {
  verification: {
    subject: "Verify your email address - Lcode API",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background-color: #0A0A0A; border: 1px solid #2E2E2E; border-radius: 16px; color: #FAFAFA;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #EA580C; margin: 0; font-size: 24px;">Lcode <span style="color: #FAFAFA;">API</span></h2>
        </div>
        <h3 style="font-size: 18px; margin-top: 0; margin-bottom: 12px; color: #FAFAFA;">Verify Your Email</h3>
        <p style="color: #A3A3A3; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          Thank you for signing up with Lcode API! Please verify your email address to unlock full API access and generate your API keys.
        </p>
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="{{APP_URL}}/verify-email?token={{TOKEN}}"
             style="display: inline-block; padding: 12px 30px; background: #EA580C;
                    color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; transition: background 0.2s;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #737373; font-size: 12px; line-height: 1.5; margin-bottom: 0;">
          This verification link will expire in 24 hours. If you did not create this account, you can safely ignore this email.
        </p>
      </div>
    `,
  },
  welcome: {
    subject: "Welcome to Lcode API Marketplace!",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background-color: #0A0A0A; border: 1px solid #2E2E2E; border-radius: 16px; color: #FAFAFA;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #EA580C; margin: 0; font-size: 24px;">Lcode <span style="color: #FAFAFA;">API</span></h2>
        </div>
        <h3 style="font-size: 18px; margin-top: 0; margin-bottom: 12px; color: #FAFAFA;">Welcome Aboard!</h3>
        <p style="color: #A3A3A3; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
          Hi {{NAME}}, we are thrilled to have you here. Lcode API is a premium marketplace featuring tools downloader APIs, Canva template renderers, AI helpers, and much more.
        </p>
        <p style="color: #A3A3A3; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          Head over to your dashboard to get your API keys and read the developer docs to get started in minutes.
        </p>
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="{{APP_URL}}/dashboard"
             style="display: inline-block; padding: 12px 30px; background: #EA580C;
                    color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
            Go to Dashboard
          </a>
        </div>
        <p style="color: #737373; font-size: 12px; margin-bottom: 0;">
          Need help? Simply reply to this email or check our documentation at {{APP_URL}}/docs.
        </p>
      </div>
    `,
  },
  reset: {
    subject: "Reset your password - Lcode API",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background-color: #0A0A0A; border: 1px solid #2E2E2E; border-radius: 16px; color: #FAFAFA;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #EA580C; margin: 0; font-size: 24px;">Lcode <span style="color: #FAFAFA;">API</span></h2>
        </div>
        <h3 style="font-size: 18px; margin-top: 0; margin-bottom: 12px; color: #FAFAFA;">Reset Your Password</h3>
        <p style="color: #A3A3A3; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          You requested to reset your password. Click the button below to secure a new password for your account.
        </p>
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="{{APP_URL}}/reset-password?token={{TOKEN}}"
             style="display: inline-block; padding: 12px 30px; background: #EA580C;
                    color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
            Reset Password
          </a>
        </div>
        <p style="color: #737373; font-size: 12px; line-height: 1.5; margin-bottom: 0;">
          This link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email.
        </p>
      </div>
    `,
  },
  payment: {
    subject: "Invoice Approved! Payment Successful - Lcode API",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background-color: #0A0A0A; border: 1px solid #2E2E2E; border-radius: 16px; color: #FAFAFA;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #EA580C; margin: 0; font-size: 24px;">Lcode <span style="color: #FAFAFA;">API</span></h2>
        </div>
        <h3 style="font-size: 18px; margin-top: 0; margin-bottom: 12px; color: #FAFAFA;">Payment Approved</h3>
        <p style="color: #A3A3A3; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
          Great news! Your manual payment invoice <strong>{{INVOICE_ID}}</strong> has been reviewed and approved.
        </p>
        <div style="background-color: #171717; padding: 16px; border-radius: 8px; border: 1px solid #2E2E2E; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #A3A3A3;">
            <tr>
              <td style="padding: 4px 0; font-weight: 600;">Amount Paid:</td>
              <td style="padding: 4px 0; text-align: right; color: #FAFAFA;">\${{AMOUNT}}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: 600;">Method:</td>
              <td style="padding: 4px 0; text-align: right; color: #FAFAFA;">{{METHOD}}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: 600;">Status:</td>
              <td style="padding: 4px 0; text-align: right; color: #22C55E; font-family: monospace;">APPROVED</td>
            </tr>
          </table>
        </div>
        <p style="color: #A3A3A3; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          Your plan upgrades are now active. Enjoy elevated requests limits!
        </p>
        <div style="text-align: center; margin-bottom: 12px;">
          <a href="{{APP_URL}}/dashboard"
             style="display: inline-block; padding: 12px 30px; background: #EA580C;
                    color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
            Open Dashboard
          </a>
        </div>
      </div>
    `,
  },
  upgrade: {
    subject: "Your Subscription Plan Has Been Upgraded! - Lcode API",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background-color: #0A0A0A; border: 1px solid #2E2E2E; border-radius: 16px; color: #FAFAFA;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #EA580C; margin: 0; font-size: 24px;">Lcode <span style="color: #FAFAFA;">API</span></h2>
        </div>
        <h3 style="font-size: 18px; margin-top: 0; margin-bottom: 12px; color: #FAFAFA;">Plan Upgraded</h3>
        <p style="color: #A3A3A3; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
          Hi developer, your account subscription has been successfully upgraded to the <strong>{{PLAN_NAME}}</strong>.
        </p>
        <div style="background-color: #171717; padding: 16px; border-radius: 8px; border: 1px solid #2E2E2E; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #A3A3A3;">
            <tr>
              <td style="padding: 4px 0; font-weight: 600;">Active Plan:</td>
              <td style="padding: 4px 0; text-align: right; color: #FAFAFA; font-weight: bold;">{{PLAN_NAME}}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: 600;">Requests Limit:</td>
              <td style="padding: 4px 0; text-align: right; color: #FAFAFA;">{{LIMIT}} requests/day</td>
            </tr>
          </table>
        </div>
        <p style="color: #A3A3A3; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          Your new features and rate limits are now fully available on your active API keys.
        </p>
        <div style="text-align: center;">
          <a href="{{APP_URL}}/dashboard"
             style="display: inline-block; padding: 12px 30px; background: #EA580C;
                    color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
            View Documentation
          </a>
        </div>
      </div>
    `,
  },
};

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ templates });
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { templateId, testEmail } = body;

    if (!templateId || !testEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const template = templates[templateId];
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Dynamic replacement variables for test mail
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    let processedHtml = template.html
      .replace(/{{APP_URL}}/g, appUrl)
      .replace(/{{TOKEN}}/g, "test-token-value")
      .replace(/{{NAME}}/g, "Test Developer")
      .replace(/{{INVOICE_ID}}/g, "INV-TEST-99")
      .replace(/{{AMOUNT}}/g, "29.00")
      .replace(/{{METHOD}}/g, "Test Bank Transfer")
      .replace(/{{PLAN_NAME}}/g, "Premium Plan")
      .replace(/{{LIMIT}}/g, "50,000");

    await transporter.sendMail({
      from: `Lcode API Test <${FROM_ADDRESS}>`,
      to: testEmail,
      subject: `[TEST] ${template.subject}`,
      html: processedHtml,
    });

    await logAdminAction(admin.id, "TEST_EMAIL", `Sent test email (${templateId}) to ${testEmail}`, "0.0.0.0");
    return NextResponse.json({ success: true, message: `Test email sent successfully to ${testEmail}` });
  } catch (error: any) {
    console.error("Test email sending failed:", error);
    return NextResponse.json(
      { error: `Mail transport failed: ${error.message || error}` },
      { status: 500 }
    );
  }
}

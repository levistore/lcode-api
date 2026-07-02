import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateResetToken } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";
import { forgotPasswordSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Find user (don't reveal if email exists)
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const resetToken = generateResetToken();

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      });

      // Send reset email (non-blocking)
      sendPasswordResetEmail(email, resetToken).catch(console.error);
    }

    // Always return success (security: don't reveal if email exists)
    return NextResponse.json({
      message: "If an account with that email exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

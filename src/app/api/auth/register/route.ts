import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  generateVerificationToken,
  signJWT,
  generateSessionToken,
  getSessionExpiry,
} from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { registerSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    // Check existing user
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Create user
    const hashedPassword = await hashPassword(password);
    const verificationToken = generateVerificationToken();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationToken,
        verificationExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      },
    });

    // Create session
    const sessionToken = generateSessionToken();
    const jwt = await signJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt: getSessionExpiry(),
      },
    });

    // Send verification email (non-blocking)
    sendVerificationEmail(email, verificationToken).catch(console.error);

    // Set session cookie
    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        message: "Account created. Please check your email to verify.",
      },
      { status: 201 }
    );

    response.cookies.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    response.cookies.set("token", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

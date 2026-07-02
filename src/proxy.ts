import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/lib/auth";

// Paths that require authentication
const protectedPaths = ["/dashboard"];
const adminPaths = ["/admin"];

// Paths that should redirect to dashboard if already authenticated
const authPaths = ["/login", "/register"];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log("Proxy intercepting request path:", pathname);
  const sessionToken = request.cookies.get("session")?.value;
  const jwtToken = request.cookies.get("token")?.value;

  const isAuthenticated = !!(sessionToken && jwtToken);

  // Protect regular user pages
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protect admin pages
  const isAdminPath = adminPaths.some((path) => pathname.startsWith(path));
  if (isAdminPath) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check role in JWT
    const payload = await verifyJWT(jwtToken || "");
    console.log("Proxy auth check:", {
      isAuthenticated,
      jwtTokenExists: !!jwtToken,
      payload,
    });
    
    // Support role === "SUPER_ADMIN" case-insensitively
    if (!payload || (payload.role.toUpperCase() !== "SUPER_ADMIN" && payload.role.toLowerCase() !== "superadmin")) {
      console.log("Proxy access denied, redirecting to /account. Role:", payload?.role);
      // Forbidden: redirect to /account
      return NextResponse.redirect(new URL("/account", request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));
  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};

import * as authService from "../services/auth.service.js";
import * as emailService from "../services/email.service.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: "/",
};

export async function register(req, res) {
  try {
    const { user, verificationToken } = await authService.registerUser({
      email: req.validated.email,
      name: req.validated.name,
      password: req.validated.password,
    });

    // Auto log in on register like Next.js frontend did (optional, but let's do it or let them check email)
    // Wait, the next.js frontend redirected to /dashboard on register but also sent email.
    // Let's sign session/JWT here just to make sure they get authenticated, setting cookies.
    const loginResult = await authService.loginUser(req.validated.email, req.validated.password);

    res.cookie("session", loginResult.refreshToken, cookieOptions);
    res.cookie("token", loginResult.accessToken, cookieOptions);

    // Try sending verification email (non-blocking log catch)
    await emailService.sendVerificationEmail(user.email, verificationToken).catch(() => {});

    return res.status(201).json({ user });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || "Registration failed" });
  }
}

export async function login(req, res) {
  try {
    const result = await authService.loginUser({
      email: req.validated.email,
      password: req.validated.password,
    });

    res.cookie("session", result.refreshToken, cookieOptions);
    res.cookie("token", result.accessToken, cookieOptions);

    return res.status(200).json({ user: result.user });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || "Login failed" });
  }
}

export async function refreshToken(req, res) {
  try {
    const result = await authService.refreshAccessToken(req.validated.refreshToken);
    
    res.cookie("session", result.refreshToken, cookieOptions);
    res.cookie("token", result.accessToken, cookieOptions);

    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || "Token refresh failed" });
  }
}

export async function logout(req, res) {
  try {
    const cookies = req.headers.cookie ? parseCookies(req.headers.cookie) : {};
    const sessionToken = cookies.session || req.body.refreshToken;

    if (req.user && sessionToken) {
      await authService.logoutUser(req.user.id, sessionToken);
    }

    res.clearCookie("session", { path: "/" });
    res.clearCookie("token", { path: "/" });

    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || "Logout failed" });
  }
}

export async function verifyEmail(req, res) {
  try {
    const token = req.body?.token || req.query?.token;
    if (!token) {
      return res.status(400).json({ error: "Verification token is required" });
    }

    await authService.verifyEmail(token);
    return res.status(200).json({ success: true, message: "Email verified successfully" });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || "Email verification failed" });
  }
}

export async function forgotPassword(req, res) {
  try {
    const result = await authService.requestPasswordReset(req.validated.email);
    if (result?.resetToken) {
      await emailService.sendPasswordResetEmail(req.validated.email, result.resetToken).catch(() => {});
    }
    return res.status(200).json({ success: true, message: "If the email exists, a password reset link has been sent." });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || "Failed to process request" });
  }
}

export async function resetPassword(req, res) {
  try {
    const result = await authService.resetPassword(req.validated.token, req.validated.password);
    return res.status(200).json({ success: true, message: result.message });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || "Password reset failed" });
  }
}

export async function getProfile(req, res) {
  try {
    const user = await authService.getProfile(req.user.id);
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || "Failed to get profile" });
  }
}

// Internal cookie parsing helper for logout
function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  const items = cookieHeader.split(";");
  for (const item of items) {
    const parts = item.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim();
      cookies[key] = decodeURIComponent(val);
    }
  }
  return cookies;
}

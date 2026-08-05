"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";

// In-memory failed login tracking to mitigate brute force attacks
const failedAttemptsMap = new Map<string, { count: number; lockUntil: number }>();

function getAdminSecret(): string {
  return process.env.ADMIN_PASSWORD || "mk-admin-secure-fallback-password-2026";
}

function getExpectedToken(): string {
  const secret = getAdminSecret();
  return crypto.createHash("sha256").update(`mk_admin_session_salt_${secret}`).digest("hex");
}

function timingSafeCheck(inputPass: string): boolean {
  const targetPass = getAdminSecret();
  
  // Hash both to fixed 256-bit length to prevent length & timing leak vulnerabilities
  const hashA = crypto.createHash("sha256").update(inputPass).digest();
  const hashB = crypto.createHash("sha256").update(targetPass).digest();
  
  return crypto.timingSafeEqual(hashA, hashB);
}

export async function login(formData: FormData) {
  const rawPassword = formData.get("password");

  // Validate input type and length
  if (!rawPassword || typeof rawPassword !== "string" || rawPassword.length > 256) {
    await new Promise((res) => setTimeout(res, 600));
    return { success: false, error: "Invalid credentials" };
  }

  const now = Date.now();
  const attemptKey = "admin_auth_attempts";
  const currentAttempts = failedAttemptsMap.get(attemptKey);

  if (currentAttempts && currentAttempts.lockUntil > now) {
    const remainingSecs = Math.ceil((currentAttempts.lockUntil - now) / 1000);
    return { success: false, error: `Too many failed attempts. Locked for ${remainingSecs} seconds.` };
  }

  const isValid = timingSafeCheck(rawPassword);

  if (isValid) {
    failedAttemptsMap.delete(attemptKey);

    const cookieStore = await cookies();
    cookieStore.set("admin_token", getExpectedToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return { success: true };
  }

  const count = (currentAttempts?.count || 0) + 1;
  let lockUntil = 0;
  if (count >= 5) {
    lockUntil = now + 15 * 60 * 1000; // 15 minute lockout after 5 failed attempts
  }
  failedAttemptsMap.set(attemptKey, { count, lockUntil });

  // Timing delay on failure to prevent rapid script probing
  await new Promise((res) => setTimeout(res, 600));

  return { success: false, error: "Invalid password" };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
  redirect("/admin");
}

export async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return false;

  const expected = getExpectedToken();
  const hashA = crypto.createHash("sha256").update(token).digest();
  const hashB = crypto.createHash("sha256").update(expected).digest();

  return crypto.timingSafeEqual(hashA, hashB);
}

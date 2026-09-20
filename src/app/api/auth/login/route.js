import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { createSession } from "@/lib/auth";
import {
  assertTrustedMutation,
  clientAddress,
  errorResponse,
  JSON_LIMITS,
  opaqueKey,
  readLimitedJson,
} from "@/lib/request-security";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { logServerError, requestId } from "@/lib/logger";
import { botProtectionResponse } from "@/lib/bot-protection";

const DUMMY_PASSWORD_HASH = "$2b$12$C6UzMDM.H6dfI/f/IKcEe.yrxq1bsu3fKn0NGmX2qtRROE5N5T7Kq";
export async function POST(req) {
  const id = requestId(req);
  try {
    assertTrustedMutation(req);
    const blocked = await botProtectionResponse();
    if (blocked) return blocked;
    const { email, password } = await readLimitedJson(req, JSON_LIMITS.login);
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase().slice(0, 254) : "";
    const candidatePassword = typeof password === "string" ? password.slice(0, 128) : "";
    const address = clientAddress(req);
    const ipLimit = await rateLimit({
      key: `login-ip:${opaqueKey(address)}`,
      limit: 20,
      windowMs: 15 * 60_000,
    });
    const accountLimit = await rateLimit({
      key: `login:${opaqueKey(clientAddress(req), normalizedEmail)}`,
      limit: 5,
      windowMs: 15 * 60_000,
    });
    if (!ipLimit.allowed) return rateLimitResponse(ipLimit);
    if (!accountLimit.allowed) return rateLimitResponse(accountLimit);
    if (!normalizedEmail || !candidatePassword) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({ email: normalizedEmail, active: true, role: "admin" });
    const valid = await bcrypt.compare(
      candidatePassword,
      user?.passwordHash || DUMMY_PASSWORD_HASH,
    );
    if (!user || !valid)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    await createSession(user);
    return NextResponse.json({
      ok: true,
      user: { id: String(user._id), email: user.email, role: user.role },
    });
  } catch (error) {
    if (!error.status) logServerError("auth_login_failed", error, { requestId: id });
    return errorResponse(error, "Sign in is temporarily unavailable");
  }
}

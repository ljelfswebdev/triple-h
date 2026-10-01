import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import {
  assertTrustedMutation,
  clientAddress,
  errorResponse,
  JSON_LIMITS,
  opaqueKey,
  readLimitedJson,
} from "@/lib/request-security";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { botProtectionResponse } from "@/lib/bot-protection";
import { CUSTOMER_PORTAL_ENABLED } from "@/lib/features";

const DUMMY_PASSWORD_HASH = "$2b$12$C6UzMDM.H6dfI/f/IKcEe.yrxq1bsu3fKn0NGmX2qtRROE5N5T7Kq";

export async function POST(req) {
  if (!CUSTOMER_PORTAL_ENABLED) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    assertTrustedMutation(req);
    const blocked = await botProtectionResponse();
    if (blocked) return blocked;
    const { email, password } = await readLimitedJson(req, JSON_LIMITS.login);
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase().slice(0, 254) : "";
    const candidatePassword = typeof password === "string" ? password.slice(0, 128) : "";
    const rate = await rateLimit({
      key: `portal-login:${opaqueKey(clientAddress(req), normalizedEmail)}`,
      limit: 8,
      windowMs: 15 * 60_000,
    });
    if (!rate.allowed) return rateLimitResponse(rate);
    await dbConnect();
    const user = await User.findOne({
      email: normalizedEmail,
      active: true,
      role: { $in: ["employee", "customer"] },
    });
    const valid = await bcrypt.compare(candidatePassword, user?.passwordHash || DUMMY_PASSWORD_HASH);
    if (!user || !valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    await createSession(user);
    return NextResponse.json({
      ok: true,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        category: user.category || "",
        mustChangePassword: Boolean(user.mustChangePassword),
        newsletter: Boolean(user.newsletter),
      },
    });
  } catch (error) {
    return errorResponse(error, "Sign in is temporarily unavailable");
  }
}

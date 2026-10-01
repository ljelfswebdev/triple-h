import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import PasswordReset from "@/models/PasswordReset";
import { assertTrustedMutation, errorResponse, JSON_LIMITS, readLimitedJson } from "@/lib/request-security";
import { botProtectionResponse } from "@/lib/bot-protection";
import { CUSTOMER_PORTAL_ENABLED } from "@/lib/features";

export async function POST(req) {
  if (!CUSTOMER_PORTAL_ENABLED) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    assertTrustedMutation(req);
    const blocked = await botProtectionResponse();
    if (blocked) return blocked;
    const { token, password, confirmPassword } = await readLimitedJson(req, JSON_LIMITS.login);
    if (typeof password !== "string" || password.length < 10 || password.length > 128) {
      return NextResponse.json({ error: "Password must be 10 to 128 characters" }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }
    const tokenHash = createHash("sha256").update(String(token || "")).digest("hex");
    await dbConnect();
    const reset = await PasswordReset.findOne({ tokenHash, expiresAt: { $gt: new Date() } });
    if (!reset) return NextResponse.json({ error: "This reset link is invalid or expired" }, { status: 400 });
    await User.findByIdAndUpdate(reset.user, {
      passwordHash: await bcrypt.hash(password, 12),
      mustChangePassword: false,
    });
    await PasswordReset.deleteMany({ user: reset.user });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error, "Password could not be reset");
  }
}

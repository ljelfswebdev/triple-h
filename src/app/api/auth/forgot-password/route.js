import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { transporter } from "@/lib/email";
import User from "@/models/User";
import PasswordReset from "@/models/PasswordReset";
import { getSiteUrl } from "@/lib/site-url";
import { assertTrustedMutation, errorResponse, JSON_LIMITS, readLimitedJson } from "@/lib/request-security";
import { botProtectionResponse } from "@/lib/bot-protection";

export async function POST(req) {
  try {
    assertTrustedMutation(req);
    const blocked = await botProtectionResponse();
    if (blocked) return blocked;
    const { email } = await readLimitedJson(req, JSON_LIMITS.login);
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase().slice(0, 254) : "";
    await dbConnect();
    const user = await User.findOne({ email: normalizedEmail, active: true });
    if (user) {
      const token = randomBytes(32).toString("hex");
      await PasswordReset.deleteMany({ user: user._id });
      await PasswordReset.create({
        user: user._id,
        tokenHash: createHash("sha256").update(token).digest("hex"),
        expiresAt: new Date(Date.now() + 60 * 60_000),
      });
      const resetUrl = `${getSiteUrl()}/portal/reset-password?token=${token}`;
      try {
        await transporter().sendMail({
          from: `${process.env.SMTP_FROM_NAME || "Triple H"} <${process.env.SMTP_FROM_EMAIL}>`,
          to: user.email,
          subject: "Reset your Triple H portal password",
          text: `Use this secure link within one hour to reset your password: ${resetUrl}`,
        });
      } catch {
        // Keep the response opaque so account existence is never disclosed.
      }
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error, "The request could not be completed");
  }
}

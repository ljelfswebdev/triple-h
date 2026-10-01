import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAnySession } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { assertTrustedMutation, errorResponse, JSON_LIMITS, readLimitedJson } from "@/lib/request-security";
import { botProtectionResponse } from "@/lib/bot-protection";
import { CUSTOMER_PORTAL_ENABLED } from "@/lib/features";

export async function PUT(req) {
  if (!CUSTOMER_PORTAL_ENABLED) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const session = await getAnySession(["employee", "customer"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    assertTrustedMutation(req);
    const blocked = await botProtectionResponse();
    if (blocked) return blocked;
    const { currentPassword, password, confirmPassword } = await readLimitedJson(req, JSON_LIMITS.login);
    if (typeof password !== "string" || password.length < 10 || password.length > 128) {
      return NextResponse.json({ error: "New password must be 10 to 128 characters" }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }
    await dbConnect();
    const user = await User.findById(session.sub);
    if (!user || !(await bcrypt.compare(String(currentPassword || ""), user.passwordHash))) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }
    user.passwordHash = await bcrypt.hash(password, 12);
    user.mustChangePassword = false;
    await user.save();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error, "Password could not be changed");
  }
}

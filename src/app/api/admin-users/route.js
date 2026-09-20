import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";
import { normaliseAdminUser, publicAdminUser } from "@/lib/admin-users";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import {
  assertTrustedMutation,
  errorResponse,
  JSON_LIMITS,
  readLimitedJson,
} from "@/lib/request-security";
import { logServerError, requestId } from "@/lib/logger";

export async function GET() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const users = await User.find({ role: "admin" }).sort({ name: 1, email: 1 });
  return NextResponse.json(users.map(publicAdminUser));
}

export async function POST(req) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    assertTrustedMutation(req);
    const input = normaliseAdminUser(await readLimitedJson(req, JSON_LIMITS.login), {
      creating: true,
    });
    await dbConnect();
    const user = await User.create({
      name: input.name,
      email: input.email,
      active: input.active,
      role: "admin",
      passwordHash: await bcrypt.hash(input.password, 12),
    });
    return NextResponse.json(publicAdminUser(user), { status: 201 });
  } catch (error) {
    const duplicate = error?.code === 11000;
    if (error.status) return errorResponse(error);
    if (!duplicate)
      logServerError("admin_user_create_failed", error, { requestId: requestId(req) });
    return NextResponse.json(
      {
        error: duplicate
          ? "That email address is already in use"
          : "The admin user could not be created",
      },
      { status: duplicate ? 409 : 500 },
    );
  }
}

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
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

async function userId(ctx) {
  const { id } = await ctx.params;
  return mongoose.Types.ObjectId.isValid(id) ? id : null;
}

export async function GET(_, ctx) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const id = await userId(ctx);
  const user = id ? await User.findOne({ _id: id, role: "admin" }) : null;
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(publicAdminUser(user));
}

export async function PUT(req, ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    assertTrustedMutation(req);
    const id = await userId(ctx);
    if (!id) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const input = normaliseAdminUser(await readLimitedJson(req, JSON_LIMITS.login));
    if (String(session.sub) === id && !input.active) {
      return NextResponse.json(
        { error: "You cannot deactivate your own account" },
        { status: 400 },
      );
    }

    await dbConnect();
    const current = await User.findOne({ _id: id, role: "admin" });
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (current.active && !input.active) {
      const activeAdmins = await User.countDocuments({ role: "admin", active: true });
      if (activeAdmins <= 1) {
        return NextResponse.json(
          { error: "At least one active admin is required" },
          { status: 400 },
        );
      }
    }

    current.name = input.name;
    current.email = input.email;
    current.active = input.active;
    if (input.password) current.passwordHash = await bcrypt.hash(input.password, 12);
    await current.save();
    return NextResponse.json(publicAdminUser(current));
  } catch (error) {
    const duplicate = error?.code === 11000;
    if (error.status) return errorResponse(error);
    if (!duplicate)
      logServerError("admin_user_update_failed", error, { requestId: requestId(req) });
    return NextResponse.json(
      {
        error: duplicate
          ? "That email address is already in use"
          : "The admin user could not be saved",
      },
      { status: duplicate ? 409 : 500 },
    );
  }
}

export async function DELETE(request, ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    assertTrustedMutation(request);
  } catch (error) {
    return errorResponse(error);
  }
  await dbConnect();
  const id = await userId(ctx);
  if (!id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (String(session.sub) === id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  const user = await User.findOne({ _id: id, role: "admin" });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user.active) {
    const activeAdmins = await User.countDocuments({ role: "admin", active: true });
    if (activeAdmins <= 1) {
      return NextResponse.json({ error: "At least one active admin is required" }, { status: 400 });
    }
  }
  await user.deleteOne();
  return NextResponse.json({ ok: true });
}

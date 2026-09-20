import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { assertTrustedMutation, errorResponse, JSON_LIMITS, readLimitedJson } from "@/lib/request-security";

export async function PUT(req, { params }) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    assertTrustedMutation(req);
    const { id } = await params;
    const input = await readLimitedJson(req, JSON_LIMITS.login);
    const updates = {
      name: String(input.name || "").trim().slice(0, 120),
      email: String(input.email || "").trim().toLowerCase().slice(0, 254),
      role: ["employee", "customer"].includes(input.role) ? input.role : "customer",
      category: String(input.category || "").trim().slice(0, 100),
      company: String(input.company || "").trim().slice(0, 200),
      phone: String(input.phone || "").trim().slice(0, 50),
      active: input.active !== false,
      newsletter: Boolean(input.newsletter),
    };
    if (input.password) {
      if (String(input.password).length < 10) {
        return NextResponse.json({ error: "Password must be at least 10 characters" }, { status: 400 });
      }
      updates.passwordHash = await bcrypt.hash(String(input.password), 12);
      updates.mustChangePassword = true;
    }
    await dbConnect();
    const user = await User.findOneAndUpdate(
      { _id: id, role: { $in: ["employee", "customer"] } },
      updates,
      { new: true, runValidators: true },
    );
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error, "User could not be updated");
  }
}

export async function DELETE(req, { params }) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  assertTrustedMutation(req);
  const { id } = await params;
  await dbConnect();
  await User.findOneAndDelete({ _id: id, role: { $in: ["employee", "customer"] } });
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { assertTrustedMutation, errorResponse, JSON_LIMITS, readLimitedJson } from "@/lib/request-security";

const publicUser = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
  category: user.category || "",
  company: user.company || "",
  phone: user.phone || "",
  active: user.active !== false,
  newsletter: Boolean(user.newsletter),
  mustChangePassword: Boolean(user.mustChangePassword),
});

export async function GET() {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const users = await User.find({ role: { $in: ["employee", "customer"] } }).sort({ role: 1, name: 1 });
  return NextResponse.json(users.map(publicUser));
}

export async function POST(req) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    assertTrustedMutation(req);
    const input = await readLimitedJson(req, JSON_LIMITS.login);
    const role = ["employee", "customer"].includes(input.role) ? input.role : "customer";
    const password = String(input.password || "");
    if (!String(input.name || "").trim() || password.length < 10) {
      return NextResponse.json({ error: "Name and a 10+ character password are required" }, { status: 400 });
    }
    await dbConnect();
    const user = await User.create({
      name: String(input.name).trim().slice(0, 120),
      email: String(input.email || "").trim().toLowerCase().slice(0, 254),
      role,
      category: String(input.category || "").trim().slice(0, 100),
      company: String(input.company || "").trim().slice(0, 200),
      phone: String(input.phone || "").trim().slice(0, 50),
      active: input.active !== false,
      newsletter: Boolean(input.newsletter),
      mustChangePassword: true,
      passwordHash: await bcrypt.hash(password, 12),
    });
    return NextResponse.json(publicUser(user), { status: 201 });
  } catch (error) {
    return errorResponse(error, error?.code === 11000 ? "That email is already in use" : "User could not be saved");
  }
}

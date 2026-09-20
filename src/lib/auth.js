import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { dbConnect } from "./db.js";
import User from "../models/User.js";
const key = () => new TextEncoder().encode(process.env.AUTH_SECRET);
export async function createSession(user) {
  const token = await new SignJWT({
    sub: String(user._id),
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key());
  (await cookies()).set("cms_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 604800,
  });
}
export async function getSession() {
  try {
    const token = (await cookies()).get("cms_session")?.value;
    if (!token) return null;
    const payload = (await jwtVerify(token, key())).payload;
    if (!payload.sub || payload.role !== "admin") return null;
    await dbConnect();
    const user = await User.findOne({
      _id: payload.sub,
      active: true,
      role: "admin",
    }).select("email role");
    if (!user) return null;
    return {
      ...payload,
      email: user.email,
      role: user.role,
    };
  } catch {
    return null;
  }
}

export async function getAnySession(roles = ["admin", "employee", "customer"]) {
  try {
    const token = (await cookies()).get("cms_session")?.value;
    if (!token) return null;
    const payload = (await jwtVerify(token, key())).payload;
    if (!payload.sub || !roles.includes(payload.role)) return null;
    await dbConnect();
    const user = await User.findOne({
      _id: payload.sub,
      active: true,
      role: { $in: roles },
    }).select("name email role category company phone mustChangePassword newsletter");
    if (!user) return null;
    return {
      sub: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      category: user.category || "",
      company: user.company || "",
      phone: user.phone || "",
      mustChangePassword: Boolean(user.mustChangePassword),
      newsletter: Boolean(user.newsletter),
    };
  } catch {
    return null;
  }
}
export async function clearSession() {
  (await cookies()).delete("cms_session");
}

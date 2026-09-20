import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import NewsletterSubscriber from "@/models/NewsletterSubscriber";
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

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  try {
    assertTrustedMutation(req);
    const blocked = await botProtectionResponse();
    if (blocked) return blocked;
    const rate = await rateLimit({
      key: `portal-register:${opaqueKey(clientAddress(req))}`,
      limit: 5,
      windowMs: 60 * 60_000,
    });
    if (!rate.allowed) return rateLimitResponse(rate);

    const input = await readLimitedJson(req, JSON_LIMITS.admin);
    const name = String(input.name || "").trim().slice(0, 120);
    const email = String(input.email || "").trim().toLowerCase().slice(0, 254);
    const company = String(input.company || "").trim().slice(0, 200);
    const phone = String(input.phone || "").trim().slice(0, 50);
    const password = typeof input.password === "string" ? input.password : "";
    const confirmPassword =
      typeof input.confirmPassword === "string" ? input.confirmPassword : "";

    if (!name || !company || !emailPattern.test(email)) {
      return NextResponse.json(
        { error: "Name, company and a valid email address are required" },
        { status: 422 },
      );
    }
    if (password.length < 10 || password.length > 128) {
      return NextResponse.json(
        { error: "Password must be 10 to 128 characters" },
        { status: 422 },
      );
    }
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 422 },
      );
    }
    if (input.consent !== true) {
      return NextResponse.json(
        { error: "Please accept the privacy notice to create an account" },
        { status: 422 },
      );
    }

    await dbConnect();
    const existing = await User.findOne({ email }).select("_id");
    if (existing) {
      return NextResponse.json(
        { error: "An account with that email already exists" },
        { status: 409 },
      );
    }

    const user = await User.create({
      name,
      email,
      company,
      phone,
      category: "Customer",
      role: "customer",
      active: true,
      newsletter: Boolean(input.newsletter),
      mustChangePassword: false,
      passwordHash: await bcrypt.hash(password, 12),
    });

    if (input.newsletter) {
      await NewsletterSubscriber.findOneAndUpdate(
        { email },
        { email, name, source: "customer-registration", active: true, user: user._id },
        { upsert: true, setDefaultsOnInsert: true },
      );
    }

    await createSession(user);
    return NextResponse.json(
      {
        ok: true,
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
          category: user.category,
          company: user.company,
          newsletter: Boolean(user.newsletter),
          mustChangePassword: false,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error?.code === 11000) {
      return NextResponse.json(
        { error: "An account with that email already exists" },
        { status: 409 },
      );
    }
    return errorResponse(error, "Your account could not be created");
  }
}

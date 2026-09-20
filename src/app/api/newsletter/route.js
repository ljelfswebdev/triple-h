import { NextResponse } from "next/server";
import { getAnySession } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import NewsletterSubscriber from "@/models/NewsletterSubscriber";
import User from "@/models/User";
import {
  assertTrustedMutation,
  clientAddress,
  errorResponse,
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
      key: `newsletter:${opaqueKey(clientAddress(req))}`,
      limit: 8,
      windowMs: 10 * 60_000,
    });
    if (!rate.allowed) return rateLimitResponse(rate);
    const input = await readLimitedJson(req, 8_000);
    if (input.website) return NextResponse.json({ ok: true }, { status: 201 });
    const email = String(input.email || "").trim().toLowerCase().slice(0, 254);
    if (!emailPattern.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 422 });
    }
    const session = await getAnySession(["employee", "customer"]);
    await dbConnect();
    await NewsletterSubscriber.findOneAndUpdate(
      { email },
      {
        email,
        name: String(input.name || session?.name || "").trim().slice(0, 120),
        source: String(input.source || "website").trim().slice(0, 120),
        active: input.active !== false,
        ...(session ? { user: session.sub } : {}),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    if (session) {
      await User.findByIdAndUpdate(session.sub, { newsletter: input.active !== false });
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Newsletter preference could not be saved");
  }
}

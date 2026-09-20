import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { transporter } from "@/lib/email";
import NewsletterSubscriber from "@/models/NewsletterSubscriber";
import { assertTrustedMutation, errorResponse, readLimitedJson } from "@/lib/request-security";

export async function GET() {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const subscribers = await NewsletterSubscriber.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(subscribers);
}

export async function POST(req) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    assertTrustedMutation(req);
    const { subject, message } = await readLimitedJson(req, 40_000);
    if (!String(subject || "").trim() || !String(message || "").trim()) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
    }
    await dbConnect();
    const subscribers = await NewsletterSubscriber.find({ active: true }).select("email").lean();
    if (!subscribers.length) return NextResponse.json({ error: "No active subscribers" }, { status: 400 });
    await transporter().sendMail({
      from: `${process.env.SMTP_FROM_NAME || "Triple H"} <${process.env.SMTP_FROM_EMAIL}>`,
      to: process.env.CONTACT_RECIPIENT_EMAIL,
      bcc: subscribers.map((item) => item.email),
      subject: String(subject).trim().slice(0, 200),
      text: String(message).trim().slice(0, 30000),
    });
    return NextResponse.json({ ok: true, sent: subscribers.length });
  } catch (error) {
    return errorResponse(error, "Newsletter could not be sent");
  }
}

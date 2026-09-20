import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Notification from "@/models/Notification";
import { assertTrustedMutation, errorResponse, readLimitedJson } from "@/lib/request-security";

export async function GET() {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const notifications = await Notification.find().sort({ createdAt: -1 }).limit(100).lean();
  return NextResponse.json(notifications);
}

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    assertTrustedMutation(req);
    const input = await readLimitedJson(req, 40_000);
    const title = String(input.title || "").trim().slice(0, 200);
    const message = String(input.message || "").trim().slice(0, 5000);
    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
    }
    await dbConnect();
    const notification = await Notification.create({
      title,
      message,
      audienceRoles: (input.audienceRoles || []).filter((role) => ["employee", "customer"].includes(role)),
      audienceCategories: (input.audienceCategories || []).map((value) => String(value).trim().slice(0, 100)).filter(Boolean),
      audienceUserIds: (input.audienceUserIds || []).filter(Boolean),
      createdBy: session.sub,
    });
    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Notification could not be sent");
  }
}

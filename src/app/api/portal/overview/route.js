import { NextResponse } from "next/server";
import { getAnySession } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Notification from "@/models/Notification";
import { CUSTOMER_PORTAL_ENABLED } from "@/lib/features";

export async function GET() {
  if (!CUSTOMER_PORTAL_ENABLED) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const session = await getAnySession(["employee", "customer"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const notifications = await Notification.find({
    $and: [
      { audienceRoles: session.role },
      {
        $or: [
          { audienceCategories: { $size: 0 } },
          { audienceCategories: session.category },
          { audienceUserIds: session.sub },
        ],
      },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();
  return NextResponse.json({ session, notifications });
}

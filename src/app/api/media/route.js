import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { cloudinaryFolder } from "@/lib/cloudinary";
import { dbConnect } from "@/lib/db";
import Media from "@/models/Media";

export const runtime = "nodejs";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const type = req.nextUrl.searchParams.get("type");
  const query = {
    publicId: { $regex: `^${escapeRegex(cloudinaryFolder())}/` },
  };
  if (type === "image" || type === "video") query.resourceType = type;
  const total = await Media.countDocuments(query);

  const pageParam = req.nextUrl.searchParams.get("page");
  const limitParam = req.nextUrl.searchParams.get("limit");
  const paginated = pageParam !== null || limitParam !== null;
  const page = Math.max(1, Math.min(100_000, Number(pageParam) || 1));
  const limit = Math.max(1, Math.min(100, Number(limitParam) || 50));
  const mediaQuery = Media.find(query).sort({ createdAt: -1 });
  if (paginated) mediaQuery.skip((page - 1) * limit).limit(limit);
  else mediaQuery.limit(500);
  const items = await mediaQuery.lean();
  if (!paginated) return NextResponse.json(items);
  return NextResponse.json({
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

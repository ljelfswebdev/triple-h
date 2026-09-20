import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { getSession } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Media from "@/models/Media";
import mongoose from "mongoose";
import {
  assertTrustedMutation,
  errorResponse,
  JSON_LIMITS,
  readLimitedJson,
} from "@/lib/request-security";
import { logServerError, requestId } from "@/lib/logger";

export const runtime = "nodejs";

export async function PUT(req, ctx) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    assertTrustedMutation(req);
  } catch (error) {
    return errorResponse(error);
  }
  const { id } = await ctx.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  let body;
  try {
    body = await readLimitedJson(req, JSON_LIMITS.login);
  } catch (error) {
    return errorResponse(error);
  }
  await dbConnect();
  const media = await Media.findByIdAndUpdate(
    id,
    {
      $set: {
        alt: String(body.alt || "")
          .trim()
          .slice(0, 500),
        caption: String(body.caption || "")
          .trim()
          .slice(0, 2000),
      },
    },
    { new: true, runValidators: true },
  );
  return media
    ? NextResponse.json(media)
    : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function DELETE(request, ctx) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    assertTrustedMutation(request);
  } catch (error) {
    return errorResponse(error);
  }
  const { id } = await ctx.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  await dbConnect();
  const media = await Media.findById(id);
  if (!media) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Bundled Figma assets are local, not Cloudinary uploads.
  if (!media.url?.startsWith("/")) {
    try {
      await cloudinary.uploader.destroy(media.publicId, {
        resource_type: media.resourceType || "image",
        invalidate: true,
      });
    } catch (error) {
      logServerError("media_delete_failed", error, {
        requestId: requestId(request),
        publicId: media.publicId,
      });
      return NextResponse.json(
        { error: "Media deletion failed. Please try again." },
        { status: 502 },
      );
    }
  }
  await media.deleteOne();
  return NextResponse.json({ ok: true });
}

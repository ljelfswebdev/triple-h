import { NextResponse } from "next/server";
import cloudinary, { cloudinaryFolder } from "@/lib/cloudinary";
import { getSession } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { logServerError, requestId } from "@/lib/logger";
import { MAX_MEDIA_BYTES } from "@/lib/media-upload";
import {
  assertTrustedMutation,
  errorResponse,
  readLimitedJson,
} from "@/lib/request-security";
import { safeUrl } from "@/lib/security";
import Media from "@/models/Media";

export const runtime = "nodejs";

const ALLOWED_FORMATS = new Set([
  "avif",
  "gif",
  "jpeg",
  "jpg",
  "mov",
  "mp4",
  "png",
  "webm",
  "webp",
]);

function mimeType(asset) {
  if (asset.resource_type === "image") {
    return asset.format === "jpg" ? "image/jpeg" : `image/${asset.format}`;
  }
  if (asset.format === "mov") return "video/quicktime";
  return `video/${asset.format}`;
}

async function deleteRejectedAsset(publicId, resourceType, id) {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });
  } catch (error) {
    logServerError("media_rejected_upload_cleanup_failed", error, {
      requestId: id,
      publicId,
    });
  }
}

export async function POST(request) {
  const id = requestId(request);
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let input;
  try {
    assertTrustedMutation(request);
    input = await readLimitedJson(request, 8 * 1024);
  } catch (error) {
    return errorResponse(error);
  }

  const publicId = String(input.publicId || "").trim();
  const resourceType = String(input.resourceType || "").trim();
  const requiredPrefix = `${cloudinaryFolder()}/`;
  if (
    !publicId.startsWith(requiredPrefix) ||
    publicId.length > 500 ||
    !["image", "video", "raw"].includes(resourceType)
  ) {
    return NextResponse.json({ error: "Invalid upload reference" }, { status: 400 });
  }

  let asset;
  try {
    asset = await cloudinary.api.resource(publicId, {
      resource_type: resourceType,
      type: "upload",
    });
  } catch (error) {
    logServerError("media_cloud_verification_failed", error, {
      requestId: id,
      publicId,
    });
    return NextResponse.json(
      { error: "The uploaded file could not be verified" },
      { status: 400 },
    );
  }

  const secureUrl = safeUrl(asset.secure_url, { allowContact: false });
  const valid =
    asset.public_id === publicId &&
    ["image", "video"].includes(asset.resource_type) &&
    ALLOWED_FORMATS.has(String(asset.format || "").toLowerCase()) &&
    Number(asset.bytes) > 0 &&
    Number(asset.bytes) <= MAX_MEDIA_BYTES &&
    Boolean(secureUrl);

  if (!valid) {
    await deleteRejectedAsset(publicId, resourceType, id);
    return NextResponse.json(
      { error: "Only supported image/video files of 25MB or smaller are allowed" },
      { status: 415 },
    );
  }

  try {
    await dbConnect();
    const media = await Media.findOneAndUpdate(
      { publicId },
      {
        $setOnInsert: {
          publicId,
          resourceType: asset.resource_type,
          url: safeUrl(asset.url, { allowContact: false }),
          secureUrl,
          width: asset.width,
          height: asset.height,
          format: asset.format,
          bytes: asset.bytes,
          duration: asset.duration,
          mimeType: mimeType({
            ...asset,
            format: String(asset.format).toLowerCase(),
          }),
          alt: String(input.alt || "").trim().slice(0, 500),
        },
      },
      { new: true, runValidators: true, setDefaultsOnInsert: true, upsert: true },
    );
    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    logServerError("media_direct_upload_save_failed", error, {
      requestId: id,
      publicId,
    });
    return NextResponse.json(
      {
        error:
          "The file reached Cloudinary but could not be saved to the media library. Please try again.",
      },
      { status: 500 },
    );
  }
}

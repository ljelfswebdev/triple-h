import crypto from "node:crypto";
import { NextResponse } from "next/server";
import cloudinary, { cloudinaryFolder } from "@/lib/cloudinary";
import { getSession } from "@/lib/auth";
import { assertTrustedMutation, errorResponse } from "@/lib/request-security";

export const runtime = "nodejs";

export async function POST(request) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    assertTrustedMutation(request);
  } catch (error) {
    return errorResponse(error);
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Cloudinary is not configured" },
      { status: 503 },
    );
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = `${cloudinaryFolder()}/${crypto.randomUUID()}`;
  const signature = cloudinary.utils.api_sign_request(
    { public_id: publicId, timestamp },
    apiSecret,
  );

  return NextResponse.json({
    apiKey,
    publicId,
    signature,
    timestamp,
    uploadUrl: `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/auto/upload`,
  });
}

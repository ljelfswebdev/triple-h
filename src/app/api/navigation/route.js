import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Navigation from "@/models/Navigation";
import { getSession } from "@/lib/auth";
import { safeUrl, sanitizeCmsValue } from "@/lib/security";
import {
  assertTrustedMutation,
  errorResponse,
  JSON_LIMITS,
  readLimitedJson,
} from "@/lib/request-security";
import { invalidateNavigation } from "@/lib/invalidate-site-cache";
import { logServerError, requestId } from "@/lib/logger";
function normaliseNavigation(input) {
  const key = String(input.key || "main")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-");
  return {
    key: key || "main",
    items: (Array.isArray(input.items) ? input.items : []).slice(0, 100).map((item) => ({
      label: String(item.label || "").trim(),
      type: item.type === "custom" ? "custom" : "page",
      pageSlug: String(item.pageSlug || "").trim(),
      url: safeUrl(String(item.url || "").trim()),
      newTab: Boolean(item.newTab),
    })),
  };
}

export async function GET(req) {
  await dbConnect();
  const key = req.nextUrl.searchParams.get("key");
  if (key) {
    return NextResponse.json(
      sanitizeCmsValue((await Navigation.findOne({ key }).lean()) || { key, items: [] }),
    );
  }
  return NextResponse.json(sanitizeCmsValue(await Navigation.find().sort({ key: 1 }).lean()));
}
export async function POST(req) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    assertTrustedMutation(req);
  } catch (error) {
    return errorResponse(error);
  }
  try {
    const body = normaliseNavigation(await readLimitedJson(req, JSON_LIMITS.admin));
    await dbConnect();
    const navigation = await Navigation.create(body);
    await invalidateNavigation();
    return NextResponse.json(navigation, { status: 201 });
  } catch (error) {
    if (!error.status)
      logServerError("navigation_create_failed", error, {
        requestId: requestId(req),
      });
    return errorResponse(error, "Navigation could not be created");
  }
}
export async function PUT(req) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    assertTrustedMutation(req);
  } catch (error) {
    return errorResponse(error);
  }
  try {
    const body = normaliseNavigation(await readLimitedJson(req, JSON_LIMITS.admin));
    await dbConnect();
    const navigation = await Navigation.findOneAndUpdate(
      { key: body.key },
      { $set: body },
      { new: true, runValidators: true, upsert: true },
    );
    await invalidateNavigation();
    return NextResponse.json(navigation);
  } catch (error) {
    if (!error.status)
      logServerError("navigation_update_failed", error, {
        requestId: requestId(req),
      });
    return errorResponse(error, "Navigation could not be saved");
  }
}

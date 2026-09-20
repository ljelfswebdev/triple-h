import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { normaliseForm } from "@/lib/forms";
import Form from "@/models/Form";
import {
  assertTrustedMutation,
  errorResponse,
  JSON_LIMITS,
  readLimitedJson,
} from "@/lib/request-security";
import { logServerError, requestId } from "@/lib/logger";
import { invalidateForms } from "@/lib/invalidate-site-cache";

export async function GET() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  return NextResponse.json(await Form.find().sort({ name: 1 }).lean());
}

export async function POST(req) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    assertTrustedMutation(req);
    const input = normaliseForm(await readLimitedJson(req, JSON_LIMITS.admin));
    await dbConnect();
    const form = await Form.create(input);
    await invalidateForms();
    return NextResponse.json(form, { status: 201 });
  } catch (error) {
    const duplicate = error?.code === 11000;
    if (error.status) return errorResponse(error);
    if (!duplicate) logServerError("form_create_failed", error, { requestId: requestId(req) });
    return NextResponse.json(
      { error: duplicate ? "That form key already exists" : "Invalid form data" },
      { status: duplicate ? 409 : 400 },
    );
  }
}

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { formLookup, normaliseForm, publicForm } from "@/lib/forms";
import Form from "@/models/Form";
import {
  assertTrustedMutation,
  errorResponse,
  JSON_LIMITS,
  readLimitedJson,
} from "@/lib/request-security";
import { logServerError, requestId } from "@/lib/logger";
import { invalidateForms } from "@/lib/invalidate-site-cache";

export async function GET(_, ctx) {
  await dbConnect();
  const { key } = await ctx.params;
  const form = await Form.findOne(formLookup(key));

  if (!form) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json((await getSession()) ? form : publicForm(form));
}

export async function PUT(req, ctx) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    assertTrustedMutation(req);
    await dbConnect();
    const { key } = await ctx.params;
    const input = normaliseForm(await readLimitedJson(req, JSON_LIMITS.admin));
    const form = await Form.findOneAndUpdate(
      formLookup(key),
      { $set: input },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!form) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await invalidateForms();
    return NextResponse.json(form);
  } catch (error) {
    const duplicate = error?.code === 11000;
    if (error.status) return errorResponse(error);
    if (!duplicate) logServerError("form_update_failed", error, { requestId: requestId(req) });
    return NextResponse.json(
      { error: duplicate ? "That form key already exists" : "Invalid form data" },
      { status: duplicate ? 409 : 400 },
    );
  }
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
  await dbConnect();
  const { key } = await ctx.params;
  const result = await Form.deleteOne(formLookup(key));
  if (!result.deletedCount) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await invalidateForms();
  return NextResponse.json({ ok: true });
}

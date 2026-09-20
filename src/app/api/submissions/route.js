import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Form from "@/models/Form";
import FormSubmission from "@/models/FormSubmission";
import { transporter } from "@/lib/email";
import { getSession } from "@/lib/auth";
import { normaliseForm } from "@/lib/forms";
import { presentSubmissions } from "@/lib/submissions";
import { validateFormValues } from "@/lib/form-validation";
import {
  assertTrustedMutation,
  clientAddress,
  errorResponse,
  JSON_LIMITS,
  opaqueKey,
  readLimitedJson,
} from "@/lib/request-security";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { logServerError, requestId } from "@/lib/logger";
import { botProtectionResponse } from "@/lib/bot-protection";

export async function GET(req) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const pageParam = req.nextUrl.searchParams.get("page");
  const limitParam = req.nextUrl.searchParams.get("limit");
  const paginated = pageParam !== null || limitParam !== null;
  const page = Math.max(1, Math.min(100_000, Number(pageParam) || 1));
  const limit = Math.max(1, Math.min(100, Number(limitParam) || 50));
  const query = FormSubmission.find().sort({ createdAt: -1 });
  if (paginated) query.skip((page - 1) * limit).limit(limit);
  else query.limit(500);
  const submissions = await query.lean();
  const items = await presentSubmissions(submissions);
  if (!paginated) return NextResponse.json(items);
  const total = await FormSubmission.countDocuments();
  return NextResponse.json({
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
export async function POST(req) {
  const id = requestId(req);
  try {
    assertTrustedMutation(req);
    const blocked = await botProtectionResponse();
    if (blocked) return blocked;
    const rate = await rateLimit({
      key: `submission:${opaqueKey(clientAddress(req))}`,
      limit: 10,
      windowMs: 10 * 60_000,
    });
    if (!rate.allowed) return rateLimitResponse(rate);
    const { formKey, values, formGuard } = await readLimitedJson(req, JSON_LIMITS.submission);
    if (formGuard === true) return NextResponse.json({ ok: true }, { status: 201 });
    if (typeof formKey !== "string" || !/^[a-z0-9-]{1,100}$/.test(formKey)) {
      return NextResponse.json({ error: "Invalid form" }, { status: 400 });
    }
    await dbConnect();
    const form = await Form.findOne({ key: formKey });
    if (!form) return NextResponse.json({ error: "Invalid form" }, { status: 400 });
    const fields = normaliseForm(form.toObject()).fields;
    const { cleanValues, fieldErrors } = validateFormValues(fields, values);
    if (Object.keys(fieldErrors).length) {
      return NextResponse.json(
        { error: "Please check the highlighted fields.", fields: fieldErrors },
        { status: 422 },
      );
    }

    const submission = await FormSubmission.create({
      form: form._id,
      formKey,
      formName: form.name,
      values: cleanValues,
      fields: fields
        .filter((field) => field.type !== "submit" && field.name)
        .map((field) => ({
          name: field.name,
          label: field.label,
          value: cleanValues[field.name],
        })),
    });
    try {
      const text = Object.entries(cleanValues)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");
      await transporter().sendMail({
        from: `${process.env.SMTP_FROM_NAME || "Website"} <${process.env.SMTP_FROM_EMAIL}>`,
        to: form.recipientEmail || process.env.CONTACT_RECIPIENT_EMAIL,
        subject: `New ${form.name} submission`,
        text,
      });
      submission.status = "emailed";
      await submission.save();
    } catch (error) {
      logServerError("submission_email_failed", error, {
        requestId: id,
        submissionId: String(submission._id),
      });
      submission.status = "email_failed";
      try {
        await submission.save();
      } catch (statusError) {
        logServerError("submission_status_update_failed", statusError, {
          requestId: id,
          submissionId: String(submission._id),
        });
      }
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (!error.status) logServerError("submission_failed", error, { requestId: id });
    return errorResponse(error, "The form could not be submitted. Please try again.");
  }
}

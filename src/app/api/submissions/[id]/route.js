import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { presentSubmissions } from "@/lib/submissions";
import FormSubmission from "@/models/FormSubmission";
import { assertTrustedMutation, errorResponse } from "@/lib/request-security";

export async function GET(_, context) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  await dbConnect();
  const submission = await FormSubmission.findById(id);
  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const [presented] = await presentSubmissions([submission]);
  return NextResponse.json(presented);
}

export async function DELETE(request, context) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    assertTrustedMutation(request);
  } catch (error) {
    return errorResponse(error);
  }
  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  await dbConnect();
  const result = await FormSubmission.deleteOne({ _id: id });
  if (!result.deletedCount) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

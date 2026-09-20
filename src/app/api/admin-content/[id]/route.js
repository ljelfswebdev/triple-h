import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { normalizeContentItem } from "@/lib/content-items";
import { dbConnect } from "@/lib/db";
import ContentItem from "@/models/ContentItem";
import { assertTrustedMutation, errorResponse, readLimitedJson } from "@/lib/request-security";

export async function GET(_req, { params }) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await dbConnect();
  const item = await ContentItem.findById(id).lean();
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req, { params }) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    assertTrustedMutation(req);
    const { id } = await params;
    const item = normalizeContentItem(await readLimitedJson(req, 250_000));
    await dbConnect();
    const saved = await ContentItem.findByIdAndUpdate(id, item, { new: true, runValidators: true });
    if (!saved) return NextResponse.json({ error: "Not found" }, { status: 404 });
    revalidateTag("triple-h-content", "max");
    return NextResponse.json(saved);
  } catch (error) {
    return errorResponse(error, "Content could not be saved");
  }
}

export async function DELETE(req, { params }) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  assertTrustedMutation(req);
  const { id } = await params;
  await dbConnect();
  await ContentItem.findByIdAndDelete(id);
  revalidateTag("triple-h-content", "max");
  return NextResponse.json({ ok: true });
}

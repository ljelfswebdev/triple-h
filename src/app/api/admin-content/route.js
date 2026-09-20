import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { contentSortForKind, normalizeContentItem } from "@/lib/content-items";
import { dbConnect } from "@/lib/db";
import ContentItem from "@/models/ContentItem";
import { assertTrustedMutation, errorResponse, readLimitedJson } from "@/lib/request-security";
import { RequestError } from "@/lib/request-security";

export async function GET(req) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const kind = req.nextUrl.searchParams.get("kind");
  const items = await ContentItem.find(kind ? { kind } : {})
    .sort(kind ? contentSortForKind(kind) : { kind: 1, sortOrder: 1, _id: 1 })
    .lean();
  return NextResponse.json(items);
}

export async function POST(req) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    assertTrustedMutation(req);
    const item = normalizeContentItem(await readLimitedJson(req, 250_000));
    await dbConnect();
    const lastItem = await ContentItem.findOne({ kind: item.kind, sortOrder: { $exists: true } })
      .sort({ sortOrder: -1 })
      .select("sortOrder")
      .lean();
    const saved = await ContentItem.create({ ...item, sortOrder: Number(lastItem?.sortOrder ?? -1) + 1 });
    revalidateTag("triple-h-content", "max");
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    return errorResponse(error, error?.code === 11000 ? "That slug already exists" : "Content could not be saved");
  }
}

export async function PATCH(req) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    assertTrustedMutation(req);
    const input = await readLimitedJson(req, 100_000);
    const kind = String(input.kind || "").trim();
    const orderedIds = Array.isArray(input.orderedIds) ? input.orderedIds.map(String) : [];

    if (!kind || !orderedIds.length || orderedIds.length > 1000) {
      throw new RequestError("A content type and ordered item list are required");
    }
    if (new Set(orderedIds).size !== orderedIds.length || orderedIds.some((id) => !/^[a-f0-9]{24}$/i.test(id))) {
      throw new RequestError("The ordered item list is invalid");
    }

    await dbConnect();
    const records = await ContentItem.find({ kind }).select("_id").lean();
    const recordIds = new Set(records.map((record) => String(record._id)));
    if (recordIds.size !== orderedIds.length || orderedIds.some((id) => !recordIds.has(id))) {
      throw new RequestError("The ordered item list is out of date. Refresh and try again.", 409);
    }

    await ContentItem.bulkWrite(
      orderedIds.map((id, sortOrder) => ({
        updateOne: { filter: { _id: id, kind }, update: { $set: { sortOrder } } },
      })),
    );
    revalidateTag("triple-h-content", "max");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error, "Content order could not be saved");
  }
}

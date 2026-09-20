import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Page from "@/models/Page";
import { getSession } from "@/lib/auth";
import { sanitizeCmsValue } from "@/lib/security";
import {
  assertTrustedMutation,
  errorResponse,
  JSON_LIMITS,
  readLimitedJson,
} from "@/lib/request-security";
import { invalidatePage } from "@/lib/invalidate-site-cache";
import { createDefaultPage, pageDefinitions } from "@/lib/page-definitions";
import { mergePageDefaults } from "@/lib/page-content";
export async function GET(_, ctx) {
  await dbConnect();
  const { slug } = await ctx.params;
  const page = await Page.findOne({ slug }).lean();
  if (page) return NextResponse.json(sanitizeCmsValue(
    pageDefinitions[slug] ? mergePageDefaults(createDefaultPage(slug), page) : page,
  ));
  if (pageDefinitions[slug]) return NextResponse.json(createDefaultPage(slug));
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
export async function PUT(req, ctx) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    assertTrustedMutation(req);
  } catch (error) {
    return errorResponse(error);
  }
  const { slug } = await ctx.params;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100)
    return NextResponse.json({ error: "Invalid page slug" }, { status: 400 });
  let body;
  try {
    body = sanitizeCmsValue(await readLimitedJson(req, JSON_LIMITS.admin));
  } catch (error) {
    return errorResponse(error);
  }
  const update = {
    title: typeof body.title === "string" ? body.title.trim().slice(0, 200) : "",
    content: body.content || {},
    seo: body.seo || {},
  };
  await dbConnect();
  const page = await Page.findOneAndUpdate(
    { slug },
    { $set: update, $setOnInsert: { slug } },
    { new: true, runValidators: true, upsert: true },
  );
  await invalidatePage(slug);
  return NextResponse.json(page);
}
export async function DELETE(request, ctx) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    assertTrustedMutation(request);
  } catch (error) {
    return errorResponse(error);
  }
  const { slug } = await ctx.params;
  await dbConnect();
  await Page.deleteOne({ slug });
  await invalidatePage(slug);
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Page from "@/models/Page";
import { sanitizeCmsValue } from "@/lib/security";

export async function GET() {
  await dbConnect();
  const pages = await Page.find({}, { slug: 1, title: 1 }).sort({ title: 1 }).lean();
  return NextResponse.json(sanitizeCmsValue(pages));
}

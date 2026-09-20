import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";
import { assertTrustedMutation, errorResponse } from "@/lib/request-security";
export async function POST(request) {
  try {
    assertTrustedMutation(request);
  } catch (error) {
    return errorResponse(error);
  }
  await clearSession();
  return NextResponse.json({ ok: true });
}

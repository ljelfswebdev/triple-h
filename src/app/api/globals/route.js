import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Globals from "@/models/Globals";
import { getSession } from "@/lib/auth";
import { sanitizeCmsValue } from "@/lib/security";
import {
  assertTrustedMutation,
  errorResponse,
  JSON_LIMITS,
  readLimitedJson,
  RequestError,
} from "@/lib/request-security";
import { invalidateGlobals } from "@/lib/invalidate-site-cache";
import { logServerError, requestId } from "@/lib/logger";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value) {
  return typeof value === "string" ? value : "";
}

function normaliseGlobals(input) {
  const contactEmail = text(input.contact?.email).trim().toLowerCase();
  if (contactEmail && !emailPattern.test(contactEmail)) {
    throw new RequestError("Enter a valid contact email address");
  }
  return sanitizeCmsValue({
    key: "site",
    footer: {
      boldText: text(input.footer?.boldText),
      text: text(input.footer?.text),
      link: {
        label: text(input.footer?.link?.label),
        url: text(input.footer?.link?.url),
        newTab: Boolean(input.footer?.link?.newTab),
      },
      bottomText: text(input.footer?.bottomText),
    },
    contact: {
      number: text(input.contact?.number),
      email: contactEmail,
      address: text(input.contact?.address),
    },
    socials: {
      facebook: text(input.socials?.facebook),
      instagram: text(input.socials?.instagram),
      linkedin: text(input.socials?.linkedin),
      youtube: text(input.socials?.youtube),
    },
    siteCopy: input.siteCopy && typeof input.siteCopy === "object" ? input.siteCopy : {},
    testimonials: (Array.isArray(input.testimonials) ? input.testimonials : [])
      .slice(0, 100)
      .map((testimonial) => ({
        name: text(testimonial.name),
        text: text(testimonial.text),
      })),
  });
}

export async function GET() {
  await dbConnect();
  return NextResponse.json(sanitizeCmsValue((await Globals.findOne({ key: "site" }).lean()) || {}));
}
export async function PUT(req) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    assertTrustedMutation(req);
  } catch (error) {
    return errorResponse(error);
  }
  try {
    const input = normaliseGlobals(await readLimitedJson(req, JSON_LIMITS.admin));
    await dbConnect();
    const globals = await Globals.findOneAndUpdate(
      { key: "site" },
      { $set: input },
      { new: true, runValidators: true, upsert: true },
    );
    await invalidateGlobals();
    return NextResponse.json(globals);
  } catch (error) {
    if (!error.status)
      logServerError("globals_update_failed", error, {
        requestId: requestId(req),
      });
    return errorResponse(error, "Globals could not be saved");
  }
}

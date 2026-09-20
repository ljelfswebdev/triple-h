import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { dbConnect } from "@/lib/db";
import FormSubmission from "@/models/FormSubmission";
import { transporter } from "@/lib/email";
import { assertTrustedMutation, clientAddress, opaqueKey } from "@/lib/request-security";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { botProtectionResponse } from "@/lib/bot-protection";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  try {
    assertTrustedMutation(req);
    const blocked = await botProtectionResponse();
    if (blocked) return blocked;
    const rate = await rateLimit({
      key: `application:${opaqueKey(clientAddress(req))}`,
      limit: 5,
      windowMs: 30 * 60_000,
    });
    if (!rate.allowed) return rateLimitResponse(rate);
    const form = await req.formData();
    if (form.get("website")) return NextResponse.json({ ok: true }, { status: 201 });
    const name = String(form.get("name") || "").trim().slice(0, 120);
    const email = String(form.get("email") || "").trim().toLowerCase().slice(0, 254);
    const phone = String(form.get("phone") || "").trim().slice(0, 50);
    const vacancy = String(form.get("vacancy") || "").trim().slice(0, 200);
    const message = String(form.get("message") || "").trim().slice(0, 5000);
    const consent = form.get("consent") === "true";
    const cv = form.get("cv");
    if (!name || !emailPattern.test(email) || !vacancy || !consent) {
      return NextResponse.json({ error: "Complete all required fields" }, { status: 422 });
    }
    if (!(cv instanceof File) || cv.size === 0 || cv.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Attach a PDF or Word CV up to 5 MB" }, { status: 422 });
    }
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(cv.type)) {
      return NextResponse.json({ error: "CV must be a PDF or Word document" }, { status: 422 });
    }
    const bytes = Buffer.from(await cv.arrayBuffer());
    const cvUpload = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "raw", folder: "triple-h/careers", use_filename: true, unique_filename: true },
        (error, result) => (error ? reject(error) : resolve(result)),
      );
      stream.end(bytes);
    });
    const values = { name, email, phone, vacancy, message, cv: cvUpload.secure_url, consent: true };
    await dbConnect();
    const submission = await FormSubmission.create({
      formKey: "career-application",
      formName: "Career application",
      values,
      fields: Object.entries(values).map(([fieldName, value]) => ({
        name: fieldName,
        label: fieldName === "cv" ? "CV" : fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
        value,
      })),
    });
    try {
      await transporter().sendMail({
        from: `${process.env.SMTP_FROM_NAME || "Triple H"} <${process.env.SMTP_FROM_EMAIL}>`,
        to: process.env.CONTACT_RECIPIENT_EMAIL,
        subject: `New application: ${vacancy}`,
        text: `${name}\n${email}\n${phone}\n${message}\nCV: ${cvUpload.secure_url}`,
      });
      submission.status = "emailed";
      await submission.save();
    } catch {
      submission.status = "email_failed";
      await submission.save();
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Application could not be submitted" }, { status: 500 });
  }
}

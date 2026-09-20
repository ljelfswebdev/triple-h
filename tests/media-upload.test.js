import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { cloudinaryFolder } from "../src/lib/cloudinary.js";
import {
  MAX_MEDIA_BYTES,
  detectedMediaKind,
  mediaUploadError,
  readMediaUploadResponse,
} from "../src/lib/media-upload.js";

test("media validation accepts images above 10MB up to 25MB and rejects larger files", () => {
  const file = { type: "image/png", arrayBuffer() {} };
  assert.equal(mediaUploadError({ ...file, size: 12 * 1024 * 1024 }), "");
  assert.equal(mediaUploadError({ ...file, size: MAX_MEDIA_BYTES }), "");
  assert.match(mediaUploadError({ ...file, size: MAX_MEDIA_BYTES + 1 }), /25MB/);
  assert.match(mediaUploadError({ ...file, type: "text/plain", size: 1 }), /Only JPEG/);
  assert.match(mediaUploadError({ ...file, size: 0 }), /empty/);
  assert.equal(mediaUploadError(null), "File required");
});

test("media type detection uses file signatures rather than browser-supplied MIME alone", () => {
  assert.equal(detectedMediaKind(Buffer.from("89504e470d0a1a0a00000000", "hex")), "image/png");
  assert.equal(detectedMediaKind(Buffer.from("ffd8ffe00000000000000000", "hex")), "image/jpeg");
  assert.equal(detectedMediaKind(Buffer.from("474946383961000000000000", "hex")), "image/gif");
  assert.equal(detectedMediaKind(Buffer.from("524946460000000057454250", "hex")), "image/webp");
  assert.equal(detectedMediaKind(Buffer.from("000000186674797061766966", "hex")), "image/avif");
  assert.equal(detectedMediaKind(Buffer.from("000000186674797069736f6d", "hex")), "video/mp4");
  assert.equal(detectedMediaKind(Buffer.from("not media data")), "");
});

test("empty and non-JSON upload failures display useful errors", async () => {
  await assert.rejects(readMediaUploadResponse(new Response("", { status: 500 })), /Upload failed/);
  await assert.rejects(readMediaUploadResponse(new Response("too large", { status: 413 })), /25MB/);
  await assert.rejects(readMediaUploadResponse(new Response("", { status: 401 })), /sign in/);
  await assert.rejects(
    readMediaUploadResponse(new Response("", { status: 201 })),
    /incomplete upload response/,
  );
  await assert.rejects(
    readMediaUploadResponse(Response.json({ error: "Media upload failed" }, { status: 502 })),
    /Media upload failed/,
  );
});

test("successful uploads return the selected media object", async () => {
  const media = { _id: "test", secureUrl: "https://example.com/background.png" };
  assert.deepEqual(await readMediaUploadResponse(Response.json(media, { status: 201 })), media);
});

test("the media library uses a site-specific Cloudinary folder", () => {
  const original = process.env.CLOUDINARY_FOLDER;
  try {
    delete process.env.CLOUDINARY_FOLDER;
    assert.equal(cloudinaryFolder(), "triple-h/website");
    process.env.CLOUDINARY_FOLDER = "/client/site/";
    assert.equal(cloudinaryFolder(), "client/site");
  } finally {
    if (original === undefined) delete process.env.CLOUDINARY_FOLDER;
    else process.env.CLOUDINARY_FOLDER = original;
  }
});

test("the media listing reads scoped database records without importing the Cloudinary account", () => {
  const route = readFileSync(new URL("../src/app/api/media/route.js", import.meta.url), "utf8");
  assert.match(route, /Media\.find\(query\)/);
  assert.match(route, /cloudinaryFolder\(\)/);
  assert.doesNotMatch(route, /cloudinary\.api\.resources/);
  assert.doesNotMatch(route, /bulkWrite/);
});

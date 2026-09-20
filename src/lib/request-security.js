import crypto from "node:crypto";

export const JSON_LIMITS = Object.freeze({
  login: 4 * 1024,
  submission: 128 * 1024,
  admin: 1024 * 1024,
});

export class RequestError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "RequestError";
    this.status = status;
  }
}

export async function readLimitedJson(request, maxBytes = JSON_LIMITS.admin) {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) {
    throw new RequestError("Request body is too large", 413);
  }
  const contentType = request.headers.get("content-type") || "";
  if (contentType && !/^application\/(?:[\w.+-]*\+)?json\b/i.test(contentType)) {
    throw new RequestError("Content-Type must be application/json", 415);
  }
  let raw = "";
  try {
    if (!request.body) throw new Error("Missing body");
    const reader = request.body.getReader();
    const decoder = new TextDecoder();
    let received = 0;
    while (true) {
      const { done, value: chunk } = await reader.read();
      if (done) break;
      received += chunk.byteLength;
      if (received > maxBytes) {
        await reader.cancel();
        throw new RequestError("Request body is too large", 413);
      }
      raw += decoder.decode(chunk, { stream: true });
    }
    raw += decoder.decode();
  } catch (error) {
    if (error instanceof RequestError) throw error;
    throw new RequestError("Invalid JSON body", 400);
  }
  let value;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new RequestError("Invalid JSON body", 400);
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new RequestError("A JSON object is required", 400);
  }
  return value;
}

export function assertTrustedMutation(request) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") throw new RequestError("Cross-site request blocked", 403);

  const origin = request.headers.get("origin");
  if (!origin) return;
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host");
  if (!host) throw new RequestError("Request origin could not be verified", 403);
  const forwardedProtocol = request.headers.get("x-forwarded-proto");
  const expectedProtocol = forwardedProtocol || new URL(request.url).protocol.replace(":", "");
  let originUrl;
  try {
    originUrl = new URL(origin);
  } catch {
    throw new RequestError("Invalid request origin", 403);
  }
  if (originUrl.host !== host || originUrl.protocol !== `${expectedProtocol}:`) {
    throw new RequestError("Cross-origin request blocked", 403);
  }
}

export function clientAddress(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown"
  )
    .trim()
    .slice(0, 128);
}

export function opaqueKey(...parts) {
  return crypto.createHash("sha256").update(parts.join("\u0000")).digest("hex");
}

export function errorResponse(error, fallback = "Request failed") {
  const status = error instanceof RequestError ? error.status : 500;
  return Response.json({ error: status < 500 ? error.message : fallback }, { status });
}

const store = globalThis.__cmsRateLimitStore || (globalThis.__cmsRateLimitStore = new Map());
let warned = false;
let sharedFailureWarned = false;

function prune(now) {
  if (store.size < 5_000) return;
  for (const [key, entry] of store) if (entry.resetAt <= now) store.delete(key);
  while (store.size >= 10_000) store.delete(store.keys().next().value);
}

/**
 * Fixed-window limiter backed by MongoDB in production. A custom Redis/KV
 * adapter may be supplied via globalThis.__cmsRateLimitAdapter; bounded process
 * memory is the safe availability fallback when the shared store is unavailable.
 */
export async function rateLimit({ key, limit, windowMs }) {
  const adapter = globalThis.__cmsRateLimitAdapter;
  if (adapter?.consume) return adapter.consume({ key, limit, windowMs });
  if (process.env.NODE_ENV === "production" && process.env.RATE_LIMIT_STORE !== "memory") {
    try {
      const [{ dbConnect }, { default: RateLimit }] = await Promise.all([
        import("./db.js"),
        import("../models/RateLimit.js"),
      ]);
      await dbConnect();
      const now = Date.now();
      const bucket = Math.floor(now / windowMs);
      const document = await RateLimit.findByIdAndUpdate(
        `${key}:${windowMs}:${bucket}`,
        {
          $inc: { count: 1 },
          $setOnInsert: { expiresAt: new Date((bucket + 2) * windowMs) },
        },
        { new: true, upsert: true, lean: true },
      );
      return {
        allowed: document.count <= limit,
        remaining: Math.max(0, limit - document.count),
        retryAfter: Math.max(1, Math.ceil(((bucket + 1) * windowMs - now) / 1000)),
      };
    } catch (error) {
      if (!sharedFailureWarned) {
        sharedFailureWarned = true;
        console.warn(
          JSON.stringify({
            level: "warn",
            event: "rate_limit_shared_store_failed",
            error: { name: error?.name || "Error", code: error?.code },
          }),
        );
      }
    }
  }
  if (process.env.NODE_ENV === "production" && !warned) {
    warned = true;
    console.warn(
      JSON.stringify({
        level: "warn",
        event: "rate_limit_memory_fallback",
        message: "The shared rate-limit store is unavailable; using bounded process memory.",
      }),
    );
  }
  const now = Date.now();
  prune(now);
  let entry = store.get(key);
  if (!entry || entry.resetAt <= now) entry = { count: 0, resetAt: now + windowMs };
  entry.count += 1;
  store.set(key, entry);
  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
  };
}

export function rateLimitResponse(result) {
  return Response.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: { "Retry-After": String(result.retryAfter), "Cache-Control": "no-store" },
    },
  );
}

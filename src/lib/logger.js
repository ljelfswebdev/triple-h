import crypto from "node:crypto";

export function requestId(request) {
  return request?.headers?.get("x-request-id")?.slice(0, 128) || crypto.randomUUID();
}

/** Structured server logging without request bodies, credentials or raw user data. */
export function logServerError(event, error, context = {}) {
  console.error(
    JSON.stringify({
      level: "error",
      event,
      ...context,
      error: {
        name: error?.name || "Error",
        code:
          typeof error?.code === "string" || typeof error?.code === "number"
            ? error.code
            : undefined,
        message: String(error?.message || "Unknown error").slice(0, 500),
      },
    }),
  );
}

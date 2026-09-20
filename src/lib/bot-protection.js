import { checkBotId } from "botid/server";

export async function botProtectionResponse() {
  try {
    const verification = await checkBotId();
    if (!verification.isBot) return null;
    return Response.json(
      { error: "Automated submission blocked." },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        event: "bot_protection_failed",
        error: { name: error?.name || "Error", code: error?.code },
      }),
    );
    if (process.env.NODE_ENV !== "production") return null;
    return Response.json(
      { error: "Submission protection is temporarily unavailable. Please try again." },
      { status: 503, headers: { "Cache-Control": "no-store", "Retry-After": "60" } },
    );
  }
}

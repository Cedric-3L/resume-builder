import { NextRequest, NextResponse } from "next/server";
import { removeFavoriteTemplate } from "@/lib/server/favorite-storage";
import { validateCsrf } from "@/lib/server/csrf";
import { checkRateLimit, getClientIp } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ templateKey: string }> }
) {
  const csrf = validateCsrf(request);
  if (!csrf.ok) {
    return NextResponse.json({ message: csrf.error }, { status: csrf.status });
  }

  const rl = checkRateLimit(`fav:del:${getClientIp(request)}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ message: "请求过于频繁" }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });
  }

  try {
    const { templateKey } = await context.params;
    const key = await removeFavoriteTemplate(templateKey);
    return NextResponse.json({ templateKey: key });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to remove favorite";
    const status =
      message === "Authentication required" ? 401 : message === "Invalid template key" ? 400 : 500;
    return NextResponse.json({ message }, { status });
  }
}

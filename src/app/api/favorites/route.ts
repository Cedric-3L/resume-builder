import { NextRequest, NextResponse } from "next/server";
import {
  addFavoriteTemplate,
  listFavoriteTemplates,
} from "@/lib/server/favorite-storage";
import { validateCsrf } from "@/lib/server/csrf";
import { checkRateLimit, getClientIp } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const rl = checkRateLimit(`fav:get:${getClientIp(request)}`, 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ message: "请求过于频繁" }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });
  }

  try {
    const favorites = await listFavoriteTemplates();
    return NextResponse.json({ favorites });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load favorites";
    return NextResponse.json(
      { message },
      { status: message === "Authentication required" ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const csrf = validateCsrf(request);
  if (!csrf.ok) {
    return NextResponse.json({ message: csrf.error }, { status: csrf.status });
  }

  const rl = checkRateLimit(`fav:post:${getClientIp(request)}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ message: "请求过于频繁" }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });
  }

  try {
    const body: unknown = await request.json();
    const templateKey =
      body &&
      typeof body === "object" &&
      typeof (body as { templateKey?: unknown }).templateKey === "string"
        ? (body as { templateKey: string }).templateKey
        : "";

    if (!templateKey) {
      return NextResponse.json({ message: "templateKey is required" }, { status: 400 });
    }

    const key = await addFavoriteTemplate(templateKey);
    return NextResponse.json({ templateKey: key });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add favorite";
    const status =
      message === "Authentication required" ? 401 : message === "Invalid template key" ? 400 : 500;
    return NextResponse.json({ message }, { status });
  }
}

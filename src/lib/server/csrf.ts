import { NextRequest } from "next/server";

export function validateSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin) {
    return true;
  }

  try {
    const originUrl = new URL(origin);
    return originUrl.host === host;
  } catch {
    return false;
  }
}

export function validateCsrf(
  request: NextRequest
): { ok: true } | { ok: false; error: string; status: number } {
  if (validateSameOrigin(request)) {
    return { ok: true };
  }
  return { ok: false, error: "请求来源不受信任", status: 403 };
}

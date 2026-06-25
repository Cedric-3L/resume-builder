import { NextRequest, NextResponse } from "next/server";
import { getAccountOverview } from "@/lib/server/account-storage";
import { checkRateLimit, getClientIp } from "@/lib/server/rate-limit";

export async function GET(request: NextRequest) {
  const rl = checkRateLimit(`account:${getClientIp(request)}`, 30, 60_000);
  if (!rl.ok) return NextResponse.json({ message: "请求过于频繁" }, { status: 429 });
  try {
    return NextResponse.json(await getAccountOverview());
  } catch (error) {
    const message = error instanceof Error ? error.message : "加载账户信息失败";
    return NextResponse.json({ message }, { status: message === "Authentication required" ? 401 : 500 });
  }
}

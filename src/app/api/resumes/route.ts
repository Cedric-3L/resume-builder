import { NextRequest, NextResponse } from "next/server";
import { listPersistedResumes } from "@/lib/server/resume-storage";
import { createServerSupabase } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const rl = checkRateLimit(`resumes:list:${getClientIp(request)}`, 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ message: "请求过于频繁" }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });
  }

  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return NextResponse.json({ message: "请先登录后再查看简历列表" }, { status: 401 });
  }

  const resumes = await listPersistedResumes();
  return NextResponse.json(resumes);
}

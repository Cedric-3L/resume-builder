import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { takePrintResumePayload } from "@/lib/server/resume-print-store";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await context.params;

  if (!/^[\w-]{1,128}$/.test(jobId)) {
    return NextResponse.json({ message: "Invalid print job ID" }, { status: 400 });
  }

  const token = request.nextUrl.searchParams.get("token")?.trim();

  if (token) {
    const payload = await takePrintResumePayload(jobId, { token });
    if (!payload) {
      return NextResponse.json({ message: "Print job not found" }, { status: 404 });
    }

    return NextResponse.json(payload);
  }

  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return NextResponse.json({ message: "请先登录后再打印简历" }, { status: 401 });
  }

  const payload = await takePrintResumePayload(jobId, { userId: data.user.id });
  if (!payload) {
    return NextResponse.json({ message: "Print job not found" }, { status: 404 });
  }

  return NextResponse.json(payload);
}

import { NextRequest, NextResponse } from "next/server";
import { activateProMembership } from "@/lib/server/account-storage";
import { validateCsrf } from "@/lib/server/csrf";

export async function POST(request: NextRequest) {
  const csrf = validateCsrf(request);
  if (!csrf.ok) return NextResponse.json({ message: csrf.error }, { status: csrf.status });
  try {
    return NextResponse.json(await activateProMembership());
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "升级失败" },
      { status: 500 }
    );
  }
}

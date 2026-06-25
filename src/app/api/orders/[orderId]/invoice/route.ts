import { NextRequest, NextResponse } from "next/server";
import { requestInvoice } from "@/lib/server/account-storage";
import { validateCsrf } from "@/lib/server/csrf";

export async function POST(request: NextRequest, context: { params: Promise<{ orderId: string }> }) {
  const csrf = validateCsrf(request);
  if (!csrf.ok) return NextResponse.json({ message: csrf.error }, { status: csrf.status });
  try {
    const { orderId } = await context.params;
    return NextResponse.json(await requestInvoice(orderId));
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "申请发票失败" },
      { status: 500 }
    );
  }
}

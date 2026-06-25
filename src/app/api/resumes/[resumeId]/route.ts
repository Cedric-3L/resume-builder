import { NextRequest, NextResponse } from "next/server";
import {
  deletePersistedResume,
  readPersistedResume,
  renamePersistedResume,
  writePersistedResume,
} from "@/lib/server/resume-storage";
import { createServerSupabase } from "@/lib/supabase/server";
import { validateCsrf } from "@/lib/server/csrf";
import { checkRateLimit, getClientIp } from "@/lib/server/rate-limit";
import type { ResumePersistedDocument } from "@/store/useResumeStore";

export const runtime = "nodejs";

const MAX_BODY_SIZE = 2 * 1024 * 1024; // 2MB

function isValidResumePayload(body: unknown): body is ResumePersistedDocument {
  if (!body || typeof body !== "object") return false;
  const doc = body as Record<string, unknown>;
  if (typeof doc.name !== "string" || typeof doc.updatedAt !== "string") return false;
  if (!doc.snapshot || typeof doc.snapshot !== "object") return false;
  return true;
}

async function hasAuthenticatedUser() {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  return Boolean(data.user);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ resumeId: string }> }
) {
  const rl = checkRateLimit(`resume:get:${getClientIp(request)}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ message: "请求过于频繁，请稍后再试" }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });
  }

  if (!(await hasAuthenticatedUser())) {
    return NextResponse.json({ message: "请先登录后再访问简历" }, { status: 401 });
  }

  const { resumeId } = await context.params;

  if (!/^[\w-]{1,128}$/.test(resumeId)) {
    return NextResponse.json({ message: "Invalid resume ID" }, { status: 400 });
  }

  const document = await readPersistedResume(resumeId);

  if (!document) {
    return NextResponse.json({ message: "Resume not found" }, { status: 404 });
  }

  return NextResponse.json(document);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ resumeId: string }> }
) {
  const csrf = validateCsrf(request);
  if (!csrf.ok) {
    return NextResponse.json({ message: csrf.error }, { status: csrf.status });
  }

  const rl = checkRateLimit(`resume:put:${getClientIp(request)}`, 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ message: "请求过于频繁，请稍后再试" }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });
  }

  if (!(await hasAuthenticatedUser())) {
    return NextResponse.json({ message: "请先登录后再保存简历" }, { status: 401 });
  }

  const { resumeId } = await context.params;

  if (!/^[\w-]{1,128}$/.test(resumeId)) {
    return NextResponse.json({ message: "Invalid resume ID" }, { status: 400 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_SIZE) {
    return NextResponse.json({ message: "Payload too large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  if (!isValidResumePayload(body)) {
    return NextResponse.json(
      { message: "Invalid resume payload - name, updatedAt, and snapshot are required" },
      { status: 400 }
    );
  }

  if (body.name.length > 200) {
    return NextResponse.json({ message: "Resume name too long" }, { status: 400 });
  }

  const saved = await writePersistedResume(resumeId, body);
  return NextResponse.json(saved);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ resumeId: string }> }
) {
  const csrf = validateCsrf(request);
  if (!csrf.ok) {
    return NextResponse.json({ message: csrf.error }, { status: csrf.status });
  }

  const rl = checkRateLimit(`resume:patch:${getClientIp(request)}`, 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ message: "请求过于频繁，请稍后再试" }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });
  }

  if (!(await hasAuthenticatedUser())) {
    return NextResponse.json({ message: "请先登录后再修改简历" }, { status: 401 });
  }

  const { resumeId } = await context.params;

  if (!/^[\w-]{1,128}$/.test(resumeId)) {
    return NextResponse.json({ message: "Invalid resume ID" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const name =
    body && typeof body === "object" && typeof (body as { name?: unknown }).name === "string"
      ? (body as { name: string }).name.trim()
      : "";

  if (!name) {
    return NextResponse.json({ message: "Resume name is required" }, { status: 400 });
  }

  if (name.length > 200) {
    return NextResponse.json({ message: "Resume name too long" }, { status: 400 });
  }

  const saved = await renamePersistedResume(resumeId, name);
  return NextResponse.json(saved);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ resumeId: string }> }
) {
  const csrf = validateCsrf(request);
  if (!csrf.ok) {
    return NextResponse.json({ message: csrf.error }, { status: csrf.status });
  }

  const rl = checkRateLimit(`resume:delete:${getClientIp(request)}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ message: "请求过于频繁，请稍后再试" }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });
  }

  if (!(await hasAuthenticatedUser())) {
    return NextResponse.json({ message: "请先登录后再删除简历" }, { status: 401 });
  }

  const { resumeId } = await context.params;

  if (!/^[\w-]{1,128}$/.test(resumeId)) {
    return NextResponse.json({ message: "Invalid resume ID" }, { status: 400 });
  }

  await deletePersistedResume(resumeId);
  return NextResponse.json({ ok: true });
}

import { createHash, randomBytes, randomUUID, timingSafeEqual } from "crypto";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { ResumeSettings } from "@/store/useResumeStore";
import type { ThemeKey } from "@/styles/themes";

export interface PrintResumePayload {
  markdown: string;
  theme: ThemeKey;
  settings: ResumeSettings;
  title?: string;
}

export interface SavedPrintResumeJob {
  id: string;
  token: string;
}

const PRINT_JOB_TTL_MS = 10 * 60_000;
const PRINT_JOBS_TABLE = "print_resume_jobs";

type PrintJobRow = {
  user_id: string;
  token_hash: string;
  payload: unknown;
  expires_at: string;
};

function getErrorField(error: unknown, field: "code" | "message") {
  if (!error || typeof error !== "object" || !(field in error)) {
    return "";
  }

  const value = (error as Record<string, unknown>)[field];
  return typeof value === "string" ? value : "";
}

function createPrintJobError(error: unknown) {
  const code = getErrorField(error, "code");
  const message = getErrorField(error, "message");

  if (code === "42P01" || message.includes(PRINT_JOBS_TABLE)) {
    return new Error(
      "PDF 导出任务表 print_resume_jobs 不存在，请先在 Supabase 执行 supabase-rls-migration.sql"
    );
  }

  return new Error(message || "保存 PDF 导出任务失败");
}

function createPrintToken() {
  return randomBytes(32).toString("base64url");
}

function hashPrintToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function isSameHash(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function isPrintResumePayload(value: unknown): value is PrintResumePayload {
  if (!value || typeof value !== "object") return false;

  const payload = value as Partial<PrintResumePayload>;
  return (
    typeof payload.markdown === "string" &&
    typeof payload.theme === "string" &&
    Boolean(payload.settings && typeof payload.settings === "object")
  );
}

async function cleanupExpiredPrintJobs() {
  const supabase = createServiceRoleClient();
  await supabase
    .from(PRINT_JOBS_TABLE)
    .delete()
    .lt("expires_at", new Date().toISOString());
}

export async function savePrintResumePayload(
  userId: string,
  payload: PrintResumePayload
): Promise<SavedPrintResumeJob> {
  await cleanupExpiredPrintJobs().catch(() => undefined);

  const id = randomUUID();
  const token = createPrintToken();
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from(PRINT_JOBS_TABLE).insert({
    id,
    user_id: userId,
    token_hash: hashPrintToken(token),
    payload,
    expires_at: new Date(Date.now() + PRINT_JOB_TTL_MS).toISOString(),
  });

  if (error) throw createPrintJobError(error);

  return { id, token };
}

export async function takePrintResumePayload(
  id: string,
  auth: { token?: string; userId?: string }
) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from(PRINT_JOBS_TABLE)
    .select("user_id, token_hash, payload, expires_at")
    .eq("id", id)
    .maybeSingle<PrintJobRow>();

  if (error) throw createPrintJobError(error);
  if (!data) return null;

  const isExpired = new Date(data.expires_at).getTime() < Date.now();
  const tokenHash = auth.token ? hashPrintToken(auth.token) : "";
  const hasValidToken = auth.token ? isSameHash(tokenHash, data.token_hash) : false;
  const hasValidUser = auth.userId ? auth.userId === data.user_id : false;

  if (isExpired || (!hasValidToken && !hasValidUser)) {
    if (isExpired) {
      await supabase.from(PRINT_JOBS_TABLE).delete().eq("id", id);
    }
    return null;
  }

  await supabase.from(PRINT_JOBS_TABLE).delete().eq("id", id);

  if (!isPrintResumePayload(data.payload)) {
    return null;
  }

  return data.payload;
}

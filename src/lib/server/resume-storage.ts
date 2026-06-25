import { createServerSupabase } from "@/lib/supabase/server";
import type { ResumePersistedDocument } from "@/store/useResumeStore";

function sanitizeResumeId(resumeId: string) {
  return resumeId.replace(/[^a-zA-Z0-9-_]/g, "");
}

export async function readPersistedResume(resumeId: string) {
  const supabase = await createServerSupabase();
  const safeId = sanitizeResumeId(resumeId);

  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error("Authentication required");
  }

  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", safeId)
    .eq("user_id", user.user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return {
    name: data.name,
    updatedAt: data.updated_at,
    snapshot: data.snapshot,
  } as ResumePersistedDocument;
}

export async function writePersistedResume(
  resumeId: string,
  document: ResumePersistedDocument
) {
  const supabase = await createServerSupabase();
  const safeId = sanitizeResumeId(resumeId);

  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error("Authentication required");
  }

  const { data, error } = await supabase
    .from("resumes")
    .upsert(
      {
        id: safeId,
        user_id: user.user.id,
        name: document.name,
        snapshot: document.snapshot,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )
    .select()
    .single();

  if (error) throw error;

  return {
    name: data.name,
    updatedAt: data.updated_at,
    snapshot: data.snapshot,
  } as ResumePersistedDocument;
}

export async function renamePersistedResume(resumeId: string, name: string) {
  const supabase = await createServerSupabase();
  const safeId = sanitizeResumeId(resumeId);

  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error("Authentication required");
  }

  const { data, error } = await supabase
    .from("resumes")
    .update({
      name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", safeId)
    .eq("user_id", user.user.id)
    .select()
    .single();

  if (error) throw error;

  return {
    name: data.name,
    updatedAt: data.updated_at,
    snapshot: data.snapshot,
  } as ResumePersistedDocument;
}

export async function listPersistedResumes() {
  const supabase = await createServerSupabase();

  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error("Authentication required");
  }

  const { data, error } = await supabase
    .from("resumes")
    .select("id, name, snapshot, updated_at")
    .eq("user_id", user.user.id)
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    template: (row.snapshot as Record<string, unknown>)?.template as string ?? "bilingualResearchBlue",
    theme: (row.snapshot as Record<string, unknown>)?.theme as string ?? "blueMinimal",
    updatedAt: row.updated_at,
    snapshot: row.snapshot,
  }));
}

export async function deletePersistedResume(resumeId: string) {
  const supabase = await createServerSupabase();
  const safeId = sanitizeResumeId(resumeId);

  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error("Authentication required");
  }

  const { error } = await supabase
    .from("resumes")
    .delete()
    .eq("id", safeId)
    .eq("user_id", user.user.id);

  if (error) throw error;
}

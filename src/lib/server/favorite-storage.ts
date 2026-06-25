import { createServerSupabase } from "@/lib/supabase/server";
import { sanitizeTemplateKey, templateKeys, type TemplateKey } from "@/store/demoData";

const TEMPLATE_KEY_SET = new Set<string>(templateKeys);

export function validateFavoriteTemplateKey(templateKey: string): TemplateKey {
  if (!TEMPLATE_KEY_SET.has(templateKey)) {
    throw new Error("Invalid template key");
  }

  return sanitizeTemplateKey(templateKey);
}

async function getAuthenticatedSupabase() {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    throw new Error("Authentication required");
  }

  return { supabase, userId: data.user.id };
}

export async function listFavoriteTemplates() {
  const { supabase, userId } = await getAuthenticatedSupabase();

  const { data, error } = await supabase
    .from("favorite_templates")
    .select("template_key")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? [])
    .map((item) => item.template_key)
    .filter((key): key is TemplateKey => TEMPLATE_KEY_SET.has(key));
}

export async function addFavoriteTemplate(templateKey: string) {
  const key = validateFavoriteTemplateKey(templateKey);
  const { supabase, userId } = await getAuthenticatedSupabase();

  const { error } = await supabase.from("favorite_templates").upsert(
    {
      user_id: userId,
      template_key: key,
    },
    { onConflict: "user_id,template_key" }
  );

  if (error) throw error;

  return key;
}

export async function removeFavoriteTemplate(templateKey: string) {
  const key = validateFavoriteTemplateKey(templateKey);
  const { supabase, userId } = await getAuthenticatedSupabase();

  const { error } = await supabase
    .from("favorite_templates")
    .delete()
    .eq("user_id", userId)
    .eq("template_key", key);

  if (error) throw error;

  return key;
}

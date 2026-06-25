import { createServerSupabase, createServiceRoleClient } from "@/lib/supabase/server";
import { resumeTemplates, type TemplateKey } from "@/store/demoData";

export interface AdminStats {
  totalUsers: number;
  totalResumes: number;
  monthlyExports: number;
  paidMembers: number;
  templateUsage: { key: string; name: string; count: number }[];
  recentUsers: { id: string; name: string; email: string; createdAt: string; resumeCount: number }[];
  trend: { date: string; resumes: number; exports: number }[];
}

export async function checkIsAdmin(): Promise<boolean> {
  const supabase = await createServerSupabase();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.user.id)
    .single();

  return profile?.role === "admin";
}

export async function getAdminStats(): Promise<AdminStats> {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) throw new Error("Forbidden");

  const supabase = createServiceRoleClient();

  const since = new Date();
  since.setDate(since.getDate() - 29);
  since.setHours(0, 0, 0, 0);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [usersResult, resumesResult, exportsResult, membersResult, profilesResult] = await Promise.all([
    supabase.rpc("get_auth_user_count"),
    supabase.from("resumes").select("user_id, snapshot, created_at"),
    supabase.from("export_events").select("created_at").gte("created_at", monthStart.toISOString()),
    supabase.from("memberships").select("user_id", { count: "exact", head: true }).eq("plan", "pro").eq("status", "active"),
    supabase.from("profiles").select("id, name, email, created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  const totalUsers = (usersResult.data as number) ?? 0;
  const allResumes = resumesResult.data ?? [];
  const totalResumes = allResumes.length;
  let monthlyExports = exportsResult.error ? 0 : exportsResult.data?.length ?? 0;
  let paidMembers = membersResult.error ? 0 : membersResult.count ?? 0;
  let fallbackAuthUsers: Awaited<ReturnType<typeof supabase.auth.admin.listUsers>>["data"]["users"] = [];
  if (exportsResult.error || membersResult.error || paidMembers === 0) {
    const { data: authUsers } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    fallbackAuthUsers = authUsers.users;
    const monthStartMs = monthStart.getTime();
    if (membersResult.error || paidMembers === 0) {
      paidMembers = authUsers.users.filter((item) => item.user_metadata?.geekcv_membership?.plan === "pro").length;
    }
    if (exportsResult.error) {
      monthlyExports = authUsers.users.reduce((sum, item) => {
        const events = Array.isArray(item.user_metadata?.geekcv_export_events)
          ? item.user_metadata.geekcv_export_events as string[]
          : [];
        return sum + events.filter((value) => new Date(value).getTime() >= monthStartMs).length;
      }, 0);
    }
  }

  const templateCounts = new Map<string, number>();
  for (const row of allResumes) {
    const template = (row.snapshot as Record<string, unknown>)?.template as string | undefined;
    if (template) {
      templateCounts.set(template, (templateCounts.get(template) ?? 0) + 1);
    }
  }

  const templateUsage = Array.from(templateCounts.entries())
    .map(([key, count]) => ({
      key,
      name: resumeTemplates[key as TemplateKey]?.name ?? key,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const resumeCountByUser = new Map<string, number>();
  for (const row of allResumes) {
    resumeCountByUser.set(row.user_id, (resumeCountByUser.get(row.user_id) ?? 0) + 1);
  }

  const recentUsers = (profilesResult.data ?? []).map((profile) => ({
    id: profile.id,
    name: profile.name || "未命名用户",
    email: profile.email || "",
    createdAt: profile.created_at,
    resumeCount: resumeCountByUser.get(profile.id) ?? 0,
  }));

  const trendMap = new Map<string, { resumes: number; exports: number }>();
  for (let index = 0; index < 30; index += 1) {
    const date = new Date(since);
    date.setDate(since.getDate() + index);
    trendMap.set(date.toISOString().slice(0, 10), { resumes: 0, exports: 0 });
  }
  for (const row of allResumes) {
    const key = String(row.created_at ?? "").slice(0, 10);
    const point = trendMap.get(key);
    if (point) point.resumes += 1;
  }
  for (const row of exportsResult.data ?? []) {
    const key = String(row.created_at ?? "").slice(0, 10);
    const point = trendMap.get(key);
    if (point) point.exports += 1;
  }
  if (exportsResult.error) {
    for (const user of fallbackAuthUsers) {
      const events = Array.isArray(user.user_metadata?.geekcv_export_events)
        ? user.user_metadata.geekcv_export_events as string[]
        : [];
      for (const value of events) {
        const point = trendMap.get(value.slice(0, 10));
        if (point) point.exports += 1;
      }
    }
  }
  const trend = Array.from(trendMap.entries()).map(([date, value]) => ({ date, ...value }));

  return { totalUsers, totalResumes, monthlyExports, paidMembers, templateUsage, recentUsers, trend };
}

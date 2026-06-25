"use client";

import React, { ChangeEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight, BarChart3, BookOpen, Check, ChevronLeft, ChevronRight,
  CircleHelp, Crown, Download, FileText, Gem, Heart, Loader2, LogOut,
  PackageOpen, PencilLine, ReceiptText, Search,
  UserRound,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { ScaledResumePreview } from "@/components/ui/ScaledResumePreview";
import { cn } from "@/lib/utils";
import { sanitizeFileName } from "@/lib/resume-transfer";
import { getTemplateSections, resumeTemplates, type TemplateKey } from "@/store/demoData";
import { useAuthStore } from "@/store/useAuthStore";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { useResumeStore, type ResumePersistedDocument } from "@/store/useResumeStore";
import { toast } from "@/store/useToastStore";
import type { ResumeMeta } from "@/types/resume";
import type { ThemeKey } from "@/styles/themes";

type DashboardSection = "basic" | "membership" | "resumes" | "favorites" | "orders" | "tutorial" | "admin";

interface AccountOverview {
  databaseReady: boolean;
  registeredAt: string;
  membership: {
    plan: "free" | "pro";
    status: string;
    maxResumes: number | null;
    monthlyExportLimit: number | null;
    exportsUsed: number;
    resumeCount: number;
    expiresAt: string | null;
  };
  orders: {
    id: string;
    orderNo: string;
    productName: string;
    amount: number;
    status: "pending" | "paid" | "refunded" | "cancelled";
    invoiceStatus: "none" | "requested" | "issued";
    createdAt: string;
  }[];
}

interface AdminStats {
  totalUsers: number;
  totalResumes: number;
  monthlyExports: number;
  paidMembers: number;
  templateUsage: { key: string; name: string; count: number }[];
  recentUsers: { id: string; name: string; email: string; createdAt: string; resumeCount: number }[];
  trend: { date: string; resumes: number; exports: number }[];
}

const NAV_ITEMS: { key: DashboardSection; label: string; icon: React.ComponentType<{ className?: string }>; adminOnly?: boolean }[] = [
  { key: "basic", label: "个人资料", icon: UserRound },
  { key: "membership", label: "会员中心", icon: Crown },
  { key: "resumes", label: "我的简历", icon: FileText },
  { key: "favorites", label: "我的收藏", icon: Heart },
  { key: "orders", label: "我的订单", icon: ReceiptText },
  { key: "tutorial", label: "使用教程", icon: BookOpen },
  { key: "admin", label: "管理后台", icon: BarChart3, adminOnly: true },
];

const SECTION_COPY: Record<DashboardSection, [string, string]> = {
  basic: ["个人资料", "管理你的账户信息与公开资料"],
  membership: ["会员中心", "为认真求职的每一步，提供更完整的工具"],
  resumes: ["我的简历", "管理不同岗位的投递版本与导出记录"],
  favorites: ["我的收藏", "把喜欢的版式留在这里，随时开始下一份简历"],
  orders: ["我的订单", "查看会员订阅、支付与发票记录"],
  tutorial: ["使用教程", "从选择模板到导出 PDF，三步完成一份专业简历"],
  admin: ["管理后台", "平台数据概览与模板使用情况"],
};

const TAG_LABELS: Record<string, string> = {
  general: "通用",
  internet: "互联网",
  product: "产品",
  design: "设计",
  finance: "金融",
  consulting: "咨询",
  education: "教育",
  technology: "技术",
  professional: "专业",
  modern: "现代",
  minimal: "极简",
  bilingual: "双语",
};

function formatDate(value?: string | null, withTime = false) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("zh-CN", withTime
    ? { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }
    : { year: "numeric", month: "long", day: "numeric" }).format(date);
}

export default function DashboardPage() {
  const router = useRouter();
  const auth = useAuthStore();

  useEffect(() => { void auth.refreshSession(); }, [auth]);
  useEffect(() => {
    if (!auth.isLoading && !auth.isLoggedIn) router.push("/login");
  }, [auth.isLoading, auth.isLoggedIn, router]);

  if (auth.isLoading || !auth.user) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f8f4ed]"><Loader2 className="h-7 w-7 animate-spin text-[#075be8]" /></div>;
  }

  return <DashboardApp />;
}

function DashboardApp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAdmin, logout, updateProfile } = useAuthStore();
  const {
    resumes, activeResumeId, template, theme, settings, sections,
    ensureOwner, syncServerResumes, setActiveResume, deleteResume, createResume,
  } = useResumeStore();
  const { favoriteTemplateKeys, isLoading: favoritesLoading, loadFavorites, removeFavorite } = useFavoriteStore();
  const [activeSection, setActiveSection] = useState<DashboardSection>("basic");
  const [account, setAccount] = useState<AccountOverview | null>(null);
  const [accountLoading, setAccountLoading] = useState(true);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [profile, setProfile] = useState({
    name: user?.name ?? "",
    targetRole: user?.targetRole ?? "",
    bio: user?.bio ?? "",
    avatar: user?.avatar ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [orderTab, setOrderTab] = useState<"all" | "paid" | "refunded">("all");
  const [orderQuery, setOrderQuery] = useState("");

  useEffect(() => {
    const requestedSection = searchParams.get("section") as DashboardSection | null;
    if (!requestedSection || !NAV_ITEMS.some((item) => item.key === requestedSection)) return;
    if (requestedSection === "admin" && !isAdmin) return;
    setActiveSection(requestedSection);
  }, [searchParams, isAdmin]);

  const refreshAccount = async () => {
    setAccountLoading(true);
    try {
      const response = await fetch("/api/account", { cache: "no-store" });
      if (!response.ok) throw new Error("账户数据加载失败");
      setAccount(await response.json() as AccountOverview);
    } catch (error) {
      toast(error instanceof Error ? error.message : "账户数据加载失败", "error");
    } finally {
      setAccountLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    ensureOwner(user.id);
    void loadFavorites();
    void refreshAccount();
    fetch("/api/resumes", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : [])
      .then((data) => syncServerResumes(data as ResumeMeta[]))
      .catch(() => undefined);
  }, [user, ensureOwner, loadFavorites, syncServerResumes]);

  useEffect(() => {
    if (activeSection !== "admin" || !isAdmin || adminStats) return;
    fetch("/api/admin/stats", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("后台数据加载失败");
        return response.json();
      })
      .then((data) => setAdminStats(data as AdminStats))
      .catch((error) => toast(error instanceof Error ? error.message : "后台数据加载失败", "error"));
  }, [activeSection, isAdmin, adminStats]);

  if (!user) return null;

  const displayAvatar = profile.avatar || user.avatar;
  const title = SECTION_COPY[activeSection];
  const filteredOrders = (account?.orders ?? []).filter((order) => {
    const statusMatched = orderTab === "all" || order.status === orderTab;
    return statusMatched && (!orderQuery || order.orderNo.toLowerCase().includes(orderQuery.toLowerCase()));
  });

  const handleAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast("头像请控制在 2MB 以内", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setProfile((current) => ({ ...current, avatar: String(reader.result ?? "") }));
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    setSaving(true);
    const ok = await updateProfile(profile);
    setSaving(false);
    toast(ok ? "个人资料已保存" : "保存失败，请稍后重试", ok ? "success" : "error");
  };

  const upgrade = async () => {
    setUpgrading(true);
    try {
      const response = await fetch("/api/membership", { method: "POST" });
      if (!response.ok) throw new Error((await response.json()).message || "升级失败");
      await refreshAccount();
      toast("专业版已开通", "success");
    } catch (error) {
      toast(error instanceof Error ? error.message : "升级失败", "error");
    } finally {
      setUpgrading(false);
    }
  };

  const requestInvoice = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/invoice`, { method: "POST" });
      if (!response.ok) throw new Error("申请发票失败");
      await refreshAccount();
      toast("发票申请已提交", "success");
    } catch (error) {
      toast(error instanceof Error ? error.message : "申请发票失败", "error");
    }
  };

  const applyFavoriteTemplate = (key: TemplateKey) => {
    createResume(key, resumeTemplates[key].defaultTheme);
    router.push("/editor");
  };

  const editResume = (id: string) => {
    setActiveResume(id);
    router.push("/editor");
  };

  const removeResume = async (resume: ResumeMeta) => {
    if (!window.confirm(`确定删除「${resume.name}」吗？`)) return;
    const response = await fetch(`/api/resumes/${resume.id}`, { method: "DELETE" });
    if (!response.ok) {
      toast("删除失败", "error");
      return;
    }
    deleteResume(resume.id);
    toast("简历已删除", "success");
  };

  const downloadResume = async (resume: ResumeMeta) => {
    try {
      let snapshot: ResumePersistedDocument["snapshot"];
      if (resume.id === activeResumeId) {
        snapshot = { template, theme, settings, sections };
      } else {
        const response = await fetch(`/api/resumes/${resume.id}`, { cache: "no-store" });
        if (response.ok) snapshot = ((await response.json()) as ResumePersistedDocument).snapshot;
        else {
          const key = resume.template as TemplateKey;
          snapshot = { template: key, theme: resume.theme as ThemeKey, settings, sections: getTemplateSections(key) };
        }
      }
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...snapshot, title: resume.name }),
      });
      if (!response.ok) throw new Error("导出失败");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${sanitizeFileName(resume.name, "resume")}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
      await refreshAccount();
    } catch (error) {
      toast(error instanceof Error ? error.message : "导出失败", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f4ed] text-[#171716]">
      <Navbar variant="account" />
      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[260px_1fr]">
        <aside className="min-h-[calc(100vh-66px)] border-r border-[#bbb5ab] px-6 py-10">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-[#cbc5bb] bg-[#eee8de]">
              {displayAvatar ? <img src={displayAvatar} alt={profile.name} className="h-full w-full object-cover" /> : <UserRound className="h-9 w-9 text-[#888179]" />}
            </div>
            <h1 className="mt-4 font-editorial text-2xl font-semibold">{profile.name || user.name}</h1>
            {activeSection === "basic"
              ? <p className="mt-1 text-xs text-[#77716a]">ID: {user.id.slice(0, 8)}…{user.id.slice(-4)}</p>
              : <span className="mt-2 bg-[#e7edf9] px-3 py-1 text-xs text-[#075be8]">{account?.membership.plan === "pro" ? "专业版" : "免费版"}</span>}
            <button onClick={() => setActiveSection("membership")} className="mt-5 text-sm text-[#075be8] hover:underline">
              <Gem className="mr-2 inline h-4 w-4" />升级会员，解锁更多权益
            </button>
          </div>
          <div className="my-7 border-t border-[#cbc5bb]" />
          <nav className="space-y-1">
            {NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin).map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.key;
              return (
                <button key={item.key} onClick={() => setActiveSection(item.key)}
                  className={cn("flex w-full items-center gap-3 border-l-2 px-3 py-3 text-left text-sm transition",
                    active ? "border-[#075be8] text-[#075be8]" : "border-transparent text-[#4d4944] hover:text-[#075be8]")}>
                  <Icon className="h-5 w-5 stroke-[1.4]" />{item.label}
                </button>
              );
            })}
          </nav>
          <div className="mt-7 border-t border-[#cbc5bb] pt-6">
            <button onClick={() => setActiveSection("tutorial")} className="flex w-full items-center gap-3 px-3 py-3 text-sm hover:text-[#075be8]"><CircleHelp className="h-5 w-5 stroke-[1.4]" />帮助与反馈</button>
            <button onClick={async () => { await logout(); router.push("/"); }} className="flex w-full items-center gap-3 px-3 py-3 text-sm hover:text-red-600"><LogOut className="h-5 w-5 stroke-[1.4]" />退出登录</button>
          </div>
        </aside>

        <main className="min-w-0 px-8 py-10 lg:px-14">
          <header>
            <h2 className="font-editorial text-[46px] font-semibold tracking-[-.045em]">{title[0]}</h2>
            <p className="mt-2 text-sm text-[#65605a]">{title[1]}</p>
            <div className="editorial-rule mt-5" />
          </header>

          {activeSection === "basic" && (
            <section className="mt-10">
              <div className="border-t border-[#cbc5bb] pt-6"><h3 className="font-editorial text-xl font-semibold">基本资料</h3></div>
              <div className="mt-6 grid gap-12 lg:grid-cols-[1fr_330px]">
                <div className="space-y-5">
                  {[
                    ["昵称", "name", "请输入昵称"],
                    ["目标职位", "targetRole", "请输入目标职位"],
                  ].map(([label, key, placeholder]) => (
                    <label key={key} className="block">
                      <span className="mb-2 block text-sm">{label}</span>
                      <input value={profile[key as "name" | "targetRole"]} placeholder={placeholder}
                        onChange={(event) => setProfile((current) => ({ ...current, [key]: event.target.value }))}
                        className="editorial-input h-12 px-4 text-sm" />
                    </label>
                  ))}
                  <label className="block">
                    <span className="mb-2 block text-sm">个人简介</span>
                    <div className="relative">
                      <textarea maxLength={300} rows={4} value={profile.bio}
                        onChange={(event) => setProfile((current) => ({ ...current, bio: event.target.value }))}
                        className="editorial-input resize-none px-4 py-3 text-sm leading-6" />
                      <span className="absolute bottom-3 right-3 text-xs text-[#888179]">{profile.bio.length}/300</span>
                    </div>
                  </label>
                </div>
                <div>
                  <div className="text-sm">头像</div>
                  <div className="mt-3 flex flex-col items-center">
                    <div className="h-56 w-56 overflow-hidden rounded-full border border-[#cbc5bb] bg-[#eee8de]">
                      {displayAvatar ? <img src={displayAvatar} alt={profile.name} className="h-full w-full object-cover" /> : <UserRound className="m-auto mt-20 h-14 w-14 text-[#888179]" />}
                    </div>
                    <div className="mt-5 flex items-center gap-5 text-sm">
                      <label className="cursor-pointer text-[#075be8]">更换头像<input type="file" accept="image/*" className="hidden" onChange={handleAvatar} /></label>
                      <span className="h-4 border-l border-[#cbc5bb]" />
                      <button onClick={() => setProfile((current) => ({ ...current, avatar: "" }))} className="text-red-600">删除</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 border-t border-[#cbc5bb] pt-5">
                <h3 className="font-editorial text-xl font-semibold">账户信息</h3>
                <dl className="mt-4 max-w-[600px] text-sm">
                  <div className="grid grid-cols-[160px_1fr] border-b border-[#d7d1c8] py-3"><dt>登录邮箱</dt><dd>{user.email || "—"}</dd></div>
                  <div className="grid grid-cols-[160px_1fr] border-b border-[#d7d1c8] py-3"><dt>绑定手机</dt><dd>{user.phone || "未绑定"}</dd></div>
                  <div className="grid grid-cols-[160px_1fr] border-b border-[#d7d1c8] py-3"><dt>注册时间</dt><dd>{formatDate(account?.registeredAt)}</dd></div>
                </dl>
                <div className="mt-6 flex gap-4">
                  <button onClick={saveProfile} disabled={saving} className="editorial-button min-w-36 px-7 py-3 text-sm">{saving ? "保存中..." : "保存修改"}</button>
                  <button onClick={() => setProfile({ name: user.name, targetRole: user.targetRole ?? "", bio: user.bio ?? "", avatar: user.avatar ?? "" })} className="border border-[#aaa49b] px-7 py-3 text-sm">重置</button>
                </div>
              </div>
            </section>
          )}

          {activeSection === "membership" && (
            <MembershipSection account={account} loading={accountLoading} upgrading={upgrading} onUpgrade={upgrade} />
          )}

          {activeSection === "resumes" && (
            <section className="mt-10">
              <div className="flex justify-end"><button onClick={() => router.push("/templates")} className="editorial-button px-6 py-3 text-sm">新建简历</button></div>
              <div className="mt-6 grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
                {resumes.map((resume) => {
                  const key = resume.template as TemplateKey;
                  return (
                    <article key={resume.id} className="border-t border-[#bbb5ab] pt-4">
                      <div className="aspect-[210/297] overflow-hidden border border-[#cbc5bb] bg-white"><ScaledResumePreview templateKey={key} themeKey={resume.theme as ThemeKey} /></div>
                      <div className="mt-4 flex items-start justify-between gap-3">
                        <div><h3 className="font-editorial text-lg font-semibold">{resume.name}</h3><p className="mt-1 text-xs text-[#77716a]">{formatDate(resume.updatedAt, true)} 更新</p></div>
                        {resume.id === activeResumeId && <span className="bg-[#e7edf9] px-2 py-1 text-[10px] text-[#075be8]">当前</span>}
                      </div>
                      <div className="mt-4 flex gap-3 text-xs">
                        <button onClick={() => editResume(resume.id)} className="text-[#075be8]">编辑</button>
                        <button onClick={() => void downloadResume(resume)}>导出 PDF</button>
                        <button onClick={() => void removeResume(resume)} className="text-red-600">删除</button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {activeSection === "favorites" && (
            <section className="mt-8">
              <div className="flex justify-end"><button onClick={() => router.push("/templates")} className="inline-flex items-center gap-3 border border-[#77716a] px-6 py-3 text-sm">浏览更多模板 <ArrowRight className="h-4 w-4" /></button></div>
              {favoritesLoading ? <Loader2 className="mt-16 h-6 w-6 animate-spin" /> :
                <div className="mt-7 grid gap-7 sm:grid-cols-2 xl:grid-cols-4">
                  {favoriteTemplateKeys.map((key) => {
                    const item = resumeTemplates[key];
                    return (
                      <article key={key}>
                        <div className="aspect-[210/297] overflow-hidden border border-[#cbc5bb] bg-white shadow-[0_12px_26px_rgba(49,41,31,.06)]"><ScaledResumePreview templateKey={key} themeKey={item.defaultTheme} /></div>
                        <h3 className="mt-4 font-editorial text-lg font-semibold">{item.name}</h3>
                        <div className="mt-3 flex gap-2">{item.tags.industry.slice(0, 3).map((tag) => <span key={tag} className="border border-[#d7d1c8] px-2 py-1 text-[10px]">{TAG_LABELS[tag] ?? tag}</span>)}</div>
                        <div className="mt-4 flex gap-5 text-xs"><button onClick={() => applyFavoriteTemplate(key)} className="inline-flex items-center gap-2"><Heart className="h-4 w-4 fill-[#075be8] text-[#075be8]" />使用模板</button><button onClick={() => void removeFavorite(key)}>取消收藏</button></div>
                      </article>
                    );
                  })}
                </div>}
            </section>
          )}

          {activeSection === "orders" && (
            <OrdersSection account={account} orders={filteredOrders} tab={orderTab} query={orderQuery} onTab={setOrderTab} onQuery={setOrderQuery} onInvoice={requestInvoice} onMembership={() => setActiveSection("membership")} />
          )}

          {activeSection === "tutorial" && (
            <TutorialSection onStart={() => router.push("/templates")} />
          )}

          {activeSection === "admin" && isAdmin && (
            <AdminSection stats={adminStats} />
          )}
        </main>
      </div>
    </div>
  );
}

function MembershipSection({ account, loading, upgrading, onUpgrade }: { account: AccountOverview | null; loading: boolean; upgrading: boolean; onUpgrade: () => void }) {
  const membership = account?.membership;
  const isPro = membership?.plan === "pro";
  if (loading) return <Loader2 className="mt-16 h-6 w-6 animate-spin" />;
  return (
    <section className="mt-6">
      <div className="grid items-center border border-[#bbb5ab] px-8 py-6 md:grid-cols-[1fr_1fr_1fr_auto]">
        <div><p className="text-xs text-[#77716a]">当前方案</p><p className="mt-2 text-xl font-semibold text-[#075be8]">{isPro ? "专业版" : "免费版"}</p></div>
        <div className="border-l border-[#cbc5bb] pl-8"><p className="text-xs text-[#77716a]">可创建</p><p className="mt-2 text-xl">{membership?.maxResumes ?? "无限"} 份简历</p></div>
        <div className="border-l border-[#cbc5bb] pl-8"><p className="text-xs text-[#77716a]">本月导出</p><p className="mt-2 text-xl">{membership?.exportsUsed ?? 0} / {membership?.monthlyExportLimit ?? "无限"} 次</p></div>
        {!isPro && <button onClick={onUpgrade} disabled={upgrading} className="editorial-button px-8 py-3 text-sm">{upgrading ? "处理中..." : "升级专业版"}</button>}
      </div>
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <PlanCard title="免费版" price="¥0" features={["基础模板", "3 份简历", "每月 5 次导出"]} />
        <PlanCard featured title="专业版" price="¥29" suffix="/ 月" features={["全部高级模板", "无限简历版本", "无限 PDF 导出", "优先导出队列", "多设备同步"]} action={!isPro ? <button onClick={onUpgrade} disabled={upgrading} className="editorial-button mt-5 w-full py-3 text-sm">立即升级</button> : <div className="mt-5 border border-[#075be8] py-3 text-center text-sm text-[#075be8]">当前方案</div>} />
      </div>
      <h3 className="mt-5 font-editorial text-xl font-semibold">会员权益</h3>
      <div className="mt-3 border-t border-[#bbb5ab]">
        {[["高级模板解锁", "解锁全部高级模板，专业设计助你脱颖而出。"], ["多份简历管理", "持续创建和管理不同岗位版本。"], ["稳定快速导出", "无限制导出 PDF，享受更快处理。"], ["内容版本记录", "自动保存编辑历史，随时恢复。"]].map(([name, desc]) => <div key={name} className="grid grid-cols-[280px_1fr] border-b border-[#d7d1c8] py-3 text-sm"><strong>{name}</strong><span className="text-[#77716a]">{desc}</span></div>)}
      </div>
    </section>
  );
}

function PlanCard({ title, price, suffix, features, featured, action }: { title: string; price: string; suffix?: string; features: string[]; featured?: boolean; action?: React.ReactNode }) {
  return <div className={cn("min-h-[345px] border border-[#bbb5ab] p-7", featured && "border-t-[3px] border-t-[#075be8]")}><h3 className="font-editorial text-xl font-semibold">{title}</h3><div className={cn("mt-3 font-editorial text-4xl", featured && "text-[#075be8]")}>{price} <span className="font-sans text-sm text-[#171716]">{suffix}</span></div><div className="my-4 border-t border-[#cbc5bb]" /><ul className="space-y-3 text-sm">{features.map((item) => <li key={item} className="flex gap-3"><Check className="h-4 w-4 text-[#075be8]" />{item}</li>)}</ul>{action}</div>;
}

function OrdersSection({ account, orders, tab, query, onTab, onQuery, onInvoice, onMembership }: {
  account: AccountOverview | null; orders: AccountOverview["orders"]; tab: "all" | "paid" | "refunded"; query: string;
  onTab: (value: "all" | "paid" | "refunded") => void; onQuery: (value: string) => void; onInvoice: (id: string) => void; onMembership: () => void;
}) {
  const paid = account?.orders.filter((order) => order.status === "paid") ?? [];
  return <section className="mt-8">
    <div className="grid border border-[#bbb5ab] px-8 py-7 md:grid-cols-[1fr_1fr_1fr_auto]">
      <div><p className="text-sm">累计订单</p><p className="mt-2 font-editorial text-4xl">{account?.orders.length ?? 0}</p></div>
      <div className="border-l border-[#cbc5bb] pl-8"><p className="text-sm">累计支付</p><p className="mt-2 font-editorial text-4xl">¥ {paid.reduce((sum, order) => sum + order.amount, 0)}</p></div>
      <div className="border-l border-[#cbc5bb] pl-8"><p className="text-sm">当前方案</p><p className="mt-2 font-editorial text-3xl">{account?.membership.plan === "pro" ? "专业版" : "免费版"}</p></div>
      <button onClick={onMembership} className="border border-[#77716a] px-7 py-3 text-sm">查看会员方案</button>
    </div>
    <div className="mt-7 flex items-end justify-between border-b border-[#cbc5bb]">
      <div className="flex gap-9">{([["all", "全部"], ["paid", "已支付"], ["refunded", "已退款"]] as const).map(([value, label]) => <button key={value} onClick={() => onTab(value)} className={cn("border-b-2 px-2 py-3 text-sm", tab === value ? "border-[#075be8] text-[#075be8]" : "border-transparent")}>{label}</button>)}</div>
      <label className="mb-2 flex h-11 w-64 items-center gap-3 border border-[#bbb5ab] px-4"><Search className="h-4 w-4" /><input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="搜索订单号" className="w-full bg-transparent text-sm outline-none" /></label>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px] text-left text-sm"><thead><tr className="border-b border-[#cbc5bb]">{["订单号", "商品", "金额", "状态", "下单时间", "操作"].map((item) => <th key={item} className="px-4 py-4 font-normal">{item}</th>)}</tr></thead><tbody>{orders.map((order) => <tr key={order.id} className="border-b border-[#d7d1c8]"><td className="px-4 py-5">{order.orderNo}</td><td className="px-4 py-5">{order.productName}</td><td className="px-4 py-5">¥ {order.amount}</td><td className={cn("px-4 py-5", order.status === "paid" ? "text-emerald-600" : "text-[#77716a]")}>{order.status === "paid" ? "已支付" : order.status === "refunded" ? "已退款" : "处理中"}</td><td className="px-4 py-5">{formatDate(order.createdAt, true)}</td><td className="px-4 py-5"><button className="mr-5 text-[#075be8]">查看详情</button>{order.status === "paid" && order.invoiceStatus === "none" && <button onClick={() => onInvoice(order.id)} className="text-[#075be8]">申请发票</button>}{order.invoiceStatus === "requested" && <span className="text-[#77716a]">发票申请中</span>}</td></tr>)}</tbody></table>
      {!orders.length && <div className="border-b border-[#cbc5bb] py-16 text-center text-sm text-[#77716a]"><PackageOpen className="mx-auto mb-3 h-8 w-8" />暂无匹配订单</div>}
    </div>
    <div className="mt-6 flex justify-end gap-2"><button className="border border-[#cbc5bb] p-2"><ChevronLeft className="h-4 w-4" /></button><button className="bg-[#075be8] px-4 text-white">1</button><button className="border border-[#cbc5bb] p-2"><ChevronRight className="h-4 w-4" /></button></div>
  </section>;
}

function TutorialSection({ onStart }: { onStart: () => void }) {
  return <section className="mt-10">
    <div className="grid gap-8 border-b border-[#bbb5ab] pb-7 lg:grid-cols-3">
      {[["01", FileText, "选择模板", "从海量专业模板中挑选合适版式。"], ["02", PencilLine, "填写内容", "在编辑器中填写教育背景、工作经历和项目成果。"], ["03", Download, "预览与导出", "检查排版与内容无误后，一键导出 PDF。"]].map(([number, Icon, title, desc], index) => {
        const Graphic = Icon as typeof FileText;
        return <div key={String(number)}><div className={cn("flex items-center gap-5", index === 1 && "text-[#075be8]")}><span className="font-editorial text-5xl">{String(number)}</span><Graphic className="h-11 w-11 stroke-[1.2]" /></div><h3 className="mt-3 font-editorial text-xl font-semibold">{String(title)}</h3><p className="mt-2 text-sm leading-6 text-[#65605a]">{String(desc)}</p></div>;
      })}
    </div>
    <h3 className="mt-7 font-editorial text-2xl font-semibold">编辑器快速上手</h3>
    <div className="mt-4 grid gap-10 lg:grid-cols-[1.55fr_.75fr]">
      <div className="grid h-[390px] grid-cols-[130px_1fr_1fr] overflow-hidden border border-[#bbb5ab] bg-white shadow-[0_15px_30px_rgba(49,41,31,.06)]">
        <div className="border-r border-[#d7d1c8] p-4 text-xs">{["基本信息", "教育背景", "工作经历", "项目经历", "技能证书"].map((item, index) => <div key={item} className={cn("mb-4", index === 0 && "text-[#075be8]")}>{item}</div>)}</div>
        <div className="border-r border-[#d7d1c8] p-5"><div className="text-sm font-semibold">基本信息</div>{["姓名", "求职意向", "手机号", "邮箱", "所在地"].map((item) => <div key={item} className="mt-4"><div className="text-[10px] text-[#77716a]">{item}</div><div className="mt-1 h-7 border border-[#d7d1c8]" /></div>)}</div>
        <div className="overflow-hidden p-5"><ScaledResumePreview templateKey={Object.keys(resumeTemplates)[0] as TemplateKey} themeKey={Object.values(resumeTemplates)[0].defaultTheme} /></div>
      </div>
      <div>{["补充基本信息", "按目标岗位调整经历", "检查版式与分页", "导出 PDF"].map((item, index) => <div key={item} className="mb-6 flex gap-4"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#171716] text-xs text-white">{index + 1}</span><div><h4 className="font-semibold">{item}</h4><p className="mt-1 text-sm leading-6 text-[#65605a]">按步骤完成内容并预览，确保信息准确、层级清晰。</p></div></div>)}<button onClick={onStart} className="editorial-button mt-2 px-8 py-3 text-sm">开始制作简历</button></div>
    </div>
  </section>;
}

function AdminSection({ stats }: { stats: AdminStats | null }) {
  if (!stats) return <Loader2 className="mt-16 h-6 w-6 animate-spin" />;
  const max = Math.max(...stats.templateUsage.map((item) => item.count), 1);
  return <section className="mt-8">
    <div className="grid gap-0 border-b border-[#bbb5ab] pb-7 sm:grid-cols-2 xl:grid-cols-4">
      {[["注册用户", stats.totalUsers], ["简历总数", stats.totalResumes], ["本月导出", stats.monthlyExports], ["付费会员", stats.paidMembers]].map(([label, value], index) => <div key={String(label)} className={cn("px-7", index > 0 && "border-l border-[#cbc5bb]")}><p className="text-sm">{String(label)}</p><p className="mt-2 font-editorial text-4xl">{String(value)}</p><p className="mt-2 text-xs text-[#77716a]">实时数据</p></div>)}
    </div>
    <div className="mt-5 grid gap-10 border-b border-[#bbb5ab] pb-6 lg:grid-cols-[1.2fr_1fr]">
      <div><h3 className="font-editorial text-xl font-semibold">近 30 天使用趋势</h3><div className="mt-8 flex h-52 items-end gap-1 border-b border-l border-[#d7d1c8] px-3">{stats.trend.map((point) => <div key={point.date} className="flex flex-1 items-end gap-[2px]"><div title={`创建 ${point.resumes}`} className="w-1/2 bg-[#075be8]" style={{ height: `${Math.max(point.resumes * 12, 2)}px` }} /><div title={`导出 ${point.exports}`} className="w-1/2 bg-[#f05a1a]" style={{ height: `${Math.max(point.exports * 12, 2)}px` }} /></div>)}</div></div>
      <div className="border-l border-[#cbc5bb] pl-8"><h3 className="font-editorial text-xl font-semibold">模板使用排行</h3><div className="mt-7 space-y-5">{stats.templateUsage.slice(0, 6).map((item, index) => <div key={item.key} className="grid grid-cols-[20px_100px_1fr_52px] items-center gap-3 text-sm"><span>{index + 1}</span><span>{item.name}</span><div className="h-1 bg-[#d7d1c8]"><div className="h-full bg-[#075be8]" style={{ width: `${item.count / max * 100}%` }} /></div><span className="text-right">{item.count}</span></div>)}</div></div>
    </div>
    <div className="mt-6"><div className="flex items-center justify-between"><h3 className="font-editorial text-xl font-semibold">最近注册用户</h3><span className="text-sm text-[#075be8]">查看全部用户 →</span></div><table className="mt-4 w-full text-left text-sm"><thead><tr className="border border-[#cbc5bb]">{["用户", "邮箱", "注册时间", "简历数", "状态"].map((item) => <th key={item} className="px-4 py-3 font-normal">{item}</th>)}</tr></thead><tbody>{stats.recentUsers.map((item) => <tr key={item.id} className="border-b border-x border-[#d7d1c8]"><td className="px-4 py-3">{item.name}</td><td className="px-4 py-3">{item.email}</td><td className="px-4 py-3">{formatDate(item.createdAt, true)}</td><td className="px-4 py-3">{item.resumeCount}</td><td className="px-4 py-3 text-emerald-700">● 正常</td></tr>)}</tbody></table></div>
  </section>;
}

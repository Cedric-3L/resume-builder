"use client";

import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, ChevronDown, Flame, GraduationCap, Heart, Palette, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/ui/Footer";
import { MiniResumePreview } from "@/components/ui/MiniResumePreview";
import { ScaledResumePreview } from "@/components/ui/ScaledResumePreview";
import { Navbar } from "@/components/ui/Navbar";
import { cn } from "@/lib/utils";
import { resumeTemplates, templateKeys, type TemplateKey } from "@/store/demoData";
import { useAuthStore } from "@/store/useAuthStore";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { useResumeStore } from "@/store/useResumeStore";
import { toast } from "@/store/useToastStore";

const CATEGORY = ["全部", "应届", "社招", "互联网", "金融", "设计", "教育", "产品", "市场", "简约", "现代", "专业"];
const TAG_LABELS: Record<string, string> = {
  general: "通用",
  internet: "互联网",
  finance: "金融",
  education: "教育",
  design: "设计",
  marketing: "市场",
};
const CATEGORY_TAGS: Record<string, { industry?: string; scenario?: string; text?: string }> = {
  应届: { scenario: "campus" },
  社招: { scenario: "social" },
  实习: { scenario: "internship" },
  互联网: { industry: "internet" },
  金融: { industry: "finance" },
  设计: { industry: "design" },
  教育: { industry: "education" },
  市场: { industry: "marketing" },
  产品: { text: "产品" },
  简约: { text: "简洁 极简 简约" },
  现代: { text: "现代" },
  专业: { text: "professional" },
};

const SIDEBAR_PRIMARY = [
  { label: "热门推荐", category: "全部", sort: "recommended" },
  { label: "行业职位", category: "互联网", sort: "recommended" },
  { label: "大学专业", category: "教育", sort: "recommended" },
  { label: "设计风格", category: "设计", sort: "recommended" },
];

const SIDEBAR_GROUPS = [
  {
    title: "场景",
    items: [
      { label: "全部模板", category: "全部" },
      { label: "应届生", category: "应届" },
      { label: "社招", category: "社招" },
      { label: "实习 / 兼职", category: "实习" },
    ],
  },
  {
    title: "行业",
    items: [
      { label: "互联网", category: "互联网" },
      { label: "金融 / 咨询", category: "金融" },
      { label: "教育 / 研究", category: "教育" },
      { label: "设计 / 创意", category: "设计" },
      { label: "市场 / 销售", category: "市场" },
      { label: "产品 / 运营", category: "产品" },
    ],
  },
];

export default function TemplatesPage() {
  const router = useRouter();
  const { createResume, ensureOwner } = useResumeStore();
  const { user, isLoggedIn } = useAuthStore();
  const { favoriteTemplateKeys, loadFavorites, toggleFavorite } = useFavoriteStore();
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("全部");
  const [sort, setSort] = useState("newest");
  const [preview, setPreview] = useState<TemplateKey | null>(null);

  useEffect(() => {
    if (isLoggedIn) void loadFavorites();
  }, [isLoggedIn, loadFavorites]);

  const items = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    const filtered = templateKeys
      .map((key) => [key, resumeTemplates[key]] as const)
      .filter(([, item]) => {
        const searchable = `${item.name} ${item.description} ${item.tags.industry.join(" ")} ${item.tags.scenario.join(" ")} ${item.tags.style}`.toLowerCase();
        const rule = CATEGORY_TAGS[category];
        const categoryMatched = category === "全部" || (
          (!rule?.industry || item.tags.industry.includes(rule.industry)) &&
          (!rule?.scenario || item.tags.scenario.includes(rule.scenario)) &&
          (!rule?.text || rule.text.toLowerCase().split(" ").some((term) => searchable.includes(term)))
        );
        return categoryMatched && (!query || searchable.includes(query));
      });
    if (sort === "name") return filtered.sort((a, b) => a[1].name.localeCompare(b[1].name, "zh-CN"));
    if (sort === "newest") return filtered.reverse();
    return filtered;
  }, [category, keyword, sort]);

  const applyFilter = (nextCategory: string, nextSort = sort) => {
    setCategory(nextCategory);
    setSort(nextSort);
  };

  const handleUseTemplate = (key: TemplateKey) => {
    if (!isLoggedIn) {
      router.push("/login?redirect=/templates");
      return;
    }
    if (user?.id) ensureOwner(user.id);
    createResume(key, resumeTemplates[key].defaultTheme);
    router.push("/editor");
  };

  const favorite = async (key: TemplateKey) => {
    if (!isLoggedIn) {
      router.push("/login?redirect=/templates");
      return;
    }
    try {
      await toggleFavorite(key);
    } catch (error) {
      toast(error instanceof Error ? error.message : "收藏操作失败", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f4ed] text-[#171716]">
      <Navbar />
      <main className="mx-auto grid max-w-[1440px] lg:grid-cols-[245px_1fr]">
        <aside className="hidden min-h-[calc(100vh-66px)] border-r border-[#bbb5ab] px-10 py-10 lg:block">
          <h1 className="font-editorial text-3xl font-semibold">模板库</h1>
          <div className="mt-8 space-y-3 text-sm">
            {SIDEBAR_PRIMARY.map((item) => {
              const isActive = category === item.category && sort === item.sort;
              return (
              <button
                key={item.label}
                type="button"
                aria-pressed={isActive}
                onClick={() => applyFilter(item.category, item.sort)}
                className={cn(
                  "block w-full border-l-2 py-1 pl-3 text-left transition",
                  isActive ? "border-[#075be8] text-[#075be8]" : "border-transparent text-[#55514c] hover:border-[#9bbcff] hover:text-[#075be8]"
                )}
              >
                {item.label}
              </button>
              );
            })}
          </div>
          <div className="my-7 border-t border-[#cbc5bb]" />
          {SIDEBAR_GROUPS.map((group) => (
            <div key={group.title} className="mb-8">
              <div className="font-editorial text-lg font-semibold">{group.title}</div>
              <div className="mt-4 space-y-3 text-sm text-[#625e58]">
                {group.items.map((item) => {
                  const isActive = category === item.category;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => applyFilter(item.category)}
                      className={cn(
                        "block w-full border-l-2 py-0.5 pl-3 text-left transition",
                        isActive ? "border-[#075be8] text-[#075be8]" : "border-transparent hover:border-[#9bbcff] hover:text-[#075be8]"
                      )}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="mt-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#aaa49b] font-editorial text-2xl">G</div>
            <p className="mt-4 text-xs leading-6 text-[#77716a]">
              内容决定机会
              <br />
              排版让它被看见
            </p>
          </div>
        </aside>

        <section className="min-w-0 px-5 py-6 sm:px-8 lg:px-12">
          <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-start">
            <div>
              <h2 className="font-editorial text-4xl font-semibold tracking-[-.03em]">选择一份适合你的版式</h2>
              <p className="mt-2 text-sm text-[#77716a]">专业版式助你清晰呈现经历，让好内容脱颖而出。</p>
            </div>
            <label className="flex h-11 w-full max-w-[330px] items-center gap-3 border border-[#bdb7ad] px-4">
              <Search className="h-4 w-4 stroke-[1.4] text-[#625e58]" />
              <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索职位或模板"
                className="w-full bg-transparent text-sm outline-none placeholder:text-[#8b857d]" />
            </label>
          </div>

          <div className="mt-3 grid gap-0 border-y border-[#cbc5bb] sm:grid-cols-2 lg:grid-cols-4">
            {[
              [Flame, "热门推荐", "快速找到高效排版", "全部"],
              [BriefcaseBusiness, "行业职位", "按岗位方向过滤", "互联网"],
              [GraduationCap, "大学专业", "按专业偏好匹配", "应届"],
              [Palette, "设计风格", "按排版气质筛选", "简约"],
            ].map(([Icon, title, text, value]) => {
              const Graphic = Icon as typeof Flame;
              return (
                <button
                  key={String(title)}
                  onClick={() => setCategory(String(value))}
                  className="flex items-center gap-4 border-b border-[#cbc5bb] px-5 py-3 text-left transition hover:text-[#075be8] sm:border-r lg:border-b-0"
                >
                  <Graphic className="h-5 w-5 shrink-0 stroke-[1.3]" />
                  <span>
                    <span className="block text-sm font-medium">{String(title)}</span>
                    <span className="mt-1 block text-[11px] text-[#888179]">{String(text)}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-start justify-between gap-5 border-b border-[#cbc5bb] pb-3">
            <div className="flex flex-wrap gap-3">
              {CATEGORY.map((item) => (
                <button key={item} onClick={() => setCategory(item)}
                  className={cn("border px-4 py-1.5 text-xs transition",
                    category === item ? "border-[#1d1d1b] bg-[#1d1d1b] text-white" : "border-[#d3cdc3] text-[#5f5a54] hover:border-[#075be8] hover:text-[#075be8]")}>
                  {item}
                </button>
              ))}
            </div>
            <label className="relative hidden shrink-0 lg:block">
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="h-9 appearance-none border border-[#d3cdc3] bg-transparent pl-4 pr-9 text-xs text-[#5f5a54] outline-none focus:border-[#075be8]"
              >
                <option value="recommended">热门推荐</option>
                <option value="newest">最新上线</option>
                <option value="name">名称排序</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4" />
            </label>
          </div>

          <div className="mt-5 grid gap-x-7 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">
            {items.map(([key, item]) => {
              const isFavorite = favoriteTemplateKeys.includes(key);
              return (
                <article key={key} className="group">
                  <div className="relative aspect-[210/297] overflow-hidden border border-[#c7c1b8] bg-white shadow-[0_12px_28px_rgba(49,41,31,.07)] transition group-hover:border-[#075be8] group-focus-within:border-[#075be8]">
                    <ScaledResumePreview templateKey={key} themeKey={item.defaultTheme} />
                    <div className="absolute inset-x-0 bottom-0 flex translate-y-full gap-2 bg-[#f8f4ed]/96 p-3 transition group-hover:translate-y-0 group-focus-within:translate-y-0">
                      <button onClick={() => setPreview(key)} className="flex-1 border border-[#075be8] bg-[#075be8] px-3 py-2 text-xs text-white">
                        预览
                      </button>
                      <button onClick={() => handleUseTemplate(key)} className="flex-1 bg-[#1d1d1b] px-3 py-2 text-xs text-white">
                        使用此模板
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-editorial text-lg font-semibold">{item.name}</h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#77716a]">{item.description}</p>
                    </div>
                    <button onClick={() => void favorite(key)} aria-label={isFavorite ? "取消收藏" : "收藏模板"}
                      className={cn("p-1", isFavorite ? "text-[#075be8]" : "text-[#888179] hover:text-[#075be8]")}>
                      <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
                    </button>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {item.tags.industry.slice(0, 2).map((tag) => (
                      <span key={tag} className="bg-[#e8eef9] px-2 py-1 text-[10px] text-[#075be8]">{TAG_LABELS[tag] ?? tag}</span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>

          {!items.length && (
            <div className="mt-16 border-y border-[#cbc5bb] py-16 text-center">
              <h3 className="font-editorial text-2xl">没有匹配的模板</h3>
              <button onClick={() => { setKeyword(""); setCategory("全部"); }} className="mt-5 text-sm text-[#075be8]">清空筛选</button>
            </div>
          )}
        </section>
      </main>
      <Footer />

      {preview && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#171716]/70 p-5">
          <button onClick={() => setPreview(null)} className="absolute right-6 top-6 text-white"><X className="h-6 w-6" /></button>
          <div className="max-h-[92vh] overflow-auto bg-[#eee8de] p-6">
            <div className="h-[810px] w-[573px] max-w-[80vw] overflow-hidden bg-white">
              <div className="origin-top-left scale-[.722]">
                <MiniResumePreview templateKey={preview} themeKey={resumeTemplates[preview].defaultTheme} />
              </div>
            </div>
            <button onClick={() => handleUseTemplate(preview)} className="editorial-button mt-5 w-full py-3 text-sm">使用此模板</button>
          </div>
        </div>
      )}
    </div>
  );
}

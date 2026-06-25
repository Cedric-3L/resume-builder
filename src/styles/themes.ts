import React from "react";

export interface ThemeStyles {
  container?: React.CSSProperties;
  h1?: React.CSSProperties;
  h2?: React.CSSProperties;
  h3?: React.CSSProperties;
  p?: React.CSSProperties;
  ul?: React.CSSProperties;
  li?: React.CSSProperties;
  a?: React.CSSProperties;
}

export interface ThemeMeta {
  name: string;
  description: string;
  tags: {
    industry: string[];
    style: string;
    scenario: string[];
  };
  container: string;
  h1: string;
  h2: string;
  h3: string;
  p: string;
  ul: string;
  li: string;
  a: string;
  styles: ThemeStyles;
}

export const themes = {
  professional: {
    name: "专业标准",
    description: "稳妥、清晰，适合多数校招和社招岗位。",
    tags: {
      industry: ["general", "finance", "consulting"],
      style: "professional",
      scenario: ["campus", "social"],
    },
    container: "bg-white shadow-xl min-h-[297mm] border border-slate-200",
    h1: "text-3xl font-bold border-b-2 pb-3 mb-4 tracking-tight",
    h2: "text-lg font-semibold border-b pb-2 mt-7 mb-3 uppercase tracking-[0.2em]",
    h3: "text-base font-semibold mt-4 mb-1",
    p: "text-sm leading-7 mb-2",
    ul: "list-disc pl-5 text-sm space-y-1.5 mb-2",
    li: "",
    a: "underline underline-offset-4",
    styles: {
      h1: { borderColor: "var(--theme-color)", color: "#0f172a" },
      h2: { color: "var(--theme-color)", borderColor: "#e2e8f0" },
      h3: { color: "#0f172a" },
      p: { color: "#334155" },
      ul: { color: "#334155" },
      a: { color: "var(--theme-color)" },
    },
  },
  modern: {
    name: "现代简洁",
    description: "更有设计感，适合互联网、产品和运营方向。",
    tags: {
      industry: ["internet", "product", "general"],
      style: "modern",
      scenario: ["social", "campus", "internship"],
    },
    container:
      "bg-white shadow-xl min-h-[297mm] border border-slate-200 rounded-[24px]",
    h1: "text-4xl font-semibold mb-5 tracking-tight",
    h2: "text-base font-semibold mt-8 mb-3 uppercase tracking-[0.3em]",
    h3: "text-base font-semibold mt-4 mb-1",
    p: "text-sm leading-7 mb-2",
    ul: "list-disc pl-5 text-sm space-y-1.5 mb-2",
    li: "",
    a: "font-medium underline underline-offset-4",
    styles: {
      container: { background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)" },
      h1: { color: "#0f172a" },
      h2: { color: "var(--theme-color)" },
      h3: { color: "#111827" },
      p: { color: "#475569" },
      ul: { color: "#475569" },
      a: { color: "var(--theme-color)" },
    },
  },
  minimal: {
    name: "极简留白",
    description: "弱化装饰，突出信息密度和可读性。",
    tags: {
      industry: ["general", "internet", "education"],
      style: "minimalist",
      scenario: ["campus", "social", "internship"],
    },
    container: "bg-white shadow-xl min-h-[297mm] border border-slate-200",
    h1: "text-[30px] font-medium mb-7 text-center tracking-[0.28em]",
    h2: "text-sm font-semibold mt-8 mb-4 text-center uppercase tracking-[0.35em]",
    h3: "text-sm font-semibold mt-4 mb-1",
    p: "text-sm leading-7 mb-2",
    ul: "list-none text-sm space-y-1.5 mb-2",
    li: "pl-4 relative before:absolute before:left-0 before:top-[0.45rem] before:h-1 before:w-1 before:rounded-full before:bg-slate-400",
    a: "underline decoration-dotted underline-offset-4",
    styles: {
      h1: { color: "#111827" },
      h2: { color: "#475569" },
      h3: { color: "#111827" },
      p: { color: "#374151" },
      ul: { color: "#374151" },
      a: { color: "#111827" },
    },
  },
  creative: {
    name: "创意展示",
    description: "更活泼的视觉语言，适合设计、市场、内容方向。",
    tags: {
      industry: ["design", "marketing", "general"],
      style: "creative",
      scenario: ["internship", "freelance", "social"],
    },
    container:
      "bg-white shadow-xl min-h-[297mm] border-l-[14px] border-t-[14px] border-slate-900",
    h1: "text-4xl font-black mb-5 tracking-tight",
    h2: "text-lg font-bold mt-8 mb-3 inline-flex items-center gap-2",
    h3: "text-base font-semibold mt-4 mb-1",
    p: "text-sm leading-7 mb-2",
    ul: "list-none text-sm space-y-2 mb-2",
    li: "pl-4 relative before:absolute before:left-0 before:top-[0.15rem] before:text-[18px]",
    a: "font-semibold underline underline-offset-4",
    styles: {
      container: { borderColor: "var(--theme-color)" },
      h1: { color: "var(--theme-color)" },
      h2: { color: "#0f172a" },
      h3: { color: "#0f172a" },
      p: { color: "#475569" },
      ul: { color: "#475569" },
      li: { color: "#475569" },
      a: { color: "var(--theme-color)" },
    },
  },
  academic: {
    name: "学术严谨",
    description: "字重克制、信息完整，适合研究、法学和教育方向。",
    tags: {
      industry: ["education", "research", "general"],
      style: "academic",
      scenario: ["campus", "social", "senior"],
    },
    container: "bg-white shadow-xl min-h-[297mm] border border-stone-300",
    h1: "text-[30px] font-semibold mb-6 text-center",
    h2: "text-lg font-semibold border-b pb-2 mt-7 mb-3",
    h3: "text-base font-semibold mt-4 mb-1",
    p: "text-sm leading-7 mb-2",
    ul: "list-disc pl-5 text-sm space-y-1.5 mb-2",
    li: "",
    a: "underline underline-offset-4",
    styles: {
      container: { fontFamily: '"Noto Serif SC", "Songti SC", serif' },
      h1: { color: "#111827" },
      h2: { color: "#111827", borderColor: "#cbd5e1" },
      h3: { color: "#111827" },
      p: { color: "#374151" },
      ul: { color: "#374151" },
      a: { color: "var(--theme-color)" },
    },
  },
  elegant: {
    name: "优雅排版",
    description: "强调呼吸感和细节，适合品牌、时尚和内容岗位。",
    tags: {
      industry: ["design", "general", "marketing"],
      style: "elegant",
      scenario: ["freelance", "social", "internship"],
    },
    container: "bg-[#fffdfa] shadow-xl min-h-[297mm] border border-[#efe5d7]",
    h1: "text-4xl font-medium italic mb-6 text-center",
    h2: "text-lg font-medium italic border-b pb-2 mt-8 mb-3 text-center",
    h3: "text-base font-semibold mt-4 mb-1",
    p: "text-sm leading-8 mb-2",
    ul: "list-disc pl-5 text-sm space-y-1.5 mb-2",
    li: "",
    a: "underline underline-offset-4",
    styles: {
      h1: { color: "var(--theme-color)" },
      h2: { color: "#6b7280", borderColor: "#d6d3d1" },
      h3: { color: "#1f2937" },
      p: { color: "#57534e" },
      ul: { color: "#57534e" },
      a: { color: "var(--theme-color)" },
    },
  },
  compact: {
    name: "紧凑高效",
    description: "压缩留白，适合经验较多、想控制页数的场景。",
    tags: {
      industry: ["finance", "consulting", "general"],
      style: "compact",
      scenario: ["social", "senior"],
    },
    container: "bg-white shadow-xl min-h-[297mm] border border-slate-300",
    h1: "text-2xl font-bold mb-3 uppercase tracking-wide",
    h2: "text-sm font-bold border-b-2 pb-1 mt-5 mb-2 uppercase tracking-[0.25em]",
    h3: "text-sm font-semibold mt-3 mb-1",
    p: "text-[13px] leading-6 mb-1.5",
    ul: "list-disc pl-5 text-[13px] space-y-1 mb-1.5",
    li: "",
    a: "underline underline-offset-2",
    styles: {
      h1: { color: "#111827" },
      h2: { color: "#111827", borderColor: "var(--theme-color)" },
      h3: { color: "#111827" },
      p: { color: "#374151" },
      ul: { color: "#374151" },
      a: { color: "var(--theme-color)" },
    },
  },
  tech: {
    name: "技术深色",
    description: "适合程序员、工程师和技术作品集风格。",
    tags: {
      industry: ["internet", "engineering", "general"],
      style: "creative",
      scenario: ["social", "campus", "internship"],
    },
    container: "shadow-xl min-h-[297mm] border border-slate-800",
    h1: 'text-3xl font-bold mb-5 font-mono before:content-[">_"] before:mr-2',
    h2: "text-base font-semibold mt-7 mb-3 uppercase tracking-[0.22em] font-mono",
    h3: "text-base font-semibold mt-4 mb-1 font-mono",
    p: "text-sm leading-7 mb-2 font-mono",
    ul: "list-none text-sm space-y-1.5 mb-2 font-mono",
    li: 'pl-4 relative before:absolute before:left-0 before:top-0 before:content-["$"]',
    a: "underline underline-offset-4 font-mono",
    styles: {
      container: {
        backgroundColor: "#0f172a",
        color: "#cbd5e1",
      },
      h1: { color: "var(--theme-color)" },
      h2: { color: "#93c5fd", borderColor: "#1e293b" },
      h3: { color: "#f8fafc" },
      p: { color: "#cbd5e1" },
      ul: { color: "#cbd5e1" },
      li: { color: "#cbd5e1" },
      a: { color: "#7dd3fc" },
    },
  },
  classic: {
    name: "经典商务",
    description: "正式感更强，适合国企、传统行业和管理岗。",
    tags: {
      industry: ["general", "finance", "consulting"],
      style: "professional",
      scenario: ["social", "senior", "campus"],
    },
    container: "bg-white shadow-xl min-h-[297mm] border-t-8 border-slate-900",
    h1: "text-3xl font-bold mb-5",
    h2: "text-lg font-bold mt-7 mb-3 pl-3 border-l-4",
    h3: "text-base font-semibold mt-4 mb-1",
    p: "text-sm leading-7 mb-2",
    ul: "list-disc pl-5 text-sm space-y-1.5 mb-2",
    li: "",
    a: "underline underline-offset-4",
    styles: {
      container: { borderTopColor: "var(--theme-color)" },
      h1: { color: "#0f172a" },
      h2: { color: "#0f172a", borderColor: "var(--theme-color)" },
      h3: { color: "#0f172a" },
      p: { color: "#475569" },
      ul: { color: "#475569" },
      a: { color: "var(--theme-color)" },
    },
  },
} satisfies Record<string, ThemeMeta>;

export type ThemeKey = keyof typeof themes;

export const themeKeys = Object.keys(themes) as ThemeKey[];

export function isThemeKey(value: string): value is ThemeKey {
  return themeKeys.includes(value as ThemeKey);
}

export function sanitizeThemeKey(value: string | undefined | null): ThemeKey {
  if (value && isThemeKey(value)) {
    return value;
  }

  return "professional";
}

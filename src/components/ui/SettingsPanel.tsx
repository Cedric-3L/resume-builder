"use client";

import { ChangeEvent } from "react";
import {
  Database,
  Download,
  LayoutTemplate,
  Palette,
  RotateCcw,
  SlidersHorizontal,
  Type,
  Upload,
} from "lucide-react";
import { exportResumeMarkdown, exportResumeProject, importResumeProjectFile } from "@/lib/resume-transfer";
import { themes, ThemeKey } from "@/styles/themes";
import { useResumeStore, ResumeSnapshot } from "@/store/useResumeStore";
import { cn } from "@/lib/utils";
import { toast } from "@/store/useToastStore";

const COLORS = [
  "#2563eb",
  "#0f766e",
  "#7c3aed",
  "#dc2626",
  "#ea580c",
  "#0f172a",
  "#be123c",
  "#059669",
];

const FONT_OPTIONS = [
  {
    label: "系统无衬线",
    value: '"PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif',
  },
  {
    label: "极简细黑",
    value: '"DengXian", "PingFang SC Light", "Segoe UI Light", "Helvetica Neue Light", sans-serif',
  },
  {
    label: "黑体醒目",
    value: '"STHeiti", "SimHei", "Heiti SC", "PingFang SC", sans-serif',
  },
  {
    label: "现代英文",
    value: '"Aptos", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
  },
  {
    label: "优雅衬线",
    value: '"Noto Serif SC", "Songti SC", "Times New Roman", serif',
  },
  {
    label: "宋体正式",
    value: '"STSong", "SimSun", "宋体", "Noto Serif SC", "Songti SC", serif',
  },
  {
    label: "楷体传统",
    value: '"STKaiti", "KaiTi", "楷体", "Noto Serif SC", serif',
  },
  {
    label: "DIN 科技",
    value: '"DIN Alternate", "DIN", "Helvetica Neue", "Segoe UI", Arial, sans-serif',
  },
  {
    label: "技术等宽",
    value: '"JetBrains Mono", "Consolas", "Courier New", monospace',
  },
];

export function SettingsPanel() {
  const template = useResumeStore((s) => s.template);
  const theme = useResumeStore((s) => s.theme);
  const setTheme = useResumeStore((s) => s.setTheme);
  const settings = useResumeStore((s) => s.settings);
  const updateSettings = useResumeStore((s) => s.updateSettings);
  const markdown = useResumeStore((s) => s.markdown);
  const sections = useResumeStore((s) => s.sections);
  const resumes = useResumeStore((s) => s.resumes);
  const activeResumeId = useResumeStore((s) => s.activeResumeId);
  const loadTemplate = useResumeStore((s) => s.loadTemplate);
  const importSnapshot = useResumeStore((s) => s.importSnapshot);

  const activeResume = resumes.find((resume) => resume.id === activeResumeId);

  const handleExportMarkdown = () => {
    exportResumeMarkdown(markdown, activeResume?.name);
  };

  const handleExportProject = () => {
    const snapshot: ResumeSnapshot = {
      template,
      theme,
      settings,
      sections,
    };

    exportResumeProject(snapshot, activeResume?.name);
  };

  const handleImportProject = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const parsed = await importResumeProjectFile(file);
      importSnapshot(parsed);
      toast("项目文件已导入。", "success");
    } catch (error) {
      console.error("Failed to import project", error);
      toast("导入失败，请确认文件来自本站导出的 JSON 项目。", "error");
    } finally {
      event.target.value = "";
    }
  };

  const handleReset = () => {
    if (!window.confirm("确定要恢复为当前模板的示例内容吗？")) {
      return;
    }

    loadTemplate(template, theme, true);
  };

  return (
    <div className="h-full overflow-y-auto px-5 py-6 text-slate-100">
      <div className="space-y-6">
        <div className="rounded-[26px] border border-white/10 bg-white/5 p-5 shadow-[0_18px_45px_rgba(2,6,23,0.25)] backdrop-blur">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            Workspace Settings
          </div>
          <h3 className="mt-2 text-lg font-semibold text-white">统一控制简历的版式与导出体验</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            改主题、调字体、压缩间距都在这里完成，右侧预览会立刻同步变化。
          </p>
        </div>

        <section className="rounded-[26px] border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <LayoutTemplate className="h-4 w-4 text-slate-400" />
            模板主题
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(themes).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setTheme(key as ThemeKey)}
                className={cn(
                  "rounded-[20px] border px-3 py-3 text-left transition-all",
                  theme === key
                    ? "border-blue-400/50 bg-blue-500/15 shadow-[0_12px_24px_rgba(59,130,246,0.16)]"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                )}
              >
                <div className="text-sm font-medium text-white">{value.name}</div>
                <div className="mt-1 text-xs leading-5 text-slate-400">{value.description}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[26px] border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <Palette className="h-4 w-4 text-slate-400" />
            主题颜色
          </div>
          <div className="flex flex-wrap gap-3">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => updateSettings({ themeColor: color })}
                className={cn(
                  "h-10 w-10 rounded-full border-2 transition-transform hover:scale-105",
                  settings.themeColor === color
                    ? "scale-105 border-white shadow-[0_0_0_4px_rgba(255,255,255,0.08)]"
                    : "border-transparent"
                )}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </section>

        <section className="rounded-[26px] border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <Type className="h-4 w-4 text-slate-400" />
            字体与字号
          </div>
          <div className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-xs text-slate-400">字体</span>
              <select
                value={settings.fontFamily}
                onChange={(event) => updateSettings({ fontFamily: event.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none transition-colors focus:border-blue-400"
              >
                {FONT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs text-slate-400">正文字号 {settings.fontSize}px</span>
              <input
                type="range"
                min="12"
                max="18"
                step="0.5"
                value={settings.fontSize}
                onChange={(event) => updateSettings({ fontSize: Number(event.target.value) })}
                className="w-full accent-blue-500"
              />
            </label>
          </div>
        </section>

        <section className="rounded-[26px] border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <SlidersHorizontal className="h-4 w-4 text-slate-400" />
            页面密度
          </div>
          <div className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-xs text-slate-400">行高 {settings.lineHeight.toFixed(2)}</span>
              <input
                type="range"
                min="1.3"
                max="2"
                step="0.05"
                value={settings.lineHeight}
                onChange={(event) => updateSettings({ lineHeight: Number(event.target.value) })}
                className="w-full accent-blue-500"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs text-slate-400">页边距 {settings.margins}mm</span>
              <input
                type="range"
                min="10"
                max="24"
                step="1"
                value={settings.margins}
                onChange={(event) => updateSettings({ margins: Number(event.target.value) })}
                className="w-full accent-blue-500"
              />
            </label>
          </div>
        </section>

        <section className="rounded-[26px] border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <Database className="h-4 w-4 text-slate-400" />
            数据管理
          </div>
          <div className="space-y-3">
            <button
              onClick={handleExportMarkdown}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-100 transition-all hover:border-white/20 hover:bg-white/10"
            >
              <Download className="h-4 w-4" />
              导出 Markdown
            </button>

            <button
              onClick={handleExportProject}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-100 transition-all hover:border-white/20 hover:bg-white/10"
            >
              <Download className="h-4 w-4" />
              导出项目 JSON
            </button>

            <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-100 transition-all hover:border-white/20 hover:bg-white/10">
              <Upload className="h-4 w-4" />
              导入项目 JSON
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleImportProject}
                className="hidden"
              />
            </label>

            <button
              onClick={handleReset}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200 transition-all hover:border-red-500/30 hover:bg-red-500/15"
            >
              <RotateCcw className="h-4 w-4" />
              恢复示例内容
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

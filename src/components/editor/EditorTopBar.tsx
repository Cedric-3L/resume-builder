"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronDown,
  Download,
  FileJson,
  FileOutput,
  FileText,
  Loader2,
  Save,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  exportResumeMarkdown,
  exportResumeProject,
  sanitizeFileName,
} from "@/lib/resume-transfer";
import { useResumeStore } from "@/store/useResumeStore";
import { toast } from "@/store/useToastStore";

function formatSavedTime(value?: string) {
  if (!value) {
    return "刚刚";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

interface EditorTopBarProps {
  hasUnsavedChanges: boolean;
  onSave: () => void;
  savedAt: string | null;
  saveError?: string | null;
  saveStatus: "idle" | "saving" | "saved" | "error";
}

export function EditorTopBar({
  hasUnsavedChanges,
  onSave,
  savedAt,
  saveError,
  saveStatus,
}: EditorTopBarProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const markdown = useResumeStore((s) => s.markdown);
  const template = useResumeStore((s) => s.template);
  const theme = useResumeStore((s) => s.theme);
  const settings = useResumeStore((s) => s.settings);
  const sections = useResumeStore((s) => s.sections);
  const resumes = useResumeStore((s) => s.resumes);
  const activeResumeId = useResumeStore((s) => s.activeResumeId);
  const renameActiveResume = useResumeStore((s) => s.renameActiveResume);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [draftName, setDraftName] = useState<{ resumeId: string | null; value: string }>({
    resumeId: null,
    value: "",
  });
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const activeResume = useMemo(
    () => resumes.find((resume) => resume.id === activeResumeId),
    [activeResumeId, resumes]
  );
  const activeResumeName = activeResume?.name || "我的个人简历";
  const inputValue = draftName.resumeId === activeResumeId ? draftName.value : activeResumeName;
  const savedTimeLabel = formatSavedTime(savedAt ?? undefined);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExportPdf = async () => {
    if (isExportingPdf) return;

    setIsExportingPdf(true);

    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections,
          settings,
          template,
          theme,
          title: activeResumeName,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${sanitizeFileName(activeResumeName, "resume")}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Failed to export PDF", error);
      const message = error instanceof Error ? error.message : String(error);
      toast(`导出 PDF 失败：${message}`, "error");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleCommitName = () => {
    const nextName = inputValue.trim();
    if (!nextName) {
      setDraftName({ resumeId: activeResumeId, value: activeResumeName });
      return;
    }

    if (nextName !== activeResume?.name) {
      renameActiveResume(nextName);
    }
  };

  const handleExportMarkdown = () => {
    exportResumeMarkdown(markdown, activeResume?.name);
    setIsMenuOpen(false);
  };

  const handleExportProject = () => {
    exportResumeProject(
      {
        template,
        theme,
        settings,
        sections,
      },
      activeResume?.name
    );
    setIsMenuOpen(false);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/dashboard");
  };

  return (
    <header className="relative z-[120] border-b border-[#ded6cb] bg-[#fbf8f2]/96 px-4 py-2 shadow-[0_10px_34px_rgba(78,64,45,0.04)] xl:px-6">
      <div className="px-1 py-1.5">
        <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-start gap-2.5 xl:items-center xl:gap-3">
            <button
              onClick={handleBack}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-[#d8d0c4] bg-[#fffdf8] text-[#625e58] transition hover:border-[#171716] hover:bg-white"
              title="返回"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>

            <div className="min-w-0">
              <input
                key={activeResumeId}
                value={inputValue}
                onChange={(event) =>
                  setDraftName({ resumeId: activeResumeId, value: event.target.value })
                }
                onBlur={handleCommitName}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.currentTarget.blur();
                  }
                }}
                className="min-w-[180px] max-w-[360px] border border-transparent bg-transparent px-0 py-0 font-editorial text-[16px] font-semibold text-[#171716] outline-none"
              />
            </div>
          </div>

          <div className="relative flex shrink-0 flex-wrap items-center gap-1.5 xl:flex-nowrap" ref={menuRef}>
            {saveStatus === "error" ? (
              <div className="inline-flex items-center gap-1 rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-[10px] font-semibold text-red-700">
                <AlertCircle className="h-2.5 w-2.5" />
                同步失败
              </div>
            ) : saveStatus === "saving" ? (
              <div className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                保存中...
              </div>
            ) : hasUnsavedChanges ? (
              <div className="inline-flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
                <AlertCircle className="h-2.5 w-2.5" />
                有未保存改动
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                <Check className="h-2.5 w-2.5" />
                已保存 · {savedTimeLabel}
              </div>
            )}
            <button
              onClick={onSave}
              disabled={saveStatus === "saving" || !hasUnsavedChanges}
              title={saveError ?? undefined}
              className="inline-flex items-center gap-1.5 border border-[#171716] bg-[#fffdf8] px-3 py-1.5 text-[11px] font-semibold text-[#171716] transition hover:bg-[#171716] hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
            >
              {saveStatus === "saving" ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Save className="h-3 w-3" />
              )}
              保存
            </button>
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 bg-[#075be8] px-3 py-1.5 text-[11px] font-semibold text-white shadow-[0_10px_22px_rgba(7,91,232,0.18)] transition hover:bg-[#064fc9]"
            >
              <Download className="h-3 w-3" />
              {isExportingPdf ? "导出中..." : "导出简历"}
              <ChevronDown className={`h-3 w-3 transition-transform ${isMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-[130] w-52 border border-[#ded6cb] bg-[#fffdf8] p-1.5 shadow-[0_18px_40px_rgba(54,45,34,.12)]">
                <button
                  onClick={handleExportPdf}
                  disabled={isExportingPdf}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[11px] text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                >
                  <FileOutput className="h-3.5 w-3.5 text-slate-400" />
                  导出 PDF
                </button>
                <button
                  onClick={handleExportMarkdown}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[11px] text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  导出 Markdown
                </button>
                <button
                  onClick={handleExportProject}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[11px] text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <FileJson className="h-3.5 w-3.5 text-slate-400" />
                  导出项目 JSON
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

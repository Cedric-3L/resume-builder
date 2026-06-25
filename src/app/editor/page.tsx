"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Layers3, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { EditorTopBar } from "@/components/editor/EditorTopBar";
import { ModularEditor } from "@/components/editor/ModularEditor";
import { PreviewStyleToolbar } from "@/components/preview/PreviewStyleToolbar";
import { ResumePreview } from "@/components/preview/ResumePreview";
import { QUICK_ADD_TYPES, SECTION_LABELS } from "@/lib/editor-sections";
import { useAuthStore } from "@/store/useAuthStore";
import type { ResumePersistedDocument } from "@/store/useResumeStore";
import { useResumeStore } from "@/store/useResumeStore";

export default function EditorPage() {
  const router = useRouter();
  const componentRef = useRef<HTMLDivElement>(null);
  const editorScrollRef = useRef<HTMLDivElement>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [activeEditorSectionId, setActiveEditorSectionId] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const isLoading = useAuthStore((s) => s.isLoading);
  const refreshSession = useAuthStore((s) => s.refreshSession);
  const sections = useResumeStore((s) => s.sections);
  const addSection = useResumeStore((s) => s.addSection);
  const resumes = useResumeStore((s) => s.resumes);
  const activeResumeId = useResumeStore((s) => s.activeResumeId);
  const ensureOwner = useResumeStore((s) => s.ensureOwner);
  const applyPersistedResumeDocument = useResumeStore((s) => s.applyPersistedResumeDocument);

  const activeSections = useMemo(() => sections.filter((section) => section.isVisible), [sections]);
  const activeResume = useMemo(
    () => resumes.find((resume) => resume.id === activeResumeId),
    [activeResumeId, resumes]
  );
  const hasUnsavedChanges = useMemo(() => {
    if (!activeResume) {
      return false;
    }

    if (!lastSavedAt) {
      return true;
    }

    return new Date(activeResume.updatedAt).getTime() > new Date(lastSavedAt).getTime();
  }, [activeResume, lastSavedAt]);

  useEffect(() => {
    if (activeSections.length === 0) {
      setActiveEditorSectionId(null);
      return;
    }

    if (!activeEditorSectionId || !activeSections.some((section) => section.id === activeEditorSectionId)) {
      setActiveEditorSectionId(activeSections[0].id);
    }
  }, [activeEditorSectionId, activeSections]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace("/login?redirect=/editor");
    }
  }, [isLoading, isLoggedIn, router]);

  useEffect(() => {
    if (isLoggedIn && user?.id) {
      ensureOwner(user.id);
    }
  }, [ensureOwner, isLoggedIn, user?.id]);

  useEffect(() => {
    let cancelled = false;
    const resumeId = activeResumeId;

    async function loadFromServer() {
      if (!isLoggedIn || !resumeId) {
        return;
      }

      setSaveStatus("idle");
      setSaveError(null);

      try {
        const response = await fetch(`/api/resumes/${resumeId}`, { cache: "no-store" });
        if (!response.ok) {
          if (response.status === 404) {
            setLastSavedAt(null);
          } else {
            console.error("[loadFromServer] unexpected status:", response.status);
          }
          return;
        }

        const document = (await response.json()) as ResumePersistedDocument;
        if (cancelled) {
          return;
        }

        const latestState = useResumeStore.getState();
        const latestActiveResume = latestState.resumes.find((resume) => resume.id === resumeId);
        const localUpdatedAt = latestActiveResume?.updatedAt
          ? new Date(latestActiveResume.updatedAt).getTime()
          : 0;
        const serverUpdatedAt = document.updatedAt
          ? new Date(document.updatedAt).getTime()
          : 0;

        if (localUpdatedAt > serverUpdatedAt) {
          setLastSavedAt(document.updatedAt || null);
          setSaveStatus("idle");
          return;
        }

        applyPersistedResumeDocument(document);
        setLastSavedAt(document.updatedAt);
        setSaveStatus("saved");
      } catch (error) {
        console.error("[loadFromServer] failed:", error);
        setSaveStatus("error");
        setSaveError(error instanceof Error ? error.message : "读取保存状态失败");
      }
    }

    void loadFromServer();

    return () => {
      cancelled = true;
    };
  }, [activeResumeId, applyPersistedResumeDocument, isLoggedIn]);

  const handleSaveResume = useCallback(async () => {
    if (!isLoggedIn || !activeResumeId || !activeResume) {
      return;
    }

    setSaveStatus("saving");
    setSaveError(null);

    try {
      const { template, theme, settings, sections: latestSections } = useResumeStore.getState();
      const response = await fetch(`/api/resumes/${activeResumeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: activeResume.name,
          updatedAt: activeResume.updatedAt,
          snapshot: {
            template,
            theme,
            settings,
            sections: latestSections,
          },
        } satisfies ResumePersistedDocument),
      });
      if (!response.ok) {
        throw new Error(`保存失败 (${response.status})`);
      }
      const saved = (await response.json()) as ResumePersistedDocument;
      setLastSavedAt(saved.updatedAt || new Date().toISOString());
      setSaveStatus("saved");
    } catch (error) {
      console.error("Failed to persist resume to server", error);
      setSaveStatus("error");
      setSaveError(error instanceof Error ? error.message : "保存失败");
    }
  }, [activeResume, activeResumeId, isLoggedIn]);

  const scrollEditorToSection = useCallback((sectionId: string) => {
    setActiveEditorSectionId(sectionId);

    const container = editorScrollRef.current;
    if (!container) {
      return;
    }

    const target = container.querySelector<HTMLElement>(`[data-editor-section-id="${sectionId}"]`);
    if (!target) {
      return;
    }

    const offsetTop = target.offsetTop - 8;
    container.scrollTo({
      top: Math.max(offsetTop, 0),
      behavior: "smooth",
    });
  }, []);

  if (isLoading || !isLoggedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f1] text-[#55514c]">
        <div className="border border-[#d8d0c4] bg-[#fffdf8] px-8 py-6 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#d4cec4] border-t-[#075be8]" />
          <p className="mt-3 text-sm font-medium">正在确认登录状态...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="editor-warm-studio flex h-screen flex-col overflow-hidden bg-[#faf7f1] text-[#171716]">
      <EditorTopBar
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={handleSaveResume}
        savedAt={lastSavedAt}
        saveError={saveError}
        saveStatus={saveStatus}
      />

      <div className="mx-2 mt-1.5 flex items-center gap-1.5 overflow-x-auto border border-[#ded6cb] bg-[#fffdf8] px-2 py-2 shadow-[0_10px_30px_rgba(70,58,42,0.045)] xl:hidden">
        {activeSections.map((section, index) => {
          const isActive = activeEditorSectionId === section.id || (!activeEditorSectionId && index === 0);

          return (
            <button
              key={section.id}
              onClick={() => scrollEditorToSection(section.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                isActive
                  ? "border-[#075be8]/35 bg-[#fffdf8] text-[#075be8] shadow-[0_4px_14px_rgba(7,91,232,0.08)]"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-semibold ${
                  isActive ? "bg-[#075be8] text-white" : "bg-slate-200 text-slate-500"
                }`}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              {section.title}
            </button>
          );
        })}
        <div className="mx-0.5 h-5 w-px shrink-0 bg-slate-200" />
        {QUICK_ADD_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => addSection(type)}
            className="flex shrink-0 items-center gap-1 rounded-xl border border-dashed border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-500 transition-colors hover:border-blue-300 hover:text-blue-600"
          >
            <Plus className="h-3 w-3" />
            {SECTION_LABELS[type]}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-visible">
        <div className="grid h-full w-full items-start gap-x-0 overflow-visible border-t border-[#ded6cb] bg-[radial-gradient(circle_at_15%_12%,rgba(255,255,255,0.82),transparent_32%),linear-gradient(135deg,#fbf8f2_0%,#f7f1e9_100%)] xl:grid-cols-[224px_minmax(0,1.02fr)_minmax(0,1.18fr)]">
          <aside className="hidden h-full min-h-0 xl:flex xl:flex-col xl:gap-3 xl:self-stretch">
            <div className="flex h-full min-h-0 flex-col overflow-hidden border-r border-[#ded6cb] bg-[#fbf8f2]/94 text-[#171716] shadow-[inset_-1px_0_0_rgba(255,255,255,0.52)]">
              <div className="subtle-scrollbar min-h-0 flex-1 overflow-y-auto">
                <section className="border-b border-[#e2d9cd] px-4 py-4">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8a8175]">
                    <Layers3 className="h-3 w-3 text-[#8a8175]" />
                    模块导航
                  </div>
                  <div className="mt-3 space-y-1">
                    {activeSections.map((section, index) => {
                      const isActive = activeEditorSectionId === section.id || (!activeEditorSectionId && index === 0);

                      return (
                        <button
                          key={section.id}
                          onClick={() => scrollEditorToSection(section.id)}
                          className={`group flex w-full items-center gap-2.5 border-l-2 px-2.5 py-2 text-left transition-all duration-200 active:translate-y-px ${
                            isActive
                              ? "border-[#075be8] bg-[#fffdf8] shadow-[inset_4px_0_0_rgba(7,91,232,0.12)]"
                              : "border-transparent hover:border-[#075be8] hover:bg-[#fffaf2] hover:text-[#075be8]"
                          }`}
                        >
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center border text-[10px] font-semibold transition-colors ${
                              isActive
                                ? "border-[#075be8]/45 bg-white text-[#075be8]"
                                : "border-[#d6cec1] bg-[#fbf7ef] text-[#77716a] group-hover:border-[#075be8] group-hover:text-[#075be8]"
                            }`}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </div>
                          <div
                            className={`min-w-0 flex-1 truncate text-[12px] font-semibold ${
                              isActive ? "text-[#075be8]" : "text-[#211f1c]"
                            }`}
                          >
                            {section.title}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="border-b border-[#e2d9cd] px-4 py-4">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8a8175]">
                    <Plus className="h-3 w-3 text-[#8a8175]" />
                    快速添加
                  </div>
                  <div className="mt-3 space-y-1.5">
                    {QUICK_ADD_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => addSection(type)}
                        className="group flex w-full items-center justify-between border border-[#d8d0c3] bg-[#fbf7ef]/65 px-2.5 py-2 text-left text-[12px] font-medium text-[#55514c] transition-all hover:border-[#075be8] hover:bg-white hover:text-[#075be8]"
                      >
                        <span>{SECTION_LABELS[type]}</span>
                        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#ded5c7] bg-[#fffaf2] text-[#8f877b] transition-colors group-hover:border-blue-200 group-hover:bg-white group-hover:text-blue-600">
                          <Plus className="h-3.5 w-3.5" />
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </aside>

          <section className="editor-pane min-h-0 self-stretch overflow-hidden border-r border-[#ded6cb] bg-[#f9f5ee]/84">
            <div ref={editorScrollRef} className="no-scrollbar h-full overflow-y-auto px-5 py-5">
              <ModularEditor />
            </div>
          </section>

          <section className="preview-stage min-h-0 self-stretch overflow-visible bg-[#f6f0e8]/70">
            <div className="flex h-full min-h-0 flex-col gap-0 overflow-visible bg-[radial-gradient(circle_at_50%_8%,rgba(255,255,255,0.82),transparent_36%)] pt-0">
              <PreviewStyleToolbar />
              <ResumePreview ref={componentRef} />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

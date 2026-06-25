import { ResumeSnapshot } from "@/store/useResumeStore";

export function sanitizeFileName(name: string, fallback: string) {
  const normalized = name.trim().replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, "-");
  return normalized || fallback;
}

function downloadFile(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportResumeMarkdown(markdown: string, resumeName?: string) {
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  downloadFile(blob, `${sanitizeFileName(resumeName || "resume", "resume")}.md`);
}

export function exportResumeProject(snapshot: ResumeSnapshot, resumeName?: string) {
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  downloadFile(blob, `${sanitizeFileName(resumeName || "resume-project", "resume-project")}.json`);
}

export async function importResumeProjectFile(file: File) {
  const text = await file.text();
  return JSON.parse(text) as ResumeSnapshot;
}

"use client";

import { useResumeStore } from "@/store/useResumeStore";
import { cn } from "@/lib/utils";
import { EditorToolbar } from "./EditorToolbar";

export function MarkdownEditor() {
    const { markdown, setMarkdown } = useResumeStore();

    return (
        <div className="h-full flex flex-col bg-slate-900 text-slate-100">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <h2 className="font-semibold text-sm uppercase tracking-wider text-slate-400">编辑器</h2>
                <span className="text-xs text-slate-500">支持 Markdown</span>
            </div>
            <EditorToolbar />
            <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                className={cn(
                    "flex-1 w-full h-full p-6 bg-transparent resize-none focus:outline-none font-mono text-sm leading-relaxed",
                    "scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
                )}
                placeholder="# 开始输入你的简历内容..."
                spellCheck={false}
            />
        </div>
    );
}

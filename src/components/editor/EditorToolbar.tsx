"use client";

import { Bold, Italic, List, Link as LinkIcon, Heading1, Heading2, Heading3 } from "lucide-react";
import { useResumeStore } from "@/store/useResumeStore";

export function EditorToolbar() {
    const { setMarkdown } = useResumeStore();

    const insertText = (before: string, after: string = "") => {
        const textarea = document.querySelector("textarea");
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const beforeText = text.substring(0, start);
        const selectedText = text.substring(start, end);
        const afterText = text.substring(end);

        const newText = `${beforeText}${before}${selectedText}${after}${afterText}`;
        setMarkdown(newText);

        // Restore selection
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, end + before.length);
        }, 0);
    };

    return (
        <div className="flex items-center gap-1 p-2 border-b border-slate-800 bg-slate-900 overflow-x-auto">
            <ToolbarButton onClick={() => insertText("**", "**")} icon={<Bold className="w-4 h-4" />} label="Bold" />
            <ToolbarButton onClick={() => insertText("*", "*")} icon={<Italic className="w-4 h-4" />} label="Italic" />
            <div className="w-px h-4 bg-slate-700 mx-1" />
            <ToolbarButton onClick={() => insertText("# ")} icon={<Heading1 className="w-4 h-4" />} label="H1" />
            <ToolbarButton onClick={() => insertText("## ")} icon={<Heading2 className="w-4 h-4" />} label="H2" />
            <ToolbarButton onClick={() => insertText("### ")} icon={<Heading3 className="w-4 h-4" />} label="H3" />
            <div className="w-px h-4 bg-slate-700 mx-1" />
            <ToolbarButton onClick={() => insertText("- ")} icon={<List className="w-4 h-4" />} label="List" />
            <ToolbarButton onClick={() => insertText("[", "](url)")} icon={<LinkIcon className="w-4 h-4" />} label="Link" />
        </div>
    );
}

function ToolbarButton({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
    return (
        <button
            onClick={onClick}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title={label}
        >
            {icon}
        </button>
    );
}

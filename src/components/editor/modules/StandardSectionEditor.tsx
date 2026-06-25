import React from "react";
import ReactMarkdown from "react-markdown";
import { CustomSectionContent } from "@/types/resume";

interface StandardSectionEditorProps {
  content: CustomSectionContent;
  onChange: (content: CustomSectionContent) => void;
  isTemplateContent?: boolean;
}

export function StandardSectionEditor({
  content,
  onChange,
  isTemplateContent = false,
}: StandardSectionEditorProps) {
  const [showSource, setShowSource] = React.useState(false);

  return (
    <div className="space-y-2">
      {isTemplateContent && (
        <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-3 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[12px] font-semibold text-slate-900">模板初始化内容</div>
              <p className="mt-1 text-[10px] leading-4 text-slate-500">
                当前默认展示渲染结果，需要改模板结构时再切到源码模式。
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSource((prev) => !prev)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-700 transition-colors hover:border-blue-200 hover:text-blue-700"
            >
              {showSource ? "隐藏源码" : "查看源码"}
            </button>
          </div>
        </div>
      )}

      {isTemplateContent && (
        <div className="overflow-hidden rounded-[18px] border border-slate-200 bg-white">
          <div className="max-h-[520px] overflow-auto px-4 py-4 markdown-body">
            <ReactMarkdown>{content.markdown}</ReactMarkdown>
          </div>
        </div>
      )}

      {(!isTemplateContent || showSource) && (
        <textarea
          value={content.markdown}
          onChange={(event) =>
            onChange({
              ...content,
              markdown: event.target.value,
            })
          }
          className="min-h-[128px] w-full rounded-[18px] border border-slate-200 bg-white px-3 py-2 font-mono text-[11px] outline-none transition-colors focus:border-blue-500"
          placeholder="这里支持 Markdown，例如标题、列表、加粗和链接。"
        />
      )}

      <p className="text-[10px] leading-4 text-slate-500">
        {isTemplateContent
          ? "模板模块会先渲染预览，只有在你主动展开源码时才编辑 HTML。"
          : "小技巧：项目经历里尽量写“做了什么 + 结果如何”，不要只写职责。"}
      </p>
    </div>
  );
}

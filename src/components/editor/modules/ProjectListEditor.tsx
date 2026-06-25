import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { ProjectItem } from "@/types/resume";

interface ProjectListEditorProps {
  items: ProjectItem[];
  onChange: (items: ProjectItem[]) => void;
}

export function ProjectListEditor({ items, onChange }: ProjectListEditorProps) {
  const addItem = () => {
    onChange([
      {
        id: uuidv4(),
        name: "项目名称",
        role: "角色 / 职责",
        startDate: "2024.01",
        endDate: "2024.06",
        description: "写清楚项目目标、你的职责和最终结果，尽量量化。",
        link: "",
      },
      ...items,
    ]);
  };

  const updateItem = <K extends keyof ProjectItem>(
    id: string,
    field: K,
    value: ProjectItem[K]
  ) => {
    onChange(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-2.5">
      {items.map((item) => (
        <div
          key={item.id}
          className="relative rounded-[18px] border border-slate-200 bg-slate-50 p-2.5"
        >
          <button
            onClick={() => removeItem(item.id)}
            className="absolute right-2.5 top-2.5 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>

          <div className="grid gap-2.5 md:grid-cols-2">
            <label className="block space-y-1 md:col-span-2">
              <span className="text-[10px] font-medium text-slate-500">项目名称</span>
              <input
                type="text"
                value={item.name}
                onChange={(event) => updateItem(item.id, "name", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none transition-colors focus:border-blue-500"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-[10px] font-medium text-slate-500">角色 / 职责</span>
              <input
                type="text"
                value={item.role || ""}
                onChange={(event) => updateItem(item.id, "role", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none transition-colors focus:border-blue-500"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-[10px] font-medium text-slate-500">项目链接</span>
              <input
                type="url"
                value={item.link || ""}
                onChange={(event) => updateItem(item.id, "link", event.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none transition-colors focus:border-blue-500"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-[10px] font-medium text-slate-500">开始时间</span>
              <input
                type="text"
                value={item.startDate || ""}
                onChange={(event) => updateItem(item.id, "startDate", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none transition-colors focus:border-blue-500"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-[10px] font-medium text-slate-500">结束时间</span>
              <input
                type="text"
                value={item.endDate || ""}
                onChange={(event) => updateItem(item.id, "endDate", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none transition-colors focus:border-blue-500"
              />
            </label>

            <label className="block space-y-1 md:col-span-2">
              <span className="text-[10px] font-medium text-slate-500">项目描述</span>
              <textarea
                value={item.description}
                onChange={(event) => updateItem(item.id, "description", event.target.value)}
                className="min-h-[104px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] outline-none transition-colors focus:border-blue-500"
              />
            </label>
          </div>
        </div>
      ))}

      <button
        onClick={addItem}
        className="flex w-full items-center justify-center gap-1.5 rounded-[18px] border-2 border-dashed border-slate-300 px-3 py-2 text-[11px] font-medium text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
      >
        <Plus className="h-3.5 w-3.5" />
        添加项目经历
      </button>
    </div>
  );
}

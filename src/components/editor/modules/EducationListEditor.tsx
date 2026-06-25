import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { EducationItem } from "@/types/resume";

interface EducationListEditorProps {
  items: EducationItem[];
  onChange: (items: EducationItem[]) => void;
}

export function EducationListEditor({
  items,
  onChange,
}: EducationListEditorProps) {
  const addItem = () => {
    onChange([
      {
        id: uuidv4(),
        school: "学校名称",
        degree: "专业 / 学位",
        startDate: "2020.09",
        endDate: "2024.06",
        location: "",
        description: "可以写主修课程、成绩、研究方向或奖项。",
      },
      ...items,
    ]);
  };

  const updateItem = <K extends keyof EducationItem>(
    id: string,
    field: K,
    value: EducationItem[K]
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
            <label className="space-y-1">
              <span className="text-[10px] font-medium text-slate-500">学校</span>
              <input
                type="text"
                value={item.school}
                onChange={(event) => updateItem(item.id, "school", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none transition-colors focus:border-blue-500"
              />
            </label>
            <label className="space-y-1">
              <span className="text-[10px] font-medium text-slate-500">专业 / 学位</span>
              <input
                type="text"
                value={item.degree}
                onChange={(event) => updateItem(item.id, "degree", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none transition-colors focus:border-blue-500"
              />
            </label>
            <label className="space-y-1">
              <span className="text-[10px] font-medium text-slate-500">开始时间</span>
              <input
                type="text"
                value={item.startDate}
                onChange={(event) => updateItem(item.id, "startDate", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none transition-colors focus:border-blue-500"
              />
            </label>
            <label className="space-y-1">
              <span className="text-[10px] font-medium text-slate-500">结束时间</span>
              <input
                type="text"
                value={item.endDate}
                onChange={(event) => updateItem(item.id, "endDate", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none transition-colors focus:border-blue-500"
              />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-[10px] font-medium text-slate-500">地点 / 校区</span>
              <input
                type="text"
                value={item.location || ""}
                onChange={(event) => updateItem(item.id, "location", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none transition-colors focus:border-blue-500"
              />
            </label>
          </div>

          <label className="mt-3.5 block space-y-1.5">
            <span className="text-xs font-medium text-slate-500">补充说明</span>
            <textarea
              value={item.description}
              onChange={(event) => updateItem(item.id, "description", event.target.value)}
              className="min-h-[92px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] outline-none transition-colors focus:border-blue-500"
            />
          </label>
        </div>
      ))}

      <button
        onClick={addItem}
        className="flex w-full items-center justify-center gap-2 rounded-[22px] border-2 border-dashed border-slate-300 px-4 py-2.5 text-[13px] font-medium text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
      >
        <Plus className="h-4 w-4" />
        添加教育经历
      </button>
    </div>
  );
}

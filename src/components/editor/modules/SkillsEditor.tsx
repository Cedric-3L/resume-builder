import React from "react";
import { Plus, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { SkillItem } from "@/types/resume";

interface SkillsEditorProps {
  items: SkillItem[];
  onChange: (items: SkillItem[]) => void;
  sectionTitle?: string;
}

const LEVELS: SkillItem["level"][] = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
];

function isSimpleListTitle(title: string | undefined) {
  if (!title) {
    return false;
  }

  return /自我评价|奖项荣誉|技能证书|职业技能|技能\/优势|技能&爱好|技能 & 爱好/.test(title);
}

export function SkillsEditor({ items, onChange, sectionTitle }: SkillsEditorProps) {
  const simpleListMode = isSimpleListTitle(sectionTitle);

  const addItem = () => {
    onChange([
      ...items,
      {
        id: uuidv4(),
        name: simpleListMode ? "新增一条内容" : "新技能",
        level: "Beginner",
      },
    ]);
  };

  const updateItem = <K extends keyof SkillItem>(
    id: string,
    field: K,
    value: SkillItem[K]
  ) => {
    onChange(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={`grid gap-2 rounded-[16px] border border-slate-200 bg-slate-50 p-2 ${
            simpleListMode ? "md:grid-cols-[1fr_auto]" : "md:grid-cols-[1fr_132px_auto]"
          }`}
        >
          <input
            type="text"
            value={item.name}
            onChange={(event) => updateItem(item.id, "name", event.target.value)}
            placeholder={simpleListMode ? "输入一条内容" : "例如：React / SQL / 用户研究"}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none transition-colors focus:border-blue-500"
          />
          {!simpleListMode && (
            <select
              value={item.level}
              onChange={(event) =>
                updateItem(item.id, "level", event.target.value as SkillItem["level"])
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none transition-colors focus:border-blue-500"
            >
              {LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() => removeItem(item.id)}
            className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}

      <button
        onClick={addItem}
        className="flex w-full items-center justify-center gap-1.5 rounded-[18px] border-2 border-dashed border-slate-300 px-3 py-2 text-[11px] font-medium text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
      >
        <Plus className="h-3.5 w-3.5" />
        {simpleListMode ? "添加一条内容" : "添加技能"}
      </button>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown, Sparkles, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FONT_OPTIONS,
  HEADER_LAYOUT_OPTIONS,
  INFO_DISPLAY_OPTIONS,
  RESUME_COLOR_SWATCHES,
  supportsHeaderControls,
} from "@/lib/resume-style-options";
import { useResumeStore } from "@/store/useResumeStore";
import type { PersonalInfo, ResumeSection } from "@/types/resume";

type OpenPanel =
  | "basicLayout"
  | "font"
  | "fontSize"
  | "lineHeight"
  | "headingColor"
  | "spacing"
  | "aiAudit"
  | null;

type RgbaColor = {
  r: number;
  g: number;
  b: number;
  a: number;
};

type HsvaColor = {
  h: number;
  s: number;
  v: number;
  a: number;
};

const FONT_SIZE_OPTIONS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
const LINE_HEIGHT_OPTIONS = [1.15, 1.25, 1.35, 1.45, 1.55, 1.65, 1.75, 1.85, 1.95, 2.05, 2.15, 2.25];
const HEADING_COLOR_SWATCHES = [
  "#0f172a",
  "#2563eb",
  "#8b5cf6",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#64748b",
  "#94a3b8",
  "#c2410c",
  "#e11d48",
  "#111827",
  ...RESUME_COLOR_SWATCHES,
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatLineHeight(value: number) {
  return `${value.toFixed(2)}x`;
}

function componentToHex(value: number) {
  return Math.round(clamp(value, 0, 255)).toString(16).padStart(2, "0").toUpperCase();
}

function rgbaToHex(color: RgbaColor) {
  return `#${componentToHex(color.r)}${componentToHex(color.g)}${componentToHex(color.b)}`;
}

function rgbaToCss(color: RgbaColor) {
  if (color.a >= 0.999) {
    return rgbaToHex(color);
  }

  return `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, ${Number(color.a.toFixed(2))})`;
}

function parseColor(value: string): RgbaColor {
  const normalized = value.trim();

  if (/^#([0-9a-f]{3})$/i.test(normalized)) {
    const [, raw] = normalized.match(/^#([0-9a-f]{3})$/i) ?? [];
    return {
      r: Number.parseInt(`${raw[0]}${raw[0]}`, 16),
      g: Number.parseInt(`${raw[1]}${raw[1]}`, 16),
      b: Number.parseInt(`${raw[2]}${raw[2]}`, 16),
      a: 1,
    };
  }

  if (/^#([0-9a-f]{6})$/i.test(normalized)) {
    const [, raw] = normalized.match(/^#([0-9a-f]{6})$/i) ?? [];
    return {
      r: Number.parseInt(raw.slice(0, 2), 16),
      g: Number.parseInt(raw.slice(2, 4), 16),
      b: Number.parseInt(raw.slice(4, 6), 16),
      a: 1,
    };
  }

  if (/^rgba?\(/i.test(normalized)) {
    const parts = normalized
      .replace(/^rgba?\(/i, "")
      .replace(/\)$/, "")
      .split(",")
      .map((part) => part.trim());

    const [r, g, b, a = "1"] = parts;
    return {
      r: clamp(Number(r) || 0, 0, 255),
      g: clamp(Number(g) || 0, 0, 255),
      b: clamp(Number(b) || 0, 0, 255),
      a: clamp(Number(a) || 0, 0, 1),
    };
  }

  return { r: 37, g: 99, b: 235, a: 1 };
}

function rgbaToHsva(color: RgbaColor): HsvaColor {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let hue = 0;

  if (delta !== 0) {
    if (max === r) {
      hue = 60 * (((g - b) / delta) % 6);
    } else if (max === g) {
      hue = 60 * ((b - r) / delta + 2);
    } else {
      hue = 60 * ((r - g) / delta + 4);
    }
  }

  return {
    h: hue < 0 ? hue + 360 : hue,
    s: max === 0 ? 0 : (delta / max) * 100,
    v: max * 100,
    a: color.a,
  };
}

function hsvaToRgba(color: HsvaColor): RgbaColor {
  const h = ((color.h % 360) + 360) % 360;
  const s = clamp(color.s, 0, 100) / 100;
  const v = clamp(color.v, 0, 100) / 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (h < 60) {
    rPrime = c;
    gPrime = x;
  } else if (h < 120) {
    rPrime = x;
    gPrime = c;
  } else if (h < 180) {
    gPrime = c;
    bPrime = x;
  } else if (h < 240) {
    gPrime = x;
    bPrime = c;
  } else if (h < 300) {
    rPrime = x;
    bPrime = c;
  } else {
    rPrime = c;
    bPrime = x;
  }

  return {
    r: Math.round((rPrime + m) * 255),
    g: Math.round((gPrime + m) * 255),
    b: Math.round((bPrime + m) * 255),
    a: clamp(color.a, 0, 1),
  };
}

function ToolbarButton({
  active,
  label,
  value,
  tooltipLabel,
  disabled,
  disabledReason,
  onClick,
  children,
}: {
  active?: boolean;
  label?: string;
  value?: string;
  tooltipLabel?: string;
  disabled?: boolean;
  disabledReason?: string;
  onClick: () => void;
  children?: ReactNode;
}) {
  const helperText = disabled ? disabledReason : tooltipLabel;

  return (
    <div className="group relative z-[70]">
      {helperText && (!active || disabled) ? (
        <div className="pointer-events-none absolute top-[calc(100%+10px)] left-1/2 z-[80] -translate-x-1/2 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <div className="relative min-w-[44px] whitespace-nowrap rounded-md bg-slate-800 px-2.5 py-1.5 text-center text-[11px] font-semibold leading-none text-white shadow-lg">
            {helperText}
            <span className="absolute bottom-full left-1/2 h-3 w-3 -translate-x-1/2 translate-y-1/2 rotate-45 bg-slate-800" />
          </div>
        </div>
      ) : null}

      <button
        type="button"
        aria-label={tooltipLabel ?? label ?? value}
        disabled={disabled}
        onClick={onClick}
        className={cn(
          "inline-flex h-7 shrink-0 items-center gap-0.5 rounded-[10px] border px-2 text-[10px] font-semibold transition-all duration-200 active:translate-y-px",
          disabled
            ? "cursor-not-allowed border-[#e4dcd1] bg-[#f8f3ec] text-[#aaa196]"
            : active
              ? "border-[#075be8]/35 bg-[#fffdf8] text-blue-600 shadow-[0_4px_16px_rgba(7,91,232,0.08),0_0_0_1px_rgba(37,99,235,0.12)]"
              : "border-[#e0d8cc] bg-[#fffdf8]/92 text-[#5f584e] hover:border-[#c9bdad] hover:bg-white hover:text-[#171716]"
        )}
      >
        {label ? <span>{label}</span> : null}
        {children ?? (value ? <span className={cn("text-slate-900", disabled && "text-slate-400")}>{value}</span> : null)}
        <ChevronDown className={cn("h-2.5 w-2.5 text-slate-400", active && !disabled && "text-blue-500")} />
      </button>
    </div>
  );
}

function SmartActionButton({
  active,
  label,
  subLabel,
  icon,
  onClick,
}: {
  active?: boolean;
  label: string;
  subLabel?: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1 rounded-[14px] border px-2 text-[11px] font-semibold transition-all duration-200 active:translate-y-px",
        active
          ? "border-[#9cc1ff] bg-[#eef5ff] text-blue-600 shadow-[0_8px_18px_rgba(37,99,235,0.10),0_0_0_1px_rgba(37,99,235,0.10)]"
          : "border-[#e0d8cc] bg-[#fffdf8]/92 text-[#2d2923] hover:border-[#c9bdad] hover:bg-white hover:text-blue-600"
      )}
    >
      <span className={cn("text-blue-600", active && "text-blue-700")}>{icon}</span>
      <span>{label}</span>
      {subLabel ? (
        <>
          <span className="h-3 w-px bg-[#d8cfc3]" />
          <span className="text-[11px] font-bold text-orange-500">{subLabel}</span>
        </>
      ) : null}
      <ChevronDown className={cn("h-2.5 w-2.5 text-[#9a9186]", active && "text-blue-500")} />
    </button>
  );
}

function DropdownCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute top-[calc(100%+6px)] z-[220] rounded-[14px] border border-[#ded6cb] bg-[#fffdf8] shadow-[0_18px_34px_rgba(70,58,42,0.12)]",
        className
      )}
    >
      <div className="absolute -top-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-l border-t border-[#ded6cb] bg-[#fffdf8]" />
      <div className="relative rounded-[14px] bg-[#fffdf8]">{children}</div>
    </div>
  );
}

type AuditIssue = {
  title: string;
  description: string;
  level: "good" | "warn" | "danger";
};

function getPersonalSection(sections: ResumeSection[]) {
  return sections.find((section) => section.type === "personal" && section.isVisible !== false)
    ?.content as PersonalInfo | undefined;
}

function textLength(value?: string | null) {
  return value?.trim().length ?? 0;
}

function hasNumberEvidence(value?: string | null) {
  return /[\d%￥¥+]/.test(value ?? "");
}

function collectLongDescriptions(sections: ResumeSection[]) {
  return sections.flatMap((section) => {
    if (!Array.isArray(section.content)) {
      return [];
    }

    return section.content
      .map((item) => {
        if (typeof item !== "object" || item === null || !("description" in item)) {
          return "";
        }

        const description = item.description;
        return typeof description === "string" ? description.trim() : "";
      })
      .filter(Boolean);
  });
}

function buildAuditIssues(sections: ResumeSection[], markdown: string): {
  score: number;
  issues: AuditIssue[];
  pageHint: string;
} {
  const issues: AuditIssue[] = [];
  const personal = getPersonalSection(sections);
  const visibleSections = sections.filter((section) => section.isVisible !== false);
  const descriptions = collectLongDescriptions(visibleSections);
  const estimatedPages = Math.max(1, Math.ceil(markdown.length / 2700));

  if (!personal?.phone?.trim() || !personal?.email?.trim()) {
    issues.push({
      title: "联系方式不完整",
      description: "建议至少保留手机号和邮箱，方便 HR 直接联系。",
      level: "danger",
    });
  }

  if (textLength(personal?.summary) > 0 && textLength(personal?.summary) < 40) {
    issues.push({
      title: "个人简介略短",
      description: "可以补充目标岗位、核心能力和代表成果，让开头更有说服力。",
      level: "warn",
    });
  }

  if (!visibleSections.some((section) => section.type === "experience" && Array.isArray(section.content) && section.content.length > 0)) {
    issues.push({
      title: "工作/实习经历偏少",
      description: "如果有项目、实习或校园经历，建议补充一段与目标岗位相关的经历。",
      level: "warn",
    });
  }

  if (!visibleSections.some((section) => section.type === "skills" && Array.isArray(section.content) && section.content.length > 0)) {
    issues.push({
      title: "技能模块还可以更明确",
      description: "把技能拆成工具、语言、业务能力，会比一串关键词更容易扫读。",
      level: "warn",
    });
  }

  const measurableDescriptions = descriptions.filter(hasNumberEvidence).length;
  if (descriptions.length > 0 && measurableDescriptions / descriptions.length < 0.35) {
    issues.push({
      title: "成果量化不足",
      description: "经历描述里可以增加数据、比例、规模或排名，例如“提升 27%”“覆盖 3 个场景”。",
      level: "warn",
    });
  }

  if (estimatedPages > 1) {
    issues.push({
      title: "当前内容可能超过一页",
      description: "可以点击「智能一页」先做紧凑排版，再决定是否删减内容。",
      level: "warn",
    });
  }

  if (!issues.length) {
    issues.push({
      title: "整体结构不错",
      description: "关键信息完整，接下来可以重点优化表达的准确度和岗位匹配度。",
      level: "good",
    });
  }

  const score = clamp(96 - issues.filter((issue) => issue.level !== "good").length * 9, 58, 96);
  return {
    score,
    issues: issues.slice(0, 5),
    pageHint: estimatedPages > 1 ? `约 ${estimatedPages} 页` : "约 1 页",
  };
}

function SimpleListOption({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between px-2.5 py-1.5 text-left text-[11px] transition-colors",
        active ? "bg-blue-50 text-blue-600" : "text-slate-800 hover:bg-slate-50"
      )}
    >
      <span>{label}</span>
      {active ? <Check className="h-3 w-3" /> : null}
    </button>
  );
}

function PillOption({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition-colors",
        active
          ? "border-blue-500 bg-blue-600 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
      )}
    >
      {label}
    </button>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-2">
      <div className="flex items-center justify-between text-[10px] font-medium text-slate-700">
        <span>{label}</span>
        <span className="text-slate-500">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-blue-600"
      />
    </label>
  );
}

export function PreviewStyleToolbar() {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const colorAreaRef = useRef<HTMLDivElement>(null);
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const { settings, template, sections, markdown, updateSettings } = useResumeStore();
  const canControlHeader = supportsHeaderControls(template);
  const [headingHsva, setHeadingHsva] = useState<HsvaColor>(() =>
    rgbaToHsva(parseColor(settings.headingColor))
  );
  const headingHsvaRef = useRef(headingHsva);
  const audit = useMemo(() => buildAuditIssues(sections, markdown), [sections, markdown]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setOpenPanel(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fontLabel = useMemo(
    () => FONT_OPTIONS.find((option) => option.value === settings.fontFamily)?.shortLabel ?? "系统",
    [settings.fontFamily]
  );

  const storedHeadingRgba = useMemo(() => parseColor(settings.headingColor), [settings.headingColor]);
  const storedHeadingHex = useMemo(() => rgbaToHex(storedHeadingRgba), [storedHeadingRgba]);
  const headingRgba = useMemo(() => hsvaToRgba(headingHsva), [headingHsva]);
  const headingHex = useMemo(() => rgbaToHex(headingRgba), [headingRgba]);
  const previewHeadingColor = useMemo(() => rgbaToCss(storedHeadingRgba), [storedHeadingRgba]);

  const applyHeadingColor = (next: HsvaColor) => {
    const normalized = {
      h: clamp(next.h, 0, 360),
      s: clamp(next.s, 0, 100),
      v: clamp(next.v, 0, 100),
      a: clamp(next.a, 0, 1),
    };

    headingHsvaRef.current = normalized;
    setHeadingHsva(normalized);
    updateSettings({ headingColor: rgbaToCss(hsvaToRgba(normalized)) });
  };

  const applySmartOnePage = () => {
    setOpenPanel(null);
    updateSettings({
      fontSize: Math.max(11, settings.fontSize > 13 ? settings.fontSize - 1 : settings.fontSize),
      lineHeight: Math.max(1.45, Number((settings.lineHeight - 0.1).toFixed(2))),
      pageTopMargin: Math.max(10, settings.pageTopMargin - 4),
      pageLeftMargin: Math.max(12, settings.pageLeftMargin - 3),
      pageRightMargin: Math.max(12, settings.pageRightMargin - 3),
      sectionSpacing: Math.max(12, settings.sectionSpacing - 8),
      headingTopSpacing: Math.max(10, settings.headingTopSpacing - 8),
      headingBottomSpacing: Math.max(6, settings.headingBottomSpacing - 4),
    });
  };

  const updateFromColorArea = (clientX: number, clientY: number) => {
    const rect = colorAreaRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const x = clamp((clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((clientY - rect.top) / rect.height, 0, 1);
    applyHeadingColor({
      ...headingHsvaRef.current,
      s: x * 100,
      v: (1 - y) * 100,
    });
  };

  const handleColorAreaPointerDown = (event: React.MouseEvent<HTMLDivElement>) => {
    updateFromColorArea(event.clientX, event.clientY);

    const handleMove = (moveEvent: MouseEvent) => {
      updateFromColorArea(moveEvent.clientX, moveEvent.clientY);
    };

    const handleUp = () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
  };

  return (
    <div ref={toolbarRef} className="relative z-[60]">
      <div className="pb-0.5">
        <div className="flex w-full flex-nowrap items-center justify-between gap-3 overflow-visible whitespace-nowrap border-b border-[#ded6cb] bg-[#fbf8f2]/94 px-4 py-1.5 shadow-[0_10px_26px_rgba(77,63,44,0.04)]">
          <div className="flex shrink-0 items-center gap-3">
            <SmartActionButton
              active
              label="智能一页"
              icon={<Wand2 className="h-3 w-3" />}
              onClick={applySmartOnePage}
            />
            <div className="relative">
              <SmartActionButton
                active={openPanel === "aiAudit"}
                label="AI体检"
                subLabel={`${audit.score}分`}
                icon={<Sparkles className="h-3 w-3" />}
                onClick={() => setOpenPanel((prev) => (prev === "aiAudit" ? null : "aiAudit"))}
              />
              {openPanel === "aiAudit" ? (
                <DropdownCard className="left-0 w-[330px]">
                  <div className="space-y-3 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[12px] font-semibold text-[#1f1b16]">AI优化体检</div>
                        <div className="mt-1 text-[10px] text-[#8b8175]">
                          本地规则先行，后续可接入真实 AI 改写建议
                        </div>
                      </div>
                      <div className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[12px] font-bold text-blue-600">
                        {audit.score}分
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-[#eadfce] bg-[#fffaf2] px-3 py-2">
                        <div className="text-[10px] text-[#8b8175]">页数预估</div>
                        <div className="mt-1 text-[13px] font-semibold text-[#24201b]">{audit.pageHint}</div>
                      </div>
                      <div className="rounded-xl border border-[#eadfce] bg-[#fffaf2] px-3 py-2">
                        <div className="text-[10px] text-[#8b8175]">优化项</div>
                        <div className="mt-1 text-[13px] font-semibold text-[#24201b]">
                          {audit.issues.filter((issue) => issue.level !== "good").length} 项
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {audit.issues.map((issue) => (
                        <div key={issue.title} className="rounded-xl border border-[#eadfce] bg-white/70 px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                issue.level === "good"
                                  ? "bg-emerald-500"
                                  : issue.level === "danger"
                                    ? "bg-orange-500"
                                    : "bg-amber-400"
                              )}
                            />
                            <span className="text-[11px] font-semibold text-[#28231d]">{issue.title}</span>
                          </div>
                          <div className="mt-1 pl-3.5 text-[10px] leading-5 text-[#7d7468]">
                            {issue.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </DropdownCard>
              ) : null}
            </div>
          </div>

          <div className="relative shrink-0">
            <ToolbarButton
              active={canControlHeader && openPanel === "basicLayout"}
              label="基础布局"
              disabled={!canControlHeader}
              disabledReason="该模板使用固定版式"
              onClick={() =>
                setOpenPanel((prev) => (prev === "basicLayout" ? null : "basicLayout"))
              }
            />
            {canControlHeader && openPanel === "basicLayout" ? (
              <DropdownCard className="left-0 w-[350px]">
                <div className="space-y-3 p-3">
                  <div>
                    <div className="mb-3 text-[12px] font-semibold text-slate-900">布局调整：</div>
                    <div className="flex flex-wrap gap-2">
                      {HEADER_LAYOUT_OPTIONS.map((option) => (
                        <PillOption
                          key={option.value}
                          active={settings.headerLayout === option.value}
                          label={option.label}
                          onClick={() => updateSettings({ headerLayout: option.value })}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-3 text-[12px] font-semibold text-slate-900">信息展示：</div>
                    <div className="flex flex-wrap gap-2">
                      {INFO_DISPLAY_OPTIONS.map((option) => (
                        <PillOption
                          key={option.value}
                          active={settings.personalInfoDisplay === option.value}
                          label={option.label}
                          onClick={() => updateSettings({ personalInfoDisplay: option.value })}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </DropdownCard>
            ) : null}
          </div>

          <div className="relative shrink-0">
            <ToolbarButton
              active={openPanel === "font"}
              value={fontLabel}
              tooltipLabel="字体"
              onClick={() => setOpenPanel((prev) => (prev === "font" ? null : "font"))}
            />
            {openPanel === "font" ? (
              <DropdownCard className="left-0 w-[156px]">
                <div className="py-1">
                  {FONT_OPTIONS.map((option) => (
                    <SimpleListOption
                      key={option.value}
                      active={settings.fontFamily === option.value}
                      label={option.label}
                      onClick={() => {
                        updateSettings({ fontFamily: option.value });
                        setOpenPanel(null);
                      }}
                    />
                  ))}
                </div>
              </DropdownCard>
            ) : null}
          </div>

          <div className="relative shrink-0">
            <ToolbarButton
              active={openPanel === "fontSize"}
              value={String(settings.fontSize)}
              tooltipLabel="字号"
              onClick={() => setOpenPanel((prev) => (prev === "fontSize" ? null : "fontSize"))}
            />
            {openPanel === "fontSize" ? (
              <DropdownCard className="left-0 w-[74px]">
                <div className="max-h-[220px] overflow-y-auto py-1">
                  {FONT_SIZE_OPTIONS.map((size) => (
                    <SimpleListOption
                      key={size}
                      active={settings.fontSize === size}
                      label={String(size)}
                      onClick={() => {
                        updateSettings({ fontSize: size });
                        setOpenPanel(null);
                      }}
                    />
                  ))}
                </div>
              </DropdownCard>
            ) : null}
          </div>

          <div className="relative shrink-0">
            <ToolbarButton
              active={openPanel === "lineHeight"}
              value={formatLineHeight(settings.lineHeight)}
              tooltipLabel="行距"
              onClick={() =>
                setOpenPanel((prev) => (prev === "lineHeight" ? null : "lineHeight"))
              }
            />
            {openPanel === "lineHeight" ? (
              <DropdownCard className="left-0 w-[82px]">
                <div className="max-h-[220px] overflow-y-auto py-1">
                  {LINE_HEIGHT_OPTIONS.map((value) => (
                    <SimpleListOption
                      key={value}
                      active={settings.lineHeight === value}
                      label={formatLineHeight(value)}
                      onClick={() => {
                        updateSettings({ lineHeight: value });
                        setOpenPanel(null);
                      }}
                    />
                  ))}
                </div>
              </DropdownCard>
            ) : null}
          </div>

          <div className="relative shrink-0">
            <ToolbarButton
              active={openPanel === "headingColor"}
              label="标题色"
              onClick={() =>
                setOpenPanel((prev) => {
                  if (prev === "headingColor") {
                    return null;
                  }

                  const next = rgbaToHsva(parseColor(settings.headingColor));
                  headingHsvaRef.current = next;
                  setHeadingHsva(next);
                  return "headingColor";
                })
              }
            >
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-[5px] border border-slate-200" style={{ backgroundColor: previewHeadingColor }} />
              </span>
            </ToolbarButton>
            {openPanel === "headingColor" ? (
              <DropdownCard className="right-0 w-[216px]">
                <div className="space-y-2 p-2">
                  <div className="grid grid-cols-6 gap-1">
                    {HEADING_COLOR_SWATCHES.map((color) => (
                      <button
                        key={color}
                        type="button"
                        aria-label={`选择 ${color}`}
                        onClick={() => applyHeadingColor(rgbaToHsva(parseColor(color)))}
                        className={cn(
                          "h-4.5 w-4.5 rounded-md border transition-transform hover:scale-105",
                          rgbaToHex(parseColor(color)) === storedHeadingHex
                            ? "border-slate-900 ring-2 ring-blue-200"
                            : "border-slate-200"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  <div
                    ref={colorAreaRef}
                    onMouseDown={handleColorAreaPointerDown}
                    className="relative h-[110px] cursor-crosshair overflow-hidden rounded-lg"
                    style={{
                      backgroundImage: `linear-gradient(to top, #000 0%, transparent 100%), linear-gradient(to right, #fff 0%, hsl(${headingHsva.h} 100% 50%) 100%)`,
                    }}
                  >
                    <span
                      className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(15,23,42,0.2)]"
                      style={{
                        left: `${headingHsva.s}%`,
                        top: `${100 - headingHsva.v}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <div className="grid flex-1 gap-1">
                      <div className="grid gap-1">
                        <div className="flex items-center justify-between text-[8px] font-medium text-slate-500">
                          <span>色相</span>
                          <span>{Math.round(headingHsva.h)}°</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={360}
                          step={1}
                          value={headingHsva.h}
                          onChange={(event) =>
                            applyHeadingColor({
                              ...headingHsvaRef.current,
                              h: Number(event.target.value),
                            })
                          }
                          className="h-2 w-full cursor-pointer appearance-none rounded-full border border-slate-200"
                          style={{
                            background:
                              "linear-gradient(90deg,#ff0000 0%,#ffff00 17%,#00ff00 33%,#00ffff 50%,#0000ff 67%,#ff00ff 83%,#ff0000 100%)",
                          }}
                        />
                      </div>

                      <div className="grid gap-1">
                        <div className="flex items-center justify-between text-[8px] font-medium text-slate-500">
                          <span>透明度</span>
                          <span>{Math.round(headingHsva.a * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={1}
                          value={Math.round(headingHsva.a * 100)}
                          onChange={(event) =>
                            applyHeadingColor({
                              ...headingHsvaRef.current,
                              a: Number(event.target.value) / 100,
                            })
                          }
                          className="h-2 w-full cursor-pointer appearance-none rounded-full border border-slate-200"
                          style={{
                            background: `linear-gradient(90deg, rgba(${headingRgba.r}, ${headingRgba.g}, ${headingRgba.b}, 0) 0%, rgba(${headingRgba.r}, ${headingRgba.g}, ${headingRgba.b}, 1) 100%)`,
                          }}
                        />
                      </div>
                    </div>

                    <div
                      className="h-7 w-7 shrink-0 rounded-lg border border-slate-200 shadow-inner"
                      style={{ backgroundColor: previewHeadingColor }}
                    />
                  </div>

                  <div className="grid grid-cols-5 gap-1 text-center">
                    <div className="rounded-md border border-slate-200 px-1 py-0.5">
                      <div className="text-[9px] font-semibold text-slate-900">{headingHex}</div>
                      <div className="mt-0.5 text-[8px] text-slate-500">Hex</div>
                    </div>
                    <div className="rounded-md border border-slate-200 px-1 py-0.5">
                      <div className="text-[9px] font-semibold text-slate-900">{headingRgba.r}</div>
                      <div className="mt-0.5 text-[8px] text-slate-500">R</div>
                    </div>
                    <div className="rounded-md border border-slate-200 px-1 py-0.5">
                      <div className="text-[9px] font-semibold text-slate-900">{headingRgba.g}</div>
                      <div className="mt-0.5 text-[8px] text-slate-500">G</div>
                    </div>
                    <div className="rounded-md border border-slate-200 px-1 py-0.5">
                      <div className="text-[9px] font-semibold text-slate-900">{headingRgba.b}</div>
                      <div className="mt-0.5 text-[8px] text-slate-500">B</div>
                    </div>
                    <div className="rounded-md border border-slate-200 px-1 py-0.5">
                      <div className="text-[9px] font-semibold text-slate-900">
                        {Math.round(headingHsva.a * 100)}
                      </div>
                      <div className="mt-0.5 text-[8px] text-slate-500">A</div>
                    </div>
                  </div>
                </div>
              </DropdownCard>
            ) : null}
          </div>

          <div className="relative shrink-0">
            <ToolbarButton
              active={openPanel === "spacing"}
              label="间距配置"
              onClick={() => setOpenPanel((prev) => (prev === "spacing" ? null : "spacing"))}
            />
            {openPanel === "spacing" ? (
              <DropdownCard className="right-0 w-[320px]">
                <div className="grid gap-2.5 p-2.5">
                  <SliderField
                    label="页面上边距"
                    value={settings.pageTopMargin}
                    min={4}
                    max={40}
                    step={1}
                    suffix="mm"
                    onChange={(value) => updateSettings({ pageTopMargin: value, margins: value })}
                  />
                  <SliderField
                    label="页面左边距"
                    value={settings.pageLeftMargin}
                    min={6}
                    max={42}
                    step={1}
                    suffix="mm"
                    onChange={(value) => updateSettings({ pageLeftMargin: value })}
                  />
                  <SliderField
                    label="页面右边距"
                    value={settings.pageRightMargin}
                    min={6}
                    max={42}
                    step={1}
                    suffix="mm"
                    onChange={(value) => updateSettings({ pageRightMargin: value })}
                  />
                  <SliderField
                    label="模块上边距"
                    value={settings.sectionSpacing}
                    min={4}
                    max={64}
                    step={1}
                    suffix="px"
                    onChange={(value) => updateSettings({ sectionSpacing: value })}
                  />
                  <SliderField
                    label="标题上边距"
                    value={settings.headingTopSpacing}
                    min={4}
                    max={56}
                    step={1}
                    suffix="px"
                    onChange={(value) => updateSettings({ headingTopSpacing: value })}
                  />
                  <SliderField
                    label="标题下边距"
                    value={settings.headingBottomSpacing}
                    min={2}
                    max={40}
                    step={1}
                    suffix="px"
                    onChange={(value) => updateSettings({ headingBottomSpacing: value })}
                  />
                </div>
              </DropdownCard>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

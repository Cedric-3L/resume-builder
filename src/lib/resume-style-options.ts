import type { TemplateKey } from "@/store/demoData";
import type { PersonalInfoDisplayMode, ResumeHeaderLayout } from "@/store/useResumeStore";

export const RESUME_COLOR_SWATCHES = [
  "#2563eb",
  "#0f766e",
  "#7c3aed",
  "#dc2626",
  "#ea580c",
  "#0f172a",
  "#be123c",
  "#059669",
] as const;

export const FONT_OPTIONS = [
  {
    label: "系统无衬线",
    shortLabel: "系统",
    value: '"PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif',
  },
  {
    label: "极简细黑",
    shortLabel: "细黑",
    value: '"DengXian", "PingFang SC Light", "Segoe UI Light", "Helvetica Neue Light", sans-serif',
  },
  {
    label: "苹方清爽",
    shortLabel: "苹方",
    value: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif',
  },
  {
    label: "微软雅黑",
    shortLabel: "雅黑",
    value: '"Microsoft YaHei", "PingFang SC", "Helvetica Neue", Arial, sans-serif',
  },
  {
    label: "思源黑体",
    shortLabel: "思源",
    value: '"Noto Sans SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
  },
  {
    label: "Inter 现代",
    shortLabel: "Inter",
    value: '"Inter", "Aptos", "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
  },
  {
    label: "Roboto 简洁",
    shortLabel: "Roboto",
    value: '"Roboto", "Aptos", "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
  },
  {
    label: "黑体醒目",
    shortLabel: "黑体",
    value: '"STHeiti", "SimHei", "Heiti SC", "PingFang SC", sans-serif',
  },
  {
    label: "现代英文",
    shortLabel: "Aptos",
    value: '"Aptos", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
  },
  {
    label: "优雅衬线",
    shortLabel: "衬线",
    value: '"Noto Serif SC", "Songti SC", "Times New Roman", serif',
  },
  {
    label: "Georgia 英文",
    shortLabel: "Georgia",
    value: '"Georgia", "Times New Roman", "Noto Serif SC", "Songti SC", serif',
  },
  {
    label: "仿宋文雅",
    shortLabel: "仿宋",
    value: '"FangSong", "仿宋", "STFangsong", "Noto Serif SC", serif',
  },
  {
    label: "宋体正式",
    shortLabel: "宋体",
    value: '"STSong", "SimSun", "宋体", "Noto Serif SC", "Songti SC", serif',
  },
  {
    label: "楷体传统",
    shortLabel: "楷体",
    value: '"STKaiti", "KaiTi", "楷体", "Noto Serif SC", serif',
  },
  {
    label: "DIN 科技",
    shortLabel: "DIN",
    value: '"DIN Alternate", "DIN", "Helvetica Neue", "Segoe UI", Arial, sans-serif',
  },
  {
    label: "技术等宽",
    shortLabel: "Mono",
    value: '"JetBrains Mono", "Consolas", "Courier New", monospace',
  },
] as const;

export const HEADER_LAYOUT_OPTIONS: Array<{
  label: string;
  value: ResumeHeaderLayout;
}> = [
  { label: "居左", value: "left" },
  { label: "居中", value: "center" },
  { label: "居右", value: "right" },
  { label: "平铺", value: "spread" },
];

export const INFO_DISPLAY_OPTIONS: Array<{
  label: string;
  value: PersonalInfoDisplayMode;
}> = [
  { label: "文字", value: "text" },
  { label: "图标", value: "icon" },
  { label: "纯内容", value: "plain" },
];

export const HEADER_LAYOUT_LABELS: Record<ResumeHeaderLayout, string> = {
  left: "居左",
  center: "居中",
  right: "居右",
  spread: "平铺",
};

export const HEADER_CONTROLLED_TEMPLATE_KEYS = [
  "bilingualResearchBlue",
  "overseasBusinessAnalyst",
  "productManagerBlue",
  "hrRecruitmentTable",
  "campusOperationsDense",
] as const satisfies readonly TemplateKey[];

export function supportsHeaderControls(template: TemplateKey) {
  return HEADER_CONTROLLED_TEMPLATE_KEYS.includes(
    template as (typeof HEADER_CONTROLLED_TEMPLATE_KEYS)[number]
  );
}

export const INFO_DISPLAY_LABELS: Record<PersonalInfoDisplayMode, string> = {
  text: "文字",
  icon: "图标",
  plain: "纯内容",
};

import { ResumeSection } from "@/types/resume";

export const SECTION_LABELS: Record<ResumeSection["type"], string> = {
  personal: "基本信息",
  experience: "工作经历",
  education: "教育经历",
  skills: "专业技能",
  projects: "项目经历",
  custom: "自定义模块",
  "custom-links": "链接信息",
  gallery: "作品与证书",
};

export const QUICK_ADD_TYPES: ResumeSection["type"][] = [
  "experience",
  "education",
  "projects",
  "skills",
  "custom-links",
  "gallery",
  "custom",
];

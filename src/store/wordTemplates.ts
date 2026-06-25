import type { ResumeTemplateMeta } from "./demoData";
import {
  CustomSectionContent,
  EducationItem,
  ExperienceItem,
  GalleryItem,
  LinkItem,
  PersonalExtraField,
  PersonalInfo,
  ProjectItem,
  ResumeSection,
  SkillItem,
} from "@/types/resume";

type WordRenderSettings = {
  headingColor?: string;
  fontSize?: number;
  lineHeight?: number;
  fontFamily?: string;
  headerLayout?: "left" | "center" | "right" | "spread";
  sectionSpacing?: number;
  headingTopSpacing?: number;
  headingBottomSpacing?: number;
  personalInfoDisplay?: "text" | "icon" | "plain";
};

let currentWordRenderSettings: WordRenderSettings = {};
let currentWordPersonalExtraFields: PersonalExtraField[] = [];

type WordHeaderInfoItem = {
  label: string;
  value: string;
  icon: string;
  badge?: boolean;
  href?: string;
  iconSrc?: string;
};

function resolveWordAccent(accent: string) {
  return currentWordRenderSettings.headingColor || accent;
}

function resolveBodyFontSize(fallback = 12.5) {
  return currentWordRenderSettings.fontSize || fallback;
}

function resolveBodyLineHeight(fallback = 1.65) {
  return currentWordRenderSettings.lineHeight || fallback;
}

function resolveSectionSpacing(fallback = 14) {
  return currentWordRenderSettings.sectionSpacing ?? fallback;
}

function resolveHeadingTopSpacing(fallback = 0) {
  return currentWordRenderSettings.headingTopSpacing ?? fallback;
}

function resolveHeadingBottomSpacing(fallback = 6) {
  return currentWordRenderSettings.headingBottomSpacing ?? fallback;
}

function renderWordHeaderInfoItem(
  item: WordHeaderInfoItem,
  mode: "text" | "icon" | "plain",
  accentColor: string
) {
  const content = item.href
    ? `<a href="${escapeHtml(item.href)}" style="color:inherit;text-decoration:none;">${escapeHtml(
        item.value
      )}</a>`
    : escapeHtml(item.value);

  if (mode === "plain") {
    return `<span>${content}</span>`;
  }

  if (mode === "text") {
    return `<span><span style="color:#64748b;">${escapeHtml(item.label)}：</span>${content}</span>`;
  }

  const iconMarkup = item.iconSrc
    ? `<span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;line-height:0;">${item.iconSrc}</span>`
    : item.badge
      ? `<span style="display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 4px;border-radius:4px;background:${accentColor};color:#fff;font-size:11px;font-weight:700;line-height:1;">${escapeHtml(item.icon)}</span>`
      : `<span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;color:${accentColor};font-size:14px;font-weight:700;line-height:1;">${escapeHtml(item.icon)}</span>`;

  return `<span style="display:inline-flex;align-items:center;gap:6px;">${iconMarkup}<span>${content}</span></span>`;
}

function renderWordHeaderInfoRow(
  items: WordHeaderInfoItem[],
  mode: "text" | "icon" | "plain",
  accentColor: string,
  align: "left" | "center" | "right"
) {
  if (!items.length) {
    return "";
  }

  const justifyContent =
    align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";

  return `<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:${justifyContent};gap:8px 14px;font-size:${resolveBodyFontSize(
    12
  )}px;line-height:${resolveBodyLineHeight(1.7)};color:#111827;">${items
    .map((item) => renderWordHeaderInfoItem(item, mode, accentColor))
    .join("")}</div>`;
}

function normalizeHeaderHref(value: string) {
  const normalized = value.trim();
  if (!normalized) {
    return "";
  }

  if (
    normalized.startsWith("http://") ||
    normalized.startsWith("https://") ||
    normalized.startsWith("mailto:") ||
    normalized.startsWith("tel:")
  ) {
    return normalized;
  }

  return `https://${normalized}`;
}

function chunkWordHeaderItems(items: WordHeaderInfoItem[], chunkSize = 4) {
  const rows: WordHeaderInfoItem[][] = [];

  for (let index = 0; index < items.length; index += chunkSize) {
    rows.push(items.slice(index, index + chunkSize));
  }

  return rows;
}

function getWordHeaderIcon(
  name:
    | "phone"
    | "email"
    | "wechat"
    | "website"
    | "github"
    | "status"
    | "role"
    | "location"
    | "targetLocation"
    | "salary"
    | "education"
    | "school"
    | "age"
    | "experience"
    | "gender"
    | "birth"
    | "height"
    | "weight"
    | "hukou"
    | "ethnicity"
    | "political"
    | "marital"
) {
  const color = "#111111";
  const icons = {
    phone: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.89.34 1.76.65 2.59a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.49-1.22a2 2 0 0 1 2.11-.45c.83.31 1.7.53 2.59.65A2 2 0 0 1 22 16.92z"/></svg>`,
    email: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>`,
    wechat: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M10 4C6.134 4 3 6.687 3 10c0 1.79.922 3.395 2.38 4.495L5 18l3.004-1.517c.636.115 1.303.177 1.996.177 3.866 0 7-2.687 7-6s-3.134-6-7-6Z" fill="${color}"/><path d="M15.5 10.5c3.038 0 5.5 2.099 5.5 4.688 0 1.436-.757 2.72-1.952 3.58l.452 2.232-2.2-1.126c-.56.116-1.157.178-1.8.178-3.037 0-5.5-2.099-5.5-4.687 0-2.59 2.463-4.865 5.5-4.865Z" fill="${color}"/><circle cx="8.2" cy="9.6" r="1" fill="#fff"/><circle cx="11.8" cy="9.6" r="1" fill="#fff"/><circle cx="14.6" cy="15.1" r=".9" fill="#fff"/><circle cx="17.9" cy="15.1" r=".9" fill="#fff"/></svg>`,
    website: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 4 9 15 15 0 0 1-4 9 15 15 0 0 1-4-9 15 15 0 0 1 4-9Z"/></svg>`,
    github: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="${color}"><path d="M12 2C6.477 2 2 6.596 2 12.264c0 4.534 2.865 8.38 6.839 9.737.5.096.682-.22.682-.49 0-.241-.009-.88-.014-1.728-2.782.615-3.37-1.372-3.37-1.372-.454-1.184-1.11-1.5-1.11-1.5-.908-.636.069-.623.069-.623 1.004.072 1.532 1.057 1.532 1.057.893 1.568 2.341 1.115 2.91.853.091-.664.35-1.116.636-1.372-2.221-.259-4.555-1.137-4.555-5.06 0-1.118.389-2.032 1.029-2.749-.103-.261-.446-1.31.098-2.73 0 0 .84-.277 2.75 1.05A9.303 9.303 0 0 1 12 6.836c.85.004 1.705.118 2.504.347 1.909-1.327 2.748-1.05 2.748-1.05.546 1.42.203 2.469.1 2.73.64.717 1.027 1.63 1.027 2.749 0 3.933-2.338 4.798-4.566 5.052.36.319.68.948.68 1.911 0 1.379-.012 2.49-.012 2.829 0 .273.18.591.688.49C19.138 20.64 22 16.796 22 12.264 22 6.596 17.523 2 12 2Z"/></svg>`,
    status: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m9 12 2 2 4-4"/></svg>`,
    role: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M16 20V5a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v15"/><path d="M3 11h18"/></svg>`,
    location: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10Z"/><circle cx="12" cy="11" r="2.5"/></svg>`,
    targetLocation: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3"/><path d="M12 19v3"/><path d="M2 12h3"/><path d="M19 12h3"/></svg>`,
    salary: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 7v10"/><path d="M9.5 9.5c.5-1 1.5-1.5 2.5-1.5 1.5 0 2.5.8 2.5 2 0 3-5 1.5-5 4 0 1.2 1.1 2 2.5 2 1.1 0 2.2-.5 2.8-1.5"/></svg>`,
    education: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 8 10-5 10 5-10 5-10-5Z"/><path d="M6 10.5v4.5c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5"/></svg>`,
    school: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V8l7-4 7 4v13"/><path d="M9 21v-6h6v6"/></svg>`,
    age: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M9 2h6"/></svg>`,
    experience: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h18"/><path d="M12 3v18"/><path d="m19 5-2 2"/><path d="m7 17-2 2"/><path d="m19 19-2-2"/><path d="m7 7-2-2"/></svg>`,
    gender: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="14" r="5"/><path d="M14 10 21 3"/><path d="M16 3h5v5"/><path d="M10 19v3"/><path d="M8.5 22h3"/></svg>`,
    birth: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4"/><path d="M8 3v4"/><path d="M3 11h18"/></svg>`,
    height: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="m8 7 4-4 4 4"/><path d="m8 17 4 4 4-4"/></svg>`,
    weight: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 6a5 5 0 0 1 10 0"/><path d="M5 6h14l1 13H4L5 6Z"/><path d="M12 10v4"/><path d="m12 10 3-1"/></svg>`,
    hukou: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/></svg>`,
    ethnicity: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M14.5 20a4.5 4.5 0 0 1 7 0"/></svg>`,
    political: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 2.4 4.86 5.36.78-3.88 3.78.92 5.34L12 15.84l-4.8 2.52.92-5.34L4.24 8.64l5.36-.78L12 3Z"/></svg>`,
    marital: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6.5-4.35-9-8.5C.5 8.5 2.5 4 7 4c2.2 0 3.8 1.2 5 3 1.2-1.8 2.8-3 5-3 4.5 0 6.5 4.5 4 8.5-2.5 4.15-9 8.5-9 8.5Z"/></svg>`,
  } as const;

  return icons[name];
}

function buildWordHeaderInfoRows(
  personal: Partial<PersonalInfo>,
  options?: { excludeTargetRole?: boolean }
) {
  const items: WordHeaderInfoItem[] = [
    personal.phone?.trim()
      ? {
          label: "电话",
          value: personal.phone.trim(),
          icon: "",
          iconSrc: getWordHeaderIcon("phone"),
          href: `tel:${personal.phone.trim()}`,
        }
      : null,
    personal.email?.trim()
      ? {
          label: "邮箱",
          value: personal.email.trim(),
          icon: "",
          iconSrc: getWordHeaderIcon("email"),
          href: `mailto:${personal.email.trim()}`,
        }
      : null,
    personal.wechat?.trim()
      ? {
          label: "微信",
          value: personal.wechat.trim(),
          icon: "",
          iconSrc: getWordHeaderIcon("wechat"),
        }
      : null,
    personal.website?.trim()
      ? {
          label: "网站",
          value: personal.website.trim(),
          icon: "",
          iconSrc: getWordHeaderIcon("website"),
          href: normalizeHeaderHref(personal.website.trim()),
        }
      : null,
    personal.github?.trim()
      ? {
          label: "GitHub",
          value: personal.github.trim(),
          icon: "",
          iconSrc: getWordHeaderIcon("github"),
          href: normalizeHeaderHref(personal.github.trim()),
        }
      : null,
    personal.status?.trim()
      ? { label: "状态", value: personal.status.trim(), icon: "", iconSrc: getWordHeaderIcon("status") }
      : null,
    !options?.excludeTargetRole && personal.targetRole?.trim()
      ? { label: "岗位", value: personal.targetRole.trim(), icon: "", iconSrc: getWordHeaderIcon("role") }
      : null,
    (() => {
        const cityOrLocation = (personal.currentCity || personal.location)?.trim();
        return cityOrLocation
          ? {
              label: "地点",
              value: cityOrLocation,
              icon: "",
              iconSrc: getWordHeaderIcon("location"),
            }
          : null;
      })(),
    personal.targetLocation?.trim()
      ? {
          label: "期望地点",
          value: personal.targetLocation.trim(),
          icon: "",
          iconSrc: getWordHeaderIcon("targetLocation"),
        }
      : null,
    personal.expectedSalary?.trim()
      ? { label: "薪资", value: personal.expectedSalary.trim(), icon: "", iconSrc: getWordHeaderIcon("salary") }
      : null,
    personal.education?.trim()
      ? { label: "学历", value: personal.education.trim(), icon: "", iconSrc: getWordHeaderIcon("education") }
      : null,
    personal.graduateSchool?.trim()
      ? { label: "毕业院校", value: personal.graduateSchool.trim(), icon: "", iconSrc: getWordHeaderIcon("school") }
      : null,
    personal.age?.trim()
      ? { label: "年龄", value: personal.age.trim(), icon: "", iconSrc: getWordHeaderIcon("age") }
      : null,
    personal.yearsOfExperience?.trim()
      ? {
          label: "工作年限",
          value: personal.yearsOfExperience.trim(),
          icon: "",
          iconSrc: getWordHeaderIcon("experience"),
        }
      : null,
    personal.gender?.trim()
      ? { label: "性别", value: personal.gender.trim(), icon: "", iconSrc: getWordHeaderIcon("gender") }
      : null,
    personal.birthDate?.trim()
      ? { label: "出生年月", value: personal.birthDate.trim(), icon: "", iconSrc: getWordHeaderIcon("birth") }
      : null,
    personal.height?.trim()
      ? { label: "身高", value: personal.height.trim(), icon: "", iconSrc: getWordHeaderIcon("height") }
      : null,
    personal.weight?.trim()
      ? { label: "体重", value: personal.weight.trim(), icon: "", iconSrc: getWordHeaderIcon("weight") }
      : null,
    personal.hukou?.trim()
      ? { label: "籍贯", value: personal.hukou.trim(), icon: "", iconSrc: getWordHeaderIcon("hukou") }
      : null,
    personal.ethnicity?.trim()
      ? { label: "民族", value: personal.ethnicity.trim(), icon: "", iconSrc: getWordHeaderIcon("ethnicity") }
      : null,
    personal.politicalStatus?.trim()
      ? {
          label: "政治面貌",
          value: personal.politicalStatus.trim(),
          icon: "",
          iconSrc: getWordHeaderIcon("political"),
        }
      : null,
    personal.maritalStatus?.trim()
      ? {
          label: "婚姻状况",
          value: personal.maritalStatus.trim(),
          icon: "",
          iconSrc: getWordHeaderIcon("marital"),
        }
      : null,
  ].filter(Boolean) as WordHeaderInfoItem[];

  return chunkWordHeaderItems(items, 4);
}

export const wordTemplateMetas = {
  bilingualResearchBlue: {
    name: "双语商业分析",
    description:
      "蓝色双语标题线，左侧证件照，适合研究、商业分析与咨询方向的校招和实习场景。",
    defaultTheme: "professional",
    tags: {
      industry: ["general", "internet", "finance"],
      style: "professional",
      scenario: ["campus", "internship", "social"],
    },
  },
  overseasBusinessAnalyst: {
    name: "海外商业分析",
    description:
      "黑色分节线与右上照片，信息密度高，适合海外留学背景的商科求职场景。",
    defaultTheme: "professional",
    tags: {
      industry: ["general", "finance", "internet"],
      style: "professional",
      scenario: ["campus", "internship", "social"],
    },
  },
  productManagerBlue: {
    name: "产品经理蓝线",
    description:
      "蓝色分节线与右侧证件照，偏产品、商业分析和项目经历表达的单页简历版式。",
    defaultTheme: "professional",
    tags: {
      industry: ["internet", "general"],
      style: "professional",
      scenario: ["campus", "internship", "social"],
    },
  },
  hrRecruitmentTable: {
    name: "人力资源表格",
    description:
      "灰底分节标题配表格式教育背景，适合人力、行政和校园经历较丰富的候选人。",
    defaultTheme: "professional",
    tags: {
      industry: ["general", "education"],
      style: "professional",
      scenario: ["campus", "internship", "social"],
    },
  },
  campusOperationsDense: {
    name: "校园运营密排",
    description:
      "高信息密度黑线分节排版，适合运营、产品、市场与综合商科方向投递。",
    defaultTheme: "professional",
    tags: {
      industry: ["internet", "marketing", "general"],
      style: "professional",
      scenario: ["campus", "internship", "social"],
    },
  },
  personalResumeGold: {
    name: "经典双语金线",
    description: "蓝金双色横幅与中文英文标题，适合校园通用型证件照简历。",
    defaultTheme: "professional",
    tags: {
      industry: ["general", "marketing", "education"],
      style: "professional",
      scenario: ["campus", "internship"],
    },
  },
  slateMarketingCampus: {
    name: "蓝灰营销校招",
    description: "蓝灰色块标题与简洁栏目线，适合市场、财会、校招类投递。",
    defaultTheme: "professional",
    tags: {
      industry: ["general", "marketing", "finance"],
      style: "professional",
      scenario: ["campus", "internship"],
    },
  },
  roundedJobResume: {
    name: "圆角求职简历",
    description: "大圆角蓝色标题头与胶囊标签，适合校园求职和行政职能方向。",
    defaultTheme: "professional",
    tags: {
      industry: ["general", "marketing", "education"],
      style: "professional",
      scenario: ["campus", "internship"],
    },
  },
  personalResumeBlue: {
    name: "经典双语蓝线",
    description: "双语标题配蓝灰横条，适合校园通用、行政和市场方向简历。",
    defaultTheme: "professional",
    tags: {
      industry: ["general", "marketing", "education"],
      style: "professional",
      scenario: ["campus", "internship"],
    },
  },
  grayIconCampus: {
    name: "灰线图标校园",
    description: "简约灰色横线和圆形图标，适合校园实践、奖项荣誉较多的模板。",
    defaultTheme: "professional",
    tags: {
      industry: ["general", "marketing", "education"],
      style: "professional",
      scenario: ["campus", "internship"],
    },
  },
  cleanBusinessFormal: {
    name: "黑线商务正式",
    description: "极简黑线分栏与证件照布局，适合市场、行政、商务方向正式投递。",
    defaultTheme: "professional",
    tags: {
      industry: ["general", "marketing", "internet"],
      style: "professional",
      scenario: ["campus", "social", "internship"],
    },
  },
  iconTargetNavy: {
    name: "深蓝图标目标",
    description: "深蓝顶栏与图标栏目标题，适合新媒体、运营、校园活动类简历。",
    defaultTheme: "professional",
    tags: {
      industry: ["marketing", "general", "internet"],
      style: "professional",
      scenario: ["campus", "internship"],
    },
  },
  timelineMarketingBlue: {
    name: "蓝线时间轴",
    description: "左侧时间轴和节点结构，适合市场推广、运营经历较强的简历。",
    defaultTheme: "professional",
    tags: {
      industry: ["marketing", "general", "internet"],
      style: "professional",
      scenario: ["social", "internship"],
    },
  },
  simpleStarCampus: {
    name: "简洁星标校招",
    description: "黑线分节与星标项目符号，适合校招、实习与奖项证书较多的简历。",
    defaultTheme: "professional",
    tags: {
      industry: ["general", "marketing", "finance"],
      style: "professional",
      scenario: ["campus", "internship"],
    },
  },
  mintDesignerClean: {
    name: "清新设计师",
    description: "浅青边框与居中头像，适合设计师、作品型校园简历。",
    defaultTheme: "professional",
    tags: {
      industry: ["design", "general"],
      style: "professional",
      scenario: ["campus", "internship"],
    },
  },
  darkSidebarManager: {
    name: "深色侧栏产品",
    description: "深色左侧栏与图标分节，适合产品、行政与校园综合简历。",
    defaultTheme: "professional",
    tags: {
      industry: ["general", "internet"],
      style: "professional",
      scenario: ["campus", "internship", "social"],
    },
  },
  blueSidebarSales: {
    name: "蓝侧栏销售",
    description: "浅蓝左栏信息区，右侧蓝线内容区，适合销售、市场类简历。",
    defaultTheme: "professional",
    tags: {
      industry: ["marketing", "general"],
      style: "professional",
      scenario: ["campus", "internship"],
    },
  },
  grayMarketingBars: {
    name: "灰条营销简历",
    description: "简洁灰色块标题，适合营销、运营、通用实习简历。",
    defaultTheme: "professional",
    tags: {
      industry: ["marketing", "general"],
      style: "professional",
      scenario: ["internship", "social"],
    },
  },
  tealTimelineDesigner: {
    name: "青色时间轴设计",
    description: "左侧青色信息栏，右侧时间轴工作经历，适合设计类简历。",
    defaultTheme: "professional",
    tags: {
      industry: ["design", "general"],
      style: "professional",
      scenario: ["social", "internship"],
    },
  },
  tealTeacherFlow: {
    name: "青色教师时间轴",
    description: "青绿色顶部信息栏配时间轴内容，适合教师和教育方向。",
    defaultTheme: "professional",
    tags: {
      industry: ["education", "general"],
      style: "professional",
      scenario: ["social", "internship"],
    },
  },
  darkDualColumnIntern: {
    name: "深色双栏外贸",
    description: "深色标题区与双栏正文结构，适合外贸、销售、客服类简历。",
    defaultTheme: "professional",
    tags: {
      industry: ["general", "marketing", "finance"],
      style: "professional",
      scenario: ["internship", "campus"],
    },
  },
  floralMarketingSoft: {
    name: "花卉柔和营销",
    description: "浅棕色标题与花卉角饰，适合女生校园简历和营销方向。",
    defaultTheme: "professional",
    tags: {
      industry: ["general", "marketing", "design"],
      style: "professional",
      scenario: ["campus", "internship"],
    },
  },
  sageTeacherSidebar: {
    name: "绿色教师侧栏",
    description: "绿色左侧栏和圆角标签，适合教师、教育培训方向。",
    defaultTheme: "professional",
    tags: {
      industry: ["education", "general"],
      style: "professional",
      scenario: ["social", "internship"],
    },
  },
  cyanHeaderDesigner: {
    name: "青蓝头像横幅",
    description: "青蓝色页眉与圆形头像，适合网页、平面设计方向。",
    defaultTheme: "professional",
    tags: {
      industry: ["design", "internet"],
      style: "professional",
      scenario: ["internship", "social"],
    },
  },
  blueCampusAwards: {
    name: "蓝线校园荣誉",
    description: "蓝线图标分节与证件照信息区，适合校园实践、荣誉较多的简历。",
    defaultTheme: "professional",
    tags: {
      industry: ["general", "education", "marketing"],
      style: "professional",
      scenario: ["campus", "internship"],
    },
  },
  darkTopSales: {
    name: "黑顶营销简历",
    description: "黑色页眉与极简横线栏目，适合市场营销、国企方向。",
    defaultTheme: "professional",
    tags: {
      industry: ["marketing", "general"],
      style: "professional",
      scenario: ["social", "internship"],
    },
  },
  grayFinanceLight: {
    name: "灰块金融分析",
    description: "浅灰色块标题和简洁金融版式，适合财务、金融分析方向。",
    defaultTheme: "professional",
    tags: {
      industry: ["finance", "general"],
      style: "professional",
      scenario: ["social", "internship"],
    },
  },
  blueNurseResume: {
    name: "护理英文蓝条",
    description: "英文蓝条页眉与护理岗位内容，适合护理、医药相关简历。",
    defaultTheme: "professional",
    tags: {
      industry: ["general", "education"],
      style: "professional",
      scenario: ["internship", "social"],
    },
  },
  minimalFrontendPlain: {
    name: "极简前端工程师",
    description: "黑白极简文本排版，适合前端工程师与技术岗位投递。",
    defaultTheme: "professional",
    tags: {
      industry: ["internet", "general"],
      style: "professional",
      scenario: ["social", "internship"],
    },
  },
  minimalOpsAvatar: {
    name: "极简运维工程师",
    description: "顶部姓名信息配右上证件照，适合运维、基础设施岗位。",
    defaultTheme: "professional",
    tags: {
      industry: ["internet", "general"],
      style: "professional",
      scenario: ["social", "internship"],
    },
  },
  campusJavaResume: {
    name: "校招 Java 简历",
    description: "校招 Java 后端风格，信息集中，适合应届开发岗。",
    defaultTheme: "professional",
    tags: {
      industry: ["internet", "general"],
      style: "professional",
      scenario: ["campus", "internship"],
    },
  },
  blueBlocksJavaResume: {
    name: "蓝块 Java 简历",
    description: "浅蓝块分节标题，适合 Java 开发与后端岗位。",
    defaultTheme: "professional",
    tags: {
      industry: ["internet", "general"],
      style: "professional",
      scenario: ["campus", "internship", "social"],
    },
  },
  beigeSidebarGuide: {
    name: "米色侧栏模板",
    description: "米色侧栏加蓝线正文，适合指导型简历和通用技术简历。",
    defaultTheme: "professional",
    tags: {
      industry: ["general", "internet"],
      style: "professional",
      scenario: ["social", "internship"],
    },
  },
  purpleGuideResume: {
    name: "紫色全栈模板",
    description: "紫色顶部横幅与图标分节，适合全栈开发和技术岗位。",
    defaultTheme: "professional",
    tags: {
      industry: ["internet", "general"],
      style: "professional",
      scenario: ["social", "internship"],
    },
  },
  greenDataRiskResume: {
    name: "青绿风控实习",
    description: "青绿色上下横幅配左右分栏，适合风控、财务、数据分析实习方向。",
    defaultTheme: "professional",
    tags: {
      industry: ["finance", "general"],
      style: "professional",
      scenario: ["internship", "campus"],
    },
  },
  javaBilingualIcons: {
    name: "Java 中英图标",
    description: "中英双语栏目标题配图标，适合应届 Java 工程师简历。",
    defaultTheme: "professional",
    tags: {
      industry: ["internet", "general"],
      style: "professional",
      scenario: ["campus", "internship"],
    },
  },
  slantedGrayJava: {
    name: "斜角灰条 Java",
    description: "斜角深灰标题条与简洁内容区，适合 Java 开发工程师。",
    defaultTheme: "professional",
    tags: {
      industry: ["internet", "general"],
      style: "professional",
      scenario: ["social", "internship"],
    },
  },
  stripedClassicJava: {
    name: "条纹经典 Java",
    description: "灰条纹页眉与深浅分层标题块，适合校招 Java 简历。",
    defaultTheme: "professional",
    tags: {
      industry: ["internet", "general"],
      style: "professional",
      scenario: ["campus", "internship"],
    },
  },
  blueBorderJava: {
    name: "蓝框边 Java",
    description: "蓝框外边线与蓝色标题框，适合 Java 开发和校招场景。",
    defaultTheme: "professional",
    tags: {
      industry: ["internet", "general"],
      style: "professional",
      scenario: ["campus", "internship"],
    },
  },
  seniorOpsMinimal: {
    name: "高级运维极简",
    description: "极简黑线排版，适合高级运维和数据库运维工程师。",
    defaultTheme: "professional",
    tags: {
      industry: ["internet", "general"],
      style: "professional",
      scenario: ["social"],
    },
  },
  darkHeaderFrontend: {
    name: "深色页眉前端",
    description: "深色页眉配圆角小节标题，适合前端工程师和互联网岗位。",
    defaultTheme: "professional",
    tags: {
      industry: ["internet", "general"],
      style: "professional",
      scenario: ["social", "internship"],
    },
  },
  placeholderCampusResume: {
    name: "通用校招占位",
    description: "带示例说明的通用校招结构，适合需要自行替换内容的模板。",
    defaultTheme: "professional",
    tags: {
      industry: ["general", "education"],
      style: "professional",
      scenario: ["campus", "internship"],
    },
  },
  algorithmEngineerResearch: {
    name: "算法工程师科研版",
    description: "左右信息栏与科研项目结构，适合算法工程师、机器学习和视觉方向求职。",
    defaultTheme: "professional",
    tags: {
      industry: ["internet", "education", "general"],
      style: "professional",
      scenario: ["campus", "internship", "social"],
    },
  },
  javaBackendEngineer: {
    name: "Java 后端工程师",
    description: "黑白技术简历结构，突出 Java 后端项目、实习经历和工程技能栈。",
    defaultTheme: "professional",
    tags: {
      industry: ["internet", "general"],
      style: "professional",
      scenario: ["campus", "internship", "social"],
    },
  },
} satisfies Record<string, ResumeTemplateMeta>;

export type WordTemplateKey = keyof typeof wordTemplateMetas;

const FEMALE_AVATAR = "/template-assets/avatars/id-photo.png";
const MALE_AVATAR = "/template-assets/avatars/id-photo.png";
export const TRANSPARENT_PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

function getAvatar(personal: PersonalInfo, defaultUrl: string): string {
  void defaultUrl;
  if (personal.showAvatar === false) return "";
  return personal.avatar?.trim() || "";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function normalizeHtml(markup: string) {
  return markup
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
}

function sectionHeading(
  title: string,
  accent = "#2f5fb3",
  mode: "blue" | "plain" | "gray" = "blue"
) {
  const resolvedAccent = resolveWordAccent(accent);
  const sectionSpacing = resolveSectionSpacing(14);
  const headingTopSpacing = resolveHeadingTopSpacing(0);
  const headingBottomSpacing = resolveHeadingBottomSpacing(6);

  if (mode === "gray") {
    return `
      <div style="margin-top:${sectionSpacing}px;margin-bottom:${headingBottomSpacing}px;">
        <div style="background:#f2f2f2;border:1px solid #d8d8d8;padding:${4 + headingTopSpacing}px 10px 4px;font-size:14px;font-weight:700;color:${resolvedAccent};">
          ${escapeHtml(title)}
        </div>
      </div>
    `;
  }

  if (mode === "plain") {
    return `
      <div style="margin-top:${sectionSpacing}px;margin-bottom:${headingBottomSpacing}px;padding-top:${headingTopSpacing}px;">
        <div style="font-size:14px;font-weight:700;color:${resolvedAccent};line-height:1.2;">${escapeHtml(title)}</div>
        <div style="height:2px;background:${resolvedAccent};margin-top:4px;"></div>
      </div>
    `;
  }

  return `
    <div style="margin-top:${sectionSpacing}px;margin-bottom:${headingBottomSpacing}px;padding-top:${headingTopSpacing}px;">
      <div style="font-size:16px;font-weight:700;color:${resolvedAccent};line-height:1.2;">${escapeHtml(title)}</div>
      <div style="height:3px;background:${resolvedAccent};margin-top:4px;"></div>
    </div>
  `;
}

function bulletList(items: string[], fontSize = 12.5, lineHeight = 1.65) {
  const lis = items
    .filter(Boolean)
    .map((item) => `<li style="margin:2px 0 0 0;">${escapeHtml(item)}</li>`)
    .join("");

  return `<ul style="margin:4px 0 0 18px;padding:0;font-size:${resolveBodyFontSize(
    fontSize
  )}px;line-height:${resolveBodyLineHeight(lineHeight)};color:#111827;">${lis}</ul>`;
}

function textLines(items: string[]) {
  return `
    <div style="margin-top:8px;font-size:${resolveBodyFontSize(
      12.5
    )}px;line-height:${resolveBodyLineHeight(1.8)};color:#111827;">
      ${items
        .filter(Boolean)
        .map((item) => {
          const index = item.indexOf("：");
          if (index > 0) {
            const label = item.slice(0, index + 1);
            const text = item.slice(index + 1);
            return `<div><strong>${escapeHtml(label)}</strong>${escapeHtml(text)}</div>`;
          }
          return `<div>${escapeHtml(item)}</div>`;
        })
        .join("")}
    </div>
  `;
}

function labeledBullets(
  items: { label: string; text: string }[],
  fontSize = 12.5,
  lineHeight = 1.65
) {
  const lis = items
    .map(
      (item) =>
        `<li style="margin:2px 0 0 0;"><strong>${escapeHtml(item.label)}</strong>${escapeHtml(item.text)}</li>`
    )
    .join("");

  return `<ul style="margin:4px 0 0 18px;padding:0;font-size:${resolveBodyFontSize(
    fontSize
  )}px;line-height:${resolveBodyLineHeight(lineHeight)};color:#111827;">${lis}</ul>`;
}

function threeColRow(
  left: string,
  middle: string,
  right: string,
  options?: {
    bold?: boolean;
    marginTop?: number;
    rightWidth?: string;
    leftWidth?: string;
    middleAlign?: string;
  }
) {
  return `
    <table style="width:100%;border-collapse:collapse;margin-top:${options?.marginTop ?? 6}px;font-size:13px;color:#111827;">
      <tr>
        <td style="width:${options?.leftWidth ?? "42%"};font-weight:${options?.bold ? 700 : 600};padding:0 6px 0 0;vertical-align:top;">${escapeHtml(left)}</td>
        <td style="text-align:${options?.middleAlign ?? "left"};font-weight:${options?.bold ? 700 : 600};padding:0 6px;vertical-align:top;">${escapeHtml(middle)}</td>
        <td style="width:${options?.rightWidth ?? "22%"};text-align:right;font-weight:${options?.bold ? 700 : 600};padding:0 0 0 6px;vertical-align:top;">${escapeHtml(right)}</td>
      </tr>
    </table>
  `;
}

function fourColRow(cols: string[], widths: string[]) {
  return `
    <table style="width:100%;border-collapse:collapse;margin-top:4px;font-size:12.5px;color:#111827;">
      <tr>
        ${cols
          .map(
            (col, index) =>
              `<td style="width:${widths[index]};padding:0 8px 0 0;vertical-align:top;font-weight:600;">${escapeHtml(col)}</td>`
          )
          .join("")}
      </tr>
    </table>
  `;
}

function photoHeader(options: {
  name: string;
  subtitle?: string;
  contactLines: string[];
  personalInfo?: Partial<PersonalInfo>;
  avatarUrl: string;
  avatarSide: "left" | "right";
  nameAlign?: "left" | "center";
  topGap?: number;
  photoSize?: { width: number; height: number };
}) {
  const headerLayout = currentWordRenderSettings.headerLayout ?? "spread";
  const infoDisplay = currentWordRenderSettings.personalInfoDisplay ?? "icon";
  const accentColor = resolveWordAccent("#2563eb");
  const justifyContent =
    headerLayout === "center" ? "center" : headerLayout === "right" ? "flex-end" : "flex-start";
  const textAlign = headerLayout === "center" ? "center" : headerLayout === "right" ? "right" : "left";
  const infoAlign =
    headerLayout === "spread" ? options.nameAlign ?? "left" : textAlign;

  if (options.personalInfo) {
    const infoRows = buildWordHeaderInfoRows(options.personalInfo, {
      excludeTargetRole: Boolean(options.subtitle),
    });
    const avatar = `<img src="${options.avatarUrl}" alt="${escapeHtml(
      options.name
    )}" style="width:${options.photoSize?.width ?? 102}px;height:${options.photoSize?.height ?? 136}px;object-fit:cover;border:1px solid #d8d8d8;background:#f8fafc;" />`;
    const textBlock = `
      <div style="flex:1;min-width:0;text-align:${infoAlign};">
        <div style="font-size:28px;font-weight:700;color:#111827;text-align:${infoAlign};margin-top:${options.topGap ?? 0}px;">${escapeHtml(
          options.name
        )}</div>
        ${
          options.subtitle
            ? `<div style="font-size:${resolveBodyFontSize(
                12
              )}px;color:${accentColor};margin-top:8px;text-align:${infoAlign};">${escapeHtml(
                options.subtitle
              )}</div>`
            : ""
        }
        <div style="margin-top:8px;display:grid;gap:6px;">
          ${infoRows
            .map((row) => renderWordHeaderInfoRow(row, infoDisplay, accentColor, infoAlign))
            .join("")}
        </div>
      </div>
    `;

    return `
      <div style="display:flex;flex-direction:${headerLayout === "center" ? "column" : "row"};align-items:${headerLayout === "center" ? "center" : headerLayout === "right" ? "flex-end" : "flex-start"};justify-content:${headerLayout === "spread" ? "space-between" : justifyContent};gap:24px;">
        ${headerLayout === "center" ? `${avatar}${textBlock}` : options.avatarSide === "left" ? avatar : textBlock}
        ${headerLayout === "center" ? "" : options.avatarSide === "left" ? textBlock : avatar}
      </div>
    `;
  }

  const contactLines = options.contactLines.map((line) => {
    if (infoDisplay === "plain") {
      return `<div>${escapeHtml(line)}</div>`;
    }

    if (infoDisplay === "text") {
      return `<div><span style="color:#64748b;">信息：</span>${escapeHtml(line)}</div>`;
    }

    return `<div><span style="color:${accentColor};font-weight:700;margin-right:6px;">•</span>${escapeHtml(
      line
    )}</div>`;
  });
  const avatar = `<img src="${options.avatarUrl}" alt="${escapeHtml(
    options.name
  )}" style="width:${options.photoSize?.width ?? 102}px;height:${options.photoSize?.height ?? 136}px;object-fit:cover;border:1px solid #d8d8d8;background:#f8fafc;" />`;
  const textBlock = `
    <div style="flex:1;min-width:0;text-align:${headerLayout === "spread" ? options.nameAlign ?? "left" : textAlign};">
      <div style="font-size:28px;font-weight:700;color:#111827;text-align:${headerLayout === "spread" ? options.nameAlign ?? "left" : textAlign};margin-top:${options.topGap ?? 0}px;">${escapeHtml(
        options.name
      )}</div>
      ${
        options.subtitle
          ? `<div style="font-size:${resolveBodyFontSize(
              12
            )}px;color:${accentColor};margin-top:8px;text-align:${headerLayout === "spread" ? options.nameAlign ?? "left" : textAlign};">${escapeHtml(
              options.subtitle
            )}</div>`
          : ""
      }
      <div style="margin-top:8px;font-size:${resolveBodyFontSize(
        12
      )}px;line-height:${resolveBodyLineHeight(1.7)};color:#111827;">
        ${contactLines.join("")}
      </div>
    </div>
  `;

  return `
    <div style="display:flex;flex-direction:${headerLayout === "center" ? "column" : "row"};align-items:${headerLayout === "center" ? "center" : headerLayout === "right" ? "flex-end" : "flex-start"};justify-content:${headerLayout === "spread" ? "space-between" : justifyContent};gap:24px;">
      ${headerLayout === "center" ? `${avatar}${textBlock}` : options.avatarSide === "left" ? avatar : textBlock}
      ${headerLayout === "center" ? "" : options.avatarSide === "left" ? textBlock : avatar}
    </div>
  `;
}

function centeredHeader(options: {
  name: string;
  contactLine: string;
  personalInfo?: Partial<PersonalInfo>;
  avatarUrl: string;
  photoSize?: { width: number; height: number };
}) {
  const headerLayout = currentWordRenderSettings.headerLayout ?? "center";
  const infoDisplay = currentWordRenderSettings.personalInfoDisplay ?? "icon";
  const accentColor = resolveWordAccent("#2563eb");
  const infoAlign =
    headerLayout === "left" ? "left" : headerLayout === "right" ? "right" : "center";
  const isCentered = headerLayout === "center";
  const isRightAligned = headerLayout === "right";
  const isSpread = headerLayout === "spread";
  const avatar = `<img src="${options.avatarUrl}" alt="${escapeHtml(
    options.name
  )}" style="width:${options.photoSize?.width ?? 102}px;height:${options.photoSize?.height ?? 136}px;object-fit:cover;border:1px solid #d8d8d8;background:#f8fafc;flex-shrink:0;" />`;

  if (options.personalInfo) {
    const infoRows = buildWordHeaderInfoRows(options.personalInfo);
    const textBlock = `
      <div style="flex:1;min-width:0;text-align:${infoAlign};">
        <div style="font-size:28px;font-weight:700;color:#111827;text-align:${infoAlign};">${escapeHtml(
          options.name
        )}</div>
        <div style="margin-top:8px;display:grid;gap:6px;">
          ${infoRows
            .map((row) => renderWordHeaderInfoRow(row, infoDisplay, accentColor, infoAlign))
            .join("")}
        </div>
      </div>
    `;

    return `
      <div style="display:flex;flex-direction:${isCentered ? "column" : "row"};align-items:${isCentered ? "center" : "flex-start"};justify-content:${isSpread ? "space-between" : isCentered ? "center" : "flex-start"};gap:24px;">
        ${isCentered ? avatar : isRightAligned ? textBlock : avatar}
        ${isCentered ? textBlock : isRightAligned ? avatar : textBlock}
      </div>
    `;
  }

  const contactLine =
    infoDisplay === "plain"
      ? escapeHtml(options.contactLine)
      : infoDisplay === "text"
        ? `联系方式：${escapeHtml(options.contactLine)}`
        : `<span style="display:inline-flex;align-items:center;gap:6px;"><span style="font-weight:700;color:${accentColor};">•</span><span>${escapeHtml(
            options.contactLine
          )}</span></span>`;
  const textBlock = `
    <div style="flex:1;min-width:0;text-align:${infoAlign};">
      <div style="font-size:28px;font-weight:700;color:#111827;text-align:${infoAlign};">${escapeHtml(
        options.name
      )}</div>
      <div style="font-size:${resolveBodyFontSize(12)}px;line-height:${resolveBodyLineHeight(
        1.8
      )};color:${infoDisplay === "icon" ? accentColor : "#111827"};text-align:${infoAlign};margin-top:8px;">${contactLine}</div>
    </div>
  `;

  return `
    <div style="display:flex;flex-direction:${isCentered ? "column" : "row"};align-items:${isCentered ? "center" : "flex-start"};justify-content:${isSpread ? "space-between" : isCentered ? "center" : "flex-start"};gap:24px;">
      ${isCentered ? avatar : isRightAligned ? textBlock : avatar}
      ${isCentered ? textBlock : isRightAligned ? avatar : textBlock}
    </div>
  `;
}

function plainResumeShell(content: string) {
  const safeFontFamily = (
    currentWordRenderSettings.fontFamily ?? "'Arial','Microsoft YaHei',sans-serif"
  ).replaceAll('"', "'");
  const personalExtraFieldsBlock = renderCurrentWordPersonalExtraFieldsBlock();

  return normalizeHtml(`
    <div style="font-family:${safeFontFamily};color:#111827;font-size:${resolveBodyFontSize(
      12.5
    )}px;line-height:${resolveBodyLineHeight(1.65)};">
      ${normalizeHtml(content)}
      ${personalExtraFieldsBlock}
    </div>
  `);
}

function renderCurrentWordPersonalExtraFieldsBlock() {
  if (!currentWordPersonalExtraFields.length) {
    return "";
  }

  return `
    <div style="margin-top:${resolveSectionSpacing(14)}px;">
      ${sectionHeading("附加信息", "#111827", "plain")}
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:18px;row-gap:4px;font-size:${resolveBodyFontSize(
        12.5
      )}px;line-height:${resolveBodyLineHeight(1.75)};color:#111827;">
        ${currentWordPersonalExtraFields
          .map(
            (field) =>
              `<div><span style="font-weight:700;">${escapeHtml(
                field.label.trim()
              )}：</span>${escapeHtml(field.value.trim())}</div>`
          )
          .join("")}
      </div>
    </div>
  `;
}

function cornerFrame(content: string) {
  return content;
}

function createPersonalSection(
  template: WordTemplateKey,
  content: Partial<PersonalInfo> & Pick<PersonalInfo, "name">
): ResumeSection {
  return {
    id: `${template}-personal`,
    type: "personal",
    title: "个人信息",
    isVisible: true,
    content: {
      title: "",
      location: "",
      phone: "",
      email: "",
      education: "",
      ...content,
    },
  };
}

function createEducationSection(
  template: WordTemplateKey,
  title: string,
  items: EducationItem[]
): ResumeSection {
  return {
    id: `${template}-${title}-education`,
    type: "education",
    title,
    isVisible: true,
    content: items,
  };
}

function createExperienceSection(
  template: WordTemplateKey,
  title: string,
  items: ExperienceItem[]
): ResumeSection {
  return {
    id: `${template}-${title}-experience`,
    type: "experience",
    title,
    isVisible: true,
    content: items,
  };
}

function createProjectsSection(
  template: WordTemplateKey,
  title: string,
  idSuffix: string,
  items: ProjectItem[]
): ResumeSection {
  return {
    id: `${template}-${idSuffix}-projects`,
    type: "projects",
    title,
    isVisible: true,
    content: items,
  };
}

function createSkillsSection(
  template: WordTemplateKey,
  title: string,
  items: SkillItem[]
): ResumeSection {
  return {
    id: `${template}-${title}-skills`,
    type: "skills",
    title,
    isVisible: true,
    content: items,
  };
}

function educationItem(
  id: string,
  school: string,
  degree: string,
  startDate: string,
  endDate: string,
  description: string,
  location?: string
): EducationItem {
  return { id, school, degree, startDate, endDate, description, location };
}

function experienceItem(
  id: string,
  company: string,
  role: string,
  startDate: string,
  endDate: string,
  description: string
): ExperienceItem {
  return {
    id,
    company,
    role,
    startDate,
    endDate,
    current: false,
    description,
  };
}

function projectItem(
  id: string,
  name: string,
  role: string,
  startDate: string,
  endDate: string,
  description: string,
  link?: string
): ProjectItem {
  return { id, name, role, startDate, endDate, description, link };
}

function skillItem(id: string, name: string, level: SkillItem["level"] = "Advanced"): SkillItem {
  return { id, name, level };
}

function splitLines(value: string | undefined) {
  return (value || "")
    .split(/\n+/)
    .map((line) => line.replace(/^[•·\-]\s*/, "").trim())
    .filter(Boolean);
}

function formatPeriod(startDate?: string, endDate?: string) {
  return [startDate, endDate].filter(Boolean).join("-");
}

function parseLabeledItems(value: string | undefined) {
  const lines = splitLines(value);
  const items = lines
    .map((line) => {
      const index = line.indexOf("：");
      if (index <= 0) {
        return null;
      }

      return {
        label: line.slice(0, index + 1),
        text: line.slice(index + 1).trim(),
      };
    })
    .filter(Boolean) as { label: string; text: string }[];

  return items.length === lines.length ? items : null;
}

function renderDescription(
  description: string | undefined,
  options?: { preferLabeled?: boolean }
) {
  if (!description?.trim()) {
    return "";
  }

  if (options?.preferLabeled) {
    const labeled = parseLabeledItems(description);
    if (labeled?.length) {
      return labeledBullets(labeled);
    }
  }

  return bulletList(splitLines(description));
}

function getPersonalSection(sections: ResumeSection[]) {
  return sections.find((section) => section.type === "personal")?.content as PersonalInfo | undefined;
}

function getVisiblePersonalExtraFields(personal: Pick<PersonalInfo, "extraFields">): PersonalExtraField[] {
  return (Array.isArray(personal.extraFields) ? personal.extraFields : []).filter(
    (field) => field.visible !== false && field.label.trim() && field.value.trim()
  );
}

function createPersonalSummarySection(personal: PersonalInfo): ResumeSection | null {
  const summary = personal.summary?.trim();
  if (!summary) {
    return null;
  }

  return {
    id: "auto-personal-summary",
    type: "custom",
    title: "个人简介",
    isVisible: true,
    content: {
      markdown: summary,
    },
  };
}

function withPersonalSummarySection(sections: ResumeSection[], personal: PersonalInfo): ResumeSection[] {
  const summarySection = createPersonalSummarySection(personal);
  if (!summarySection) {
    return sections.filter((section) => section.id !== "auto-personal-summary");
  }

  const cleanSections = sections.filter((section) => section.id !== summarySection.id);
  const personalIndex = cleanSections.findIndex((section) => section.type === "personal");
  if (personalIndex < 0) {
    return [summarySection, ...cleanSections];
  }

  return [
    ...cleanSections.slice(0, personalIndex + 1),
    summarySection,
    ...cleanSections.slice(personalIndex + 1),
  ];
}

const WORD_PERSONAL_FALLBACK_FIELDS = [
  ["phone", "电话"],
  ["email", "邮箱"],
  ["location", "所在地"],
  ["currentCity", "现居城市"],
  ["status", "当前状态"],
  ["targetRole", "求职岗位"],
  ["targetLocation", "期望地点"],
  ["expectedSalary", "期望薪资"],
  ["education", "最高学历"],
  ["graduateSchool", "毕业院校"],
  ["age", "年龄"],
  ["yearsOfExperience", "工作年限"],
  ["gender", "性别"],
  ["birthDate", "出生年月"],
  ["height", "身高"],
  ["weight", "体重"],
  ["hukou", "籍贯/户口"],
  ["ethnicity", "民族"],
  ["politicalStatus", "政治面貌"],
  ["maritalStatus", "婚姻状况"],
  ["wechat", "微信"],
  ["website", "个人网站"],
  ["github", "GitHub"],
] as const;

function renderWordPersonalFallbackBlock(
  personal: PersonalInfo,
  usedFields: Array<(typeof WORD_PERSONAL_FALLBACK_FIELDS)[number][0]>
) {
  const used = new Set<string>(usedFields);
  const rows = WORD_PERSONAL_FALLBACK_FIELDS.map(([field, label]) => {
    const value = personal[field];
    if (used.has(field) || typeof value !== "string" || !value.trim()) {
      return "";
    }

    return `<div><span style="font-weight:700;">${escapeHtml(label)}：</span>${escapeHtml(value.trim())}</div>`;
  }).filter(Boolean);

  if (!rows.length) {
    return "";
  }

  return `
    <div style="margin-top:10px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px 14px;font-size:${resolveBodyFontSize(
      11.6
    )}px;line-height:${resolveBodyLineHeight(1.65)};color:#475569;">
      ${rows.join("")}
    </div>
  `;
}

function renderTemplate1Education(section: ResumeSection) {
  const items = section.content as EducationItem[];
  return `
    ${sectionHeading(section.title)}
    ${items
      .map((item) => {
        const title = [item.school, item.degree].filter(Boolean).join("，");
        return `
          ${threeColRow(title, "", formatPeriod(item.startDate, item.endDate), {
            bold: true,
            leftWidth: "72%",
            rightWidth: "28%",
          })}
          ${renderDescription(item.description)}
        `;
      })
      .join("")}
  `;
}

function renderTemplate1Experience(section: ResumeSection) {
  const items = section.content as ExperienceItem[];
  return `
    ${sectionHeading(section.title)}
    ${items
      .map(
        (item) => `
          ${threeColRow(item.company, item.role, formatPeriod(item.startDate, item.endDate), {
            bold: true,
            leftWidth: "40%",
            rightWidth: "24%",
            middleAlign: "center",
          })}
          ${renderDescription(item.description, { preferLabeled: true })}
        `
      )
      .join("")}
  `;
}

function renderTemplate1Projects(section: ResumeSection) {
  const items = section.content as ProjectItem[];
  return `
    ${sectionHeading(section.title)}
    ${items
      .map(
        (item) => `
          ${threeColRow(item.name, item.role || "", formatPeriod(item.startDate, item.endDate), {
            bold: true,
            leftWidth: "48%",
            rightWidth: "22%",
            middleAlign: "center",
          })}
          ${renderDescription(item.description, { preferLabeled: true })}
        `
      )
      .join("")}
  `;
}

function renderTemplate1Skills(section: ResumeSection) {
  const items = section.content as SkillItem[];
  return `
    ${sectionHeading(section.title)}
    ${textLines(items.map((item) => item.name))}
  `;
}

function renderThreeColSection(
  section: ResumeSection,
  mode: "plain" | "blue",
  itemType: "education" | "experience" | "projects",
  options?: {
    leftWidth?: string;
    rightWidth?: string;
    middleAlign?: string;
    preferLabeled?: boolean;
    leftFromPeriod?: boolean;
  }
) {
  const heading =
    mode === "blue" ? sectionHeading(section.title) : sectionHeading(section.title, "#111827", "plain");

  const items =
    itemType === "education"
      ? (section.content as EducationItem[])
      : itemType === "experience"
        ? (section.content as ExperienceItem[])
        : (section.content as ProjectItem[]);

  return `
    ${heading}
    ${items
      .map((item) => {
        if (itemType === "education") {
          const education = item as EducationItem;
          return `
            ${threeColRow(
              formatPeriod(education.startDate, education.endDate),
              education.school,
              education.degree,
              {
                bold: true,
                leftWidth: options?.leftWidth ?? "22%",
                rightWidth: options?.rightWidth ?? "26%",
                middleAlign: options?.middleAlign ?? "center",
              }
            )}
            ${renderDescription(education.description)}
          `;
        }

        if (itemType === "experience") {
          const experience = item as ExperienceItem;
          return `
            ${threeColRow(
              formatPeriod(experience.startDate, experience.endDate),
              experience.company,
              experience.role,
              {
                bold: true,
                leftWidth: options?.leftWidth ?? "22%",
                rightWidth: options?.rightWidth ?? "28%",
                middleAlign: options?.middleAlign ?? "center",
              }
            )}
            ${renderDescription(experience.description, {
              preferLabeled: options?.preferLabeled,
            })}
          `;
        }

        const project = item as ProjectItem;
        return `
          ${threeColRow(
            formatPeriod(project.startDate, project.endDate),
            project.name,
            project.role || "",
            {
              bold: true,
              leftWidth: options?.leftWidth ?? "22%",
              rightWidth: options?.rightWidth ?? "20%",
              middleAlign: options?.middleAlign ?? "center",
            }
          )}
          ${renderDescription(project.description, {
            preferLabeled: options?.preferLabeled,
          })}
        `;
      })
      .join("")}
  `;
}

function renderRowsWithHeading(
  section: ResumeSection,
  headingHtml: string,
  itemType: "education" | "experience" | "projects",
  options?: {
    leftWidth?: string;
    rightWidth?: string;
    middleAlign?: string;
    preferLabeled?: boolean;
    descriptionStyle?: "bullet" | "diamond" | "star" | "text";
  }
) {
  const renderDesc = (description: string) => {
    const lines = splitLines(description);
    if (options?.descriptionStyle === "diamond") {
      return diamondBullets(lines);
    }
    if (options?.descriptionStyle === "star") {
      return starBullets(lines);
    }
    return renderDescription(description, { preferLabeled: options?.preferLabeled });
  };

  const items =
    itemType === "education"
      ? (section.content as EducationItem[])
      : itemType === "experience"
        ? (section.content as ExperienceItem[])
        : (section.content as ProjectItem[]);

  return `
    ${headingHtml}
    ${items
      .map((item) => {
        if (itemType === "education") {
          const education = item as EducationItem;
          return `
            ${threeColRow(
              formatPeriod(education.startDate, education.endDate),
              education.school,
              education.degree,
              {
                bold: true,
                leftWidth: options?.leftWidth ?? "24%",
                rightWidth: options?.rightWidth ?? "24%",
                middleAlign: options?.middleAlign ?? "center",
              }
            )}
            ${renderDesc(education.description)}
          `;
        }

        if (itemType === "experience") {
          const experience = item as ExperienceItem;
          return `
            ${threeColRow(
              formatPeriod(experience.startDate, experience.endDate),
              experience.company,
              experience.role,
              {
                bold: true,
                leftWidth: options?.leftWidth ?? "24%",
                rightWidth: options?.rightWidth ?? "24%",
                middleAlign: options?.middleAlign ?? "center",
              }
            )}
            ${renderDesc(experience.description)}
          `;
        }

        const project = item as ProjectItem;
        return `
          ${threeColRow(
            formatPeriod(project.startDate, project.endDate),
            project.name,
            project.role || "",
            {
              bold: true,
              leftWidth: options?.leftWidth ?? "24%",
              rightWidth: options?.rightWidth ?? "24%",
              middleAlign: options?.middleAlign ?? "center",
            }
          )}
          ${renderDesc(project.description)}
        `;
      })
      .join("")}
  `;
}

function renderTemplate4Section(section: ResumeSection) {
  if (section.type === "education") {
    return `
      ${sectionHeading(section.title, "#111827", "gray")}
      ${(section.content as EducationItem[])
        .map((item) =>
          fourColRow(
            [
              formatPeriod(item.startDate, item.endDate),
              item.school,
              item.degree,
              item.location || "",
            ],
            ["20%", "18%", "37%", "25%"]
          )
        )
        .join("")}
    `;
  }

  if (section.type === "skills") {
    return `
      ${sectionHeading(section.title, "#111827", "gray")}
      ${bulletList((section.content as SkillItem[]).map((item) => item.name))}
    `;
  }

  const items =
    section.type === "experience"
      ? (section.content as ExperienceItem[])
      : (section.content as ProjectItem[]);

  return `
    ${sectionHeading(section.title, "#111827", "gray")}
    ${items
      .map((item) => {
        const name =
          section.type === "experience"
            ? (item as ExperienceItem).company
            : (item as ProjectItem).name;
        const role =
          section.type === "experience"
            ? (item as ExperienceItem).role
            : (item as ProjectItem).role || "";
        const period =
          section.type === "experience"
            ? formatPeriod((item as ExperienceItem).startDate, (item as ExperienceItem).endDate)
            : formatPeriod((item as ProjectItem).startDate, (item as ProjectItem).endDate);
        const description = item.description;

        return `
          ${threeColRow(name, role, period, {
            bold: true,
            leftWidth: "44%",
            rightWidth: "30%",
            middleAlign: "center",
          })}
          ${renderDescription(description)}
        `;
      })
      .join("")}
  `;
}

function renderPlainSkillSection(section: ResumeSection) {
  return `
    ${sectionHeading(section.title, "#111827", "plain")}
    ${bulletList((section.content as SkillItem[]).map((item) => item.name))}
  `;
}

function renderListSection(
  headingHtml: string,
  items: string[],
  style: "bullet" | "diamond" | "star" | "text" | "numbered" = "bullet"
) {
  let body = "";
  if (style === "diamond") {
    body = diamondBullets(items);
  } else if (style === "star") {
    body = starBullets(items);
  } else if (style === "text") {
    body = textLines(items);
  } else if (style === "numbered") {
    body = numberedParagraphs(items);
  } else {
    body = bulletList(items);
  }

  return `
    ${headingHtml}
    ${body}
  `;
}

function labelValue(label: string, value: string) {
  return `<div style="margin:2px 0;"><span style="display:inline-block;min-width:58px;">${escapeHtml(
    label
  )}</span>${escapeHtml(value)}</div>`;
}

function infoPairsBlock(
  leftPairs: Array<[string, string]>,
  rightPairs: Array<[string, string]>,
  avatarUrl: string,
  options?: { lineColor?: string; photoWidth?: number; photoHeight?: number }
) {
  return `
    <div style="border-top:1px solid ${options?.lineColor ?? "#8da9c6"};padding-top:10px;display:flex;gap:18px;align-items:flex-start;">
      <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;column-gap:26px;row-gap:4px;font-size:12.5px;line-height:1.75;">
        <div>${leftPairs.map(([label, value]) => labelValue(label, value)).join("")}</div>
        <div>${rightPairs.map(([label, value]) => labelValue(label, value)).join("")}</div>
      </div>
      <img src="${avatarUrl}" alt="resume avatar" style="width:${options?.photoWidth ?? 116}px;height:${options?.photoHeight ?? 154}px;object-fit:cover;border:1px solid #d8dee7;background:#f8fafc;" />
    </div>
  `;
}

function topBannerHeader(options: {
  titleColor: string;
  accentLeft: string;
  accentRight: string;
  title: string;
  englishTitle: string;
  subtitle?: string;
  icons?: string[];
  iconsBg?: string;
}) {
  const accent = resolveWordAccent(options.titleColor);
  return `
    <div style="margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;">
        <div style="display:flex;align-items:flex-end;gap:14px;">
          <div style="font-size:42px;font-weight:700;letter-spacing:1px;color:${accent};line-height:1;">${escapeHtml(
            options.title
          )}</div>
          <div style="padding-left:14px;border-left:3px solid ${accent};transform:translateY(-2px);">
            ${
              options.subtitle
                ? `<div style="font-size:11px;color:${accent};font-weight:600;">${escapeHtml(
                    options.subtitle
                  )}</div>`
                : ""
            }
            <div style="font-size:25px;color:${accent};line-height:1.1;">${escapeHtml(
              options.englishTitle
            )}</div>
          </div>
        </div>
        ${
          options.icons?.length
            ? `<div style="display:flex;gap:10px;padding-bottom:4px;">
                ${options.icons
                  .map(
                    (icon) =>
                      `<div style="width:32px;height:32px;border-radius:999px;background:${options.iconsBg ?? accent};color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;">${icon}</div>`
                  )
                  .join("")}
              </div>`
            : ""
        }
      </div>
      <div style="display:flex;width:100%;height:16px;margin-top:10px;overflow:hidden;">
        <div style="flex:0 0 58%;background:${accent};clip-path:polygon(0 0,97% 0,100% 100%,0 100%);"></div>
        <div style="flex:1;background:${options.accentRight};"></div>
      </div>
    </div>
  `;
}

function ribbonSectionHeader(title: string, accent: string, lineColor?: string) {
  const resolvedAccent = resolveWordAccent(accent);
  const sectionSpacing = resolveSectionSpacing(14);
  const headingTopSpacing = resolveHeadingTopSpacing(0);
  const headingBottomSpacing = resolveHeadingBottomSpacing(6);
  return `
    <div style="display:flex;align-items:center;margin-top:${sectionSpacing}px;margin-bottom:${headingBottomSpacing}px;padding-top:${headingTopSpacing}px;">
      <div style="position:relative;padding:3px 20px 3px 18px;background:${resolvedAccent};color:#fff;font-size:14px;font-weight:700;line-height:1;">
        ${escapeHtml(title)}
        <span style="position:absolute;right:-18px;top:0;width:18px;height:100%;background:linear-gradient(45deg, transparent 50%, ${resolvedAccent} 50%);"></span>
        <span style="position:absolute;right:-30px;top:0;width:22px;height:100%;background:linear-gradient(45deg, transparent 58%, ${resolvedAccent} 58%);opacity:0.55;"></span>
      </div>
      <div style="flex:1;height:1px;background:${resolveWordAccent(lineColor ?? accent)};margin-left:18px;"></div>
    </div>
  `;
}

function simpleSectionLine(title: string, accent: string, icon?: string) {
  const resolvedAccent = resolveWordAccent(accent);
  const sectionSpacing = resolveSectionSpacing(16);
  const headingTopSpacing = resolveHeadingTopSpacing(0);
  const headingBottomSpacing = resolveHeadingBottomSpacing(6);
  return `
    <div style="display:flex;align-items:center;gap:10px;margin-top:${sectionSpacing}px;margin-bottom:${headingBottomSpacing}px;padding-top:${headingTopSpacing}px;">
      ${
        icon
          ? `<div style="width:28px;height:28px;border-radius:999px;background:${resolvedAccent};color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;">${icon}</div>`
          : ""
      }
      <div style="font-size:16px;font-weight:700;color:${resolvedAccent};">${escapeHtml(title)}</div>
    </div>
    <div style="height:1px;background:${resolvedAccent};opacity:0.55;"></div>
  `;
}

function slantedSectionHeader(title: string, accent: string, icon?: string) {
  const resolvedAccent = resolveWordAccent(accent);
  const sectionSpacing = resolveSectionSpacing(18);
  const headingTopSpacing = resolveHeadingTopSpacing(0);
  const headingBottomSpacing = resolveHeadingBottomSpacing(6);
  return `
    <div style="display:flex;align-items:center;margin-top:${sectionSpacing}px;margin-bottom:${headingBottomSpacing}px;padding-top:${headingTopSpacing}px;">
      <div style="background:${resolvedAccent};clip-path:polygon(0 0,92% 0,100% 100%,0 100%);padding:5px 20px 5px 14px;color:#fff;font-size:13px;font-weight:700;display:flex;align-items:center;gap:8px;min-width:180px;">
        ${icon ? `<span style="font-size:14px;">${icon}</span>` : ""}
        <span>${escapeHtml(title)}</span>
      </div>
      <div style="flex:1;height:0;border-top:5px solid ${resolvedAccent};margin-left:0;"></div>
    </div>
  `;
}

function capsuleSectionHeader(title: string, accent: string) {
  const resolvedAccent = resolveWordAccent(accent);
  const sectionSpacing = resolveSectionSpacing(14);
  const headingTopSpacing = resolveHeadingTopSpacing(0);
  const headingBottomSpacing = resolveHeadingBottomSpacing(6);
  return `
    <div style="display:flex;align-items:center;gap:12px;margin-top:${sectionSpacing}px;margin-bottom:${headingBottomSpacing}px;padding-top:${headingTopSpacing}px;">
      <div style="padding:5px 20px;background:${resolvedAccent};color:#fff;border-radius:999px;font-size:14px;font-weight:700;box-shadow:inset 0 0 0 2px rgba(255,255,255,0.12);">${escapeHtml(
        title
      )}</div>
      <div style="flex:1;height:1px;background:#d6d9de;"></div>
    </div>
  `;
}

function topStrip(color: string) {
  return `<div style="height:18px;background:${color};margin:-18px -18px 18px -18px;"></div>`;
}

function numberedParagraphs(items: string[]) {
  return `
    <div style="margin-top:8px;font-size:12.5px;line-height:1.9;color:#111827;">
      ${items
        .filter(Boolean)
        .map((item, index) => `<div>${index + 1}、${escapeHtml(item)}</div>`)
        .join("")}
    </div>
  `;
}

function diamondBullets(items: string[]) {
  return `
    <div style="margin-top:6px;font-size:12.5px;line-height:1.8;color:#111827;">
      ${items
        .filter(Boolean)
        .map(
          (item) =>
            `<div style="display:flex;align-items:flex-start;gap:8px;"><span style="font-size:11px;line-height:1.9;">◆</span><span>${escapeHtml(
              item
            )}</span></div>`
        )
        .join("")}
    </div>
  `;
}

function starBullets(items: string[]) {
  return `
    <div style="margin-top:6px;font-size:12.5px;line-height:1.8;color:#111827;">
      ${items
        .filter(Boolean)
        .map(
          (item) =>
            `<div style="display:flex;align-items:flex-start;gap:8px;"><span style="font-size:12px;line-height:1.8;">★</span><span>${escapeHtml(
              item
            )}</span></div>`
        )
        .join("")}
    </div>
  `;
}

function timelineSectionHeader(title: string, accent: string) {
  const resolvedAccent = resolveWordAccent(accent);
  const sectionSpacing = resolveSectionSpacing(16);
  const headingTopSpacing = resolveHeadingTopSpacing(0);
  const headingBottomSpacing = resolveHeadingBottomSpacing(6);
  return `
    <div style="display:flex;align-items:center;gap:12px;margin-top:${sectionSpacing}px;margin-bottom:${headingBottomSpacing}px;padding-top:${headingTopSpacing}px;">
      <div style="font-size:14px;font-weight:700;color:${resolvedAccent};white-space:nowrap;">${escapeHtml(title)}</div>
      <div style="flex:1;height:2px;background:${resolvedAccent};"></div>
    </div>
  `;
}

function timelineItems(
  items: Array<{ period: string; title: string; role?: string; description: string }>,
  accent: string
) {
  return `
    <div style="position:relative;margin-top:8px;">
      <div style="position:absolute;left:108px;top:0;bottom:0;width:2px;background:${accent};opacity:0.9;"></div>
      ${items
        .map(
          (item) => `
            <div style="display:grid;grid-template-columns:96px 24px 1fr;column-gap:12px;margin-bottom:14px;">
              <div style="font-size:12.5px;font-weight:700;color:#1d3557;">${escapeHtml(item.period)}</div>
              <div style="position:relative;">
                <div style="position:absolute;left:2px;top:4px;width:18px;height:18px;background:${accent};border-radius:4px;"></div>
                <div style="position:absolute;left:8px;top:24px;bottom:-14px;width:2px;background:${accent};"></div>
              </div>
              <div>
                <div style="display:grid;grid-template-columns:1fr 180px;gap:12px;font-size:12.5px;font-weight:700;color:#163252;">
                  <div>${escapeHtml(item.title)}</div>
                  <div style="text-align:right;">${escapeHtml(item.role || "")}</div>
                </div>
                <div style="margin-top:4px;font-size:12.5px;line-height:1.75;color:#111827;">
                  ${splitLines(item.description)
                    .map((line) => `<div>${escapeHtml(line)}</div>`)
                    .join("")}
                </div>
              </div>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderWordCustomSection(section: ResumeSection) {
  const content = section.content as CustomSectionContent;
  const body = splitLines(content.markdown)
    .map((line) => `<div>${escapeHtml(line)}</div>`)
    .join("");

  if (!body) {
    return "";
  }

  return `
    ${content.noHeading ? "" : sectionHeading(section.title, "#111827", "plain")}
    <div style="font-size:${resolveBodyFontSize(12.5)}px;line-height:${resolveBodyLineHeight(
      1.8
    )};color:#111827;">
      ${body}
    </div>
  `;
}

function renderWordLinksSection(section: ResumeSection) {
  const items = (section.content as LinkItem[]).filter((item) => item.label.trim() && item.url.trim());

  if (!items.length) {
    return "";
  }

  return `
    ${sectionHeading(section.title, "#111827", "plain")}
    <div style="display:flex;flex-direction:column;gap:6px;font-size:${resolveBodyFontSize(
      12.5
    )}px;line-height:${resolveBodyLineHeight(1.75)};color:#111827;">
      ${items
        .map((item) => {
          const href = normalizeHeaderHref(item.url);
          return `
            <div style="display:flex;align-items:flex-start;gap:8px;">
              <span style="margin-top:1px;">•</span>
              <a href="${escapeHtml(href)}" style="color:#111827;text-decoration:none;word-break:break-all;">
                ${escapeHtml(item.label.trim())}: ${escapeHtml(item.url.trim())}
              </a>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderWordGallerySection(section: ResumeSection) {
  const items = (section.content as GalleryItem[]).filter(
    (item) => item.title.trim() || item.imageUrl.trim() || item.description?.trim()
  );

  if (!items.length) {
    return "";
  }

  const rows: GalleryItem[][] = [];
  for (let index = 0; index < items.length; index += 2) {
    rows.push(items.slice(index, index + 2));
  }

  return `
    ${sectionHeading(section.title, "#111827", "plain")}
    <div style="display:flex;flex-direction:column;gap:12px;">
      ${rows
        .map(
          (row) => `
            <div data-page-keep="true" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;align-items:start;break-inside:avoid;page-break-inside:avoid;">
              ${row
                .map((item) => {
                  const imageMarkup = item.imageUrl.trim()
                    ? `<div style="margin-top:8px;"><img src="${escapeHtml(
                        item.imageUrl.trim()
                      )}" alt="${escapeHtml(
                        item.title.trim() || "作品图片"
                      )}" style="display:block;width:100%;height:168px;border:1px solid #d8dee8;border-radius:12px;object-fit:cover;background:#f8fafc;" /></div>`
                    : "";
                  const titleMarkup = item.title.trim()
                    ? `<div style="font-size:${resolveBodyFontSize(
                        13
                      )}px;font-weight:700;color:#111827;">${escapeHtml(item.title.trim())}</div>`
                    : "";
                  const descriptionMarkup = item.description?.trim()
                    ? `<div style="margin-top:6px;font-size:${resolveBodyFontSize(
                        12.5
                      )}px;line-height:${resolveBodyLineHeight(1.7)};color:#374151;">${splitLines(item.description)
                        .map((line) => `<div>${escapeHtml(line)}</div>`)
                        .join("")}</div>`
                    : "";

                  return `
                    <div style="padding:12px 14px;border:1px solid #e5e7eb;border-radius:16px;background:#ffffff;break-inside:avoid;page-break-inside:avoid;">
                      ${titleMarkup}
                      ${imageMarkup}
                      ${descriptionMarkup}
                    </div>
                  `;
                })
                .join("")}
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderWordFallbackSection(section: ResumeSection) {
  if (section.type === "custom") {
    return renderWordCustomSection(section);
  }

  if (section.type === "custom-links") {
    return renderWordLinksSection(section);
  }

  if (section.type === "gallery") {
    return renderWordGallerySection(section);
  }

  if (section.type === "skills") {
    return `
      ${sectionHeading(section.title, "#111827", "plain")}
      ${bulletList((section.content as SkillItem[]).map((item) => item.name))}
    `;
  }

  if (section.type === "education") {
    return `
      ${sectionHeading(section.title, "#111827", "plain")}
      ${renderRowsWithHeading(section, "", "education", {
        leftWidth: "28%",
        rightWidth: "22%",
        descriptionStyle: "text",
      })}
    `;
  }

  if (section.type === "experience") {
    return `
      ${sectionHeading(section.title, "#111827", "plain")}
      ${renderRowsWithHeading(section, "", "experience", {
        leftWidth: "28%",
        rightWidth: "22%",
        descriptionStyle: "bullet",
      })}
    `;
  }

  if (section.type === "projects") {
    return `
      ${sectionHeading(section.title, "#111827", "plain")}
      ${renderRowsWithHeading(section, "", "projects", {
        leftWidth: "24%",
        rightWidth: "20%",
        descriptionStyle: "bullet",
      })}
    `;
  }

  return "";
}

function renderTemplateSection(template: WordTemplateKey, section: ResumeSection) {
  if (section.type === "custom") {
    return renderWordCustomSection(section);
  }

  if (section.type === "custom-links") {
    return renderWordLinksSection(section);
  }

  if (section.type === "gallery") {
    return renderWordGallerySection(section);
  }

  switch (template) {
    case "bilingualResearchBlue":
      if (section.type === "education") return renderTemplate1Education(section);
      if (section.type === "experience") return renderTemplate1Experience(section);
      if (section.type === "projects") return renderTemplate1Projects(section);
      if (section.type === "skills") return renderTemplate1Skills(section);
      return "";
    case "overseasBusinessAnalyst":
      if (section.type === "education") {
        return renderThreeColSection(section, "plain", "education");
      }
      if (section.type === "experience") {
        return renderThreeColSection(section, "plain", "experience");
      }
      if (section.type === "projects") {
        return renderThreeColSection(section, "plain", "projects");
      }
      if (section.type === "skills") {
        return renderPlainSkillSection(section);
      }
      return "";
    case "productManagerBlue":
      if (section.type === "education") {
        return renderThreeColSection(section, "blue", "education", {
          leftWidth: "24%",
          rightWidth: "24%",
        });
      }
      if (section.type === "experience") {
        return renderThreeColSection(section, "blue", "experience", {
          leftWidth: "24%",
          rightWidth: "24%",
        });
      }
      if (section.type === "projects") {
        return renderThreeColSection(section, "blue", "projects", {
          leftWidth: "24%",
          rightWidth: "18%",
        });
      }
      if (section.type === "skills") {
        return `
          ${sectionHeading(section.title)}
          ${bulletList((section.content as SkillItem[]).map((item) => item.name))}
        `;
      }
      return "";
    case "hrRecruitmentTable":
      return renderTemplate4Section(section);
    case "campusOperationsDense":
      if (section.type === "education") {
        return renderThreeColSection(section, "plain", "education", {
          leftWidth: "24%",
          rightWidth: "24%",
        });
      }
      if (section.type === "experience") {
        return renderThreeColSection(section, "plain", "experience", {
          leftWidth: "24%",
          rightWidth: "24%",
        });
      }
      if (section.type === "projects") {
        return renderThreeColSection(section, "plain", "projects", {
          leftWidth: "24%",
          rightWidth: "24%",
        });
      }
      if (section.type === "skills") {
        return renderPlainSkillSection(section);
      }
      return "";
    case "personalResumeGold":
    case "personalResumeBlue": {
      const accent = template === "personalResumeGold" ? "#5c7f90" : "#5d93db";
      if (section.type === "education") {
        return renderRowsWithHeading(
          section,
          ribbonSectionHeader(section.title, accent, accent),
          "education",
          { leftWidth: "26%", rightWidth: "24%" }
        );
      }
      if (section.type === "projects") {
        return renderRowsWithHeading(
          section,
          ribbonSectionHeader(section.title, accent, accent),
          "projects",
          { leftWidth: "22%", rightWidth: "22%" }
        );
      }
      if (section.type === "experience") {
        return renderRowsWithHeading(
          section,
          ribbonSectionHeader(section.title, accent, accent),
          "experience",
          { leftWidth: "22%", rightWidth: "22%" }
        );
      }
      if (section.type === "skills") {
        return renderListSection(
          ribbonSectionHeader(section.title, accent, accent),
          (section.content as SkillItem[]).map((item) => item.name),
          section.title.includes("自我") ? "numbered" : "bullet"
        );
      }
      return "";
    }
    case "slateMarketingCampus":
      if (section.type === "education") {
        return renderRowsWithHeading(
          section,
          slantedSectionHeader(section.title, "#5f718d", "🎓"),
          "education",
          { leftWidth: "28%", rightWidth: "24%" }
        );
      }
      if (section.type === "projects") {
        return renderRowsWithHeading(
          section,
          slantedSectionHeader(section.title, "#5f718d", "👥"),
          "projects",
          { leftWidth: "24%", rightWidth: "22%", descriptionStyle: "bullet" }
        );
      }
      if (section.type === "experience") {
        return renderRowsWithHeading(
          section,
          slantedSectionHeader(section.title, "#5f718d", "💼"),
          "experience",
          { leftWidth: "28%", rightWidth: "24%", descriptionStyle: "bullet" }
        );
      }
      if (section.type === "skills") {
        return renderListSection(
          slantedSectionHeader(section.title, "#5f718d", section.title.includes("自我") ? "✎" : "📄"),
          (section.content as SkillItem[]).map((item) => item.name),
          section.title.includes("自我") ? "text" : "text"
        );
      }
      return "";
    case "roundedJobResume":
      if (section.type === "education") {
        return renderRowsWithHeading(section, capsuleSectionHeader(section.title, "#6d87af"), "education", {
          leftWidth: "22%",
          rightWidth: "22%",
        });
      }
      if (section.type === "projects") {
        return renderRowsWithHeading(section, capsuleSectionHeader(section.title, "#6d87af"), "projects", {
          leftWidth: "22%",
          rightWidth: "22%",
        });
      }
      if (section.type === "experience") {
        return renderRowsWithHeading(section, capsuleSectionHeader(section.title, "#6d87af"), "experience", {
          leftWidth: "22%",
          rightWidth: "22%",
          descriptionStyle: "bullet",
        });
      }
      if (section.type === "skills") {
        return renderListSection(
          capsuleSectionHeader(section.title, "#6d87af"),
          (section.content as SkillItem[]).map((item) => item.name),
          section.title.includes("自我") ? "text" : "bullet"
        );
      }
      return "";
    case "grayIconCampus":
      if (section.type === "education") {
        return renderRowsWithHeading(section, simpleSectionLine(section.title, "#7b7371", "🎓"), "education", {
          leftWidth: "26%",
          rightWidth: "22%",
        });
      }
      if (section.type === "projects") {
        return renderRowsWithHeading(
          section,
          simpleSectionLine(
            section.title,
            "#7b7371",
            section.title.includes("奖项") ? "🏅" : section.title.includes("技能") ? "🛠" : "🏛"
          ),
          "projects",
          { leftWidth: "22%", rightWidth: "22%" }
        );
      }
      if (section.type === "experience") {
        return renderRowsWithHeading(section, simpleSectionLine(section.title, "#7b7371", "💼"), "experience", {
          leftWidth: "22%",
          rightWidth: "22%",
        });
      }
      if (section.type === "skills") {
        return renderListSection(
          simpleSectionLine(
            section.title,
            "#7b7371",
            section.title.includes("奖项") ? "🏅" : section.title.includes("自我") ? "✎" : "🛠"
          ),
          (section.content as SkillItem[]).map((item) => item.name),
          section.title.includes("自我") ? "text" : "text"
        );
      }
      return "";
    case "cleanBusinessFormal":
      if (section.type === "education") {
        return renderRowsWithHeading(section, simpleSectionLine(section.title, "#111827"), "education", {
          leftWidth: "20%",
          rightWidth: "24%",
          descriptionStyle: "text",
        });
      }
      if (section.type === "projects") {
        return renderRowsWithHeading(section, simpleSectionLine(section.title, "#111827"), "projects", {
          leftWidth: "20%",
          rightWidth: "22%",
          descriptionStyle: "bullet",
        });
      }
      if (section.type === "experience") {
        return renderRowsWithHeading(section, simpleSectionLine(section.title, "#111827"), "experience", {
          leftWidth: "20%",
          rightWidth: "22%",
          descriptionStyle: "bullet",
        });
      }
      if (section.type === "skills") {
        return renderListSection(
          simpleSectionLine(section.title, "#111827"),
          (section.content as SkillItem[]).map((item) => item.name),
          section.title.includes("自我") ? "text" : section.title.includes("奖项") ? "star" : "text"
        );
      }
      return "";
    case "iconTargetNavy":
      if (section.type === "education") {
        return renderRowsWithHeading(section, simpleSectionLine(section.title, "#24354c", "◎"), "education", {
          leftWidth: "24%",
          rightWidth: "18%",
          descriptionStyle: "diamond",
        });
      }
      if (section.type === "experience") {
        return renderRowsWithHeading(section, simpleSectionLine(section.title, "#24354c", "◎"), "experience", {
          leftWidth: "24%",
          rightWidth: "18%",
          descriptionStyle: "diamond",
        });
      }
      if (section.type === "projects") {
        return renderRowsWithHeading(section, simpleSectionLine(section.title, "#24354c", "◎"), "projects", {
          leftWidth: "24%",
          rightWidth: "18%",
          descriptionStyle: "diamond",
        });
      }
      if (section.type === "skills") {
        return renderListSection(
          simpleSectionLine(section.title, "#24354c", "◎"),
          (section.content as SkillItem[]).map((item) => item.name),
          section.title.includes("自我") ? "diamond" : "text"
        );
      }
      return "";
    case "timelineMarketingBlue":
      if (section.type === "education") {
        return `
          ${timelineSectionHeader(section.title, "#1f3d67")}
          ${timelineItems(
            (section.content as EducationItem[]).map((item) => ({
              period: formatPeriod(item.startDate, item.endDate),
              title: item.school,
              role: item.degree,
              description: item.description,
            })),
            "#1f3d67"
          )}
        `;
      }
      if (section.type === "experience") {
        return `
          ${timelineSectionHeader(section.title, "#1f3d67")}
          ${timelineItems(
            (section.content as ExperienceItem[]).map((item) => ({
              period: formatPeriod(item.startDate, item.endDate),
              title: item.company,
              role: item.role,
              description: item.description,
            })),
            "#1f3d67"
          )}
        `;
      }
      if (section.type === "projects") {
        return `
          ${timelineSectionHeader(section.title, "#1f3d67")}
          ${timelineItems(
            (section.content as ProjectItem[]).map((item) => ({
              period: formatPeriod(item.startDate, item.endDate),
              title: item.name,
              role: item.role || "",
              description: item.description,
            })),
            "#1f3d67"
          )}
        `;
      }
      if (section.type === "skills") {
        return renderListSection(
          timelineSectionHeader(section.title, "#1f3d67"),
          (section.content as SkillItem[]).map((item) => item.name),
          "text"
        );
      }
      return "";
    case "simpleStarCampus":
      if (section.type === "education") {
        return renderRowsWithHeading(section, simpleSectionLine(section.title, "#111827"), "education", {
          leftWidth: "24%",
          rightWidth: "22%",
          descriptionStyle: "text",
        });
      }
      if (section.type === "experience") {
        return renderRowsWithHeading(section, simpleSectionLine(section.title, "#111827"), "experience", {
          leftWidth: "24%",
          rightWidth: "22%",
          descriptionStyle: "text",
        });
      }
      if (section.type === "projects") {
        return renderRowsWithHeading(section, simpleSectionLine(section.title, "#111827"), "projects", {
          leftWidth: "24%",
          rightWidth: "22%",
          descriptionStyle: "text",
        });
      }
      if (section.type === "skills") {
        return renderListSection(
          simpleSectionLine(section.title, "#111827"),
          (section.content as SkillItem[]).map((item) => item.name),
          "star"
        );
      }
      return "";
    default:
      return "";
  }
}

function buildTemplate1Sections(): ResumeSection[] {
  return [
    createPersonalSection("bilingualResearchBlue", {
      name: "林知夏",
      title: "",
      phone: "+86 155-XXXX-9170",
      email: "hXXXn@foxmail.com",
      wechat: "dXXXX",
      location: "",
      avatar: FEMALE_AVATAR,
      summary: "",
    }),
    createEducationSection("bilingualResearchBlue", "教育背景 / Education", [
      educationItem(
        "edu-1",
        "某某大学",
        "硕士，商业分析专业",
        "2019/08",
        "2020/11",
        "“Talkpush” 人工智能招聘平台建设项目组成员。"
      ),
      educationItem(
        "edu-2",
        "某某大学",
        "学士，国际经济与贸易专业",
        "2015/09",
        "2019/07",
        "GPA：4.13 / 5（排名：2 / 86）；国家奖学金（Top 1%）、一等奖学金、优秀学生干部奖学金。\n暨南大学校团委组织部副部长；“工商银行杯”全国青年商战大赛二等奖（Top 6%）。"
      ),
    ]),
    createExperienceSection("bilingualResearchBlue", "实习经历 / Experience", [
      experienceItem(
        "exp-1",
        "某某公司音乐业务线",
        "市场与用户研究助理",
        "2020/03",
        "至今",
        "市场研究：利用 QuestMobile 和 App Annie 数据库监控音乐、视频、社交等泛娱乐赛道市场数据及竞品动态，输出月度分析报告。\n用户研究：利用 SPSS 清洗处理问卷数据并开展定量分析，实习期间共访谈 35+ 位用户，推动 2 个业务策略落地。"
      ),
      experienceItem(
        "exp-2",
        "某某某某公司商业智能部",
        "市场与用户研究实习生",
        "2018/12",
        "2019/05",
        "市场研究：扫描目标商品市场并整合信息，独立完成 20+ 份商品分析报告并完善数据分析指标体系。\n用户研究：协助设计并投放 3 个项目的全国性调研问卷，成功邀约 40+ 位目标用户并建立关系库。"
      ),
      experienceItem(
        "exp-3",
        "某某某咨询公司",
        "咨询实习生",
        "2018/09",
        "2018/11",
        "行业调研：搜集整理行业数据，输出 60 页 PPT 的行业研究报告。\n竞品分析：完成 4 家行业标杆公司的分析，并结合内部调研提出主体业务方向与产品策略。"
      ),
    ]),
    createProjectsSection("bilingualResearchBlue", "项目经历 / Project", "project-main", [
      projectItem(
        "proj-1",
        "某公司“未来之眼”文娱研究项目",
        "高校研究员",
        "2019/04",
        "2019/10",
        "趋势挖掘：通过榜单监测、社交舆情观察等方式追踪影视、游戏、网文等圈层动态，累计形成 20+ 个研究主题周报。\n课题研究：针对文娱领域前沿课题展开桌面研究、深度访谈和产品体验，为产品研发、运营与商业化提供思路。"
      ),
    ]),
    createSkillsSection("bilingualResearchBlue", "其他技能 / Skills", [
      skillItem("skill-1", "计算机：Eviews、MySQL、Python、R、Tableau，熟练使用 Word、Excel、PPT。"),
      skillItem("skill-2", "英语：雅思 7，听说读写熟练。"),
    ]),
  ];
}

function buildTemplate2Sections(): ResumeSection[] {
  return [
    createPersonalSection("overseasBusinessAnalyst", {
      name: "陈思远",
      title: "",
      phone: "138****5678",
      email: "23***sa@outlook.com",
      wechat: "sa***23",
      location: "",
      avatar: FEMALE_AVATAR,
      summary: "",
    }),
    createEducationSection("overseasBusinessAnalyst", "教育背景", [
      educationItem(
        "edu-1",
        "澳大利亚 XXXX 大学（QS 排名 XX）",
        "商业分析（硕士）",
        "2021.07",
        "2023.07",
        "主修课程：数据可视化、数字化转型战略分析、SQL、TCP/IP 协议及网络分层、系统架构管理、项目管理。"
      ),
      educationItem(
        "edu-2",
        "澳洲 XXX 大学",
        "金融风险（本科）",
        "2018.07",
        "2021.07",
        "主修课程：证券投资组合、期货及衍生品、统计学、风险管理；辅修：社会发展心理学、日语。"
      ),
    ]),
    createExperienceSection("overseasBusinessAnalyst", "实习经历", [
      experienceItem(
        "exp-1",
        "广州 XXXXXXX 科技有限公司",
        "市场分析实习生（在线）",
        "2021.09",
        "2021.12",
        "数据跟踪：参与 XXXX 免税店数据运营项目，跟踪北京、上海等 9 个地区免税店小程序中的相关数据。\n数据分析及报告：撰写每日与每周分析报告，并制作英文 PPT 交付，在 10 名实习生中获得 A+ 评级。\n竞品活动分析：使用 Python 高效处理 3 大类活动数据，为后续运营策略提供支撑。"
      ),
    ]),
    createProjectsSection("overseasBusinessAnalyst", "项目/校园经历", "project-main", [
      projectItem(
        "proj-1",
        "XXXXX 零售集团运营分析",
        "个人项目",
        "2021.02",
        "2021.04",
        "项目管理：独立开展项目，从 0-1 完成背景及数据方案设计、计划制定、项目推进和成果答辩。\n市场分析：展开公司内外部环境、竞品及用户分析，梳理现有运营策略与用户满意度。\n数据可视化：使用 Excel、Numbers、Tableau 等工具完成财务数据可视化。\n运营策略制定：形成运营优化方案，汇报中 80% 的策略被管理层采纳。"
      ),
      projectItem(
        "proj-2",
        "XXXXX 公司综合分析",
        "项目组长",
        "2020.09",
        "2020.12",
        "竞品分析：带领团队开展案头研究与实地考察，联合 SWOT 与波特五力模型进行市场判断。\n痛点诊断：完成数字化转型问题诊断，为公司制定转型方案。\n流程设计：绘制逻辑图与商业流程图，优化项目展示效果。\n落地分析：实地访谈运营人员，验证方案的可行性与有效性。"
      ),
      projectItem(
        "proj-3",
        "XXX 大学 XXX 社团",
        "活动部部长",
        "2018.11",
        "2020.10",
        "活动需求分析：设计问卷调研活动需求，转化为具体方案，拉动活动参与人数增长。\n活动策划：主导策划 10 次以上活动，完成活动创意输出、流程设计与现场执行。\n社团运营：推进精细化管理，账号阅读量月均提升 20%。\n跨部门协调：对接赞助、供应商等多方资源，推动活动顺利落地。"
      ),
    ]),
    createSkillsSection("overseasBusinessAnalyst", "技能/优势及其他", [
      skillItem("skill-1", "语言：英语听说读写熟练，可独立撰写英文报告（雅思 6.5）；初级日语口语水平。"),
      skillItem("skill-2", "专业技能：Python、SQL、Excel、Tableau、XMind；擅长制作商业流程图与 PRD 文档。"),
      skillItem("skill-3", "自我评价：具备商业分析、项目管理与多类型数据处理能力，曾多次担任 team leader。"),
    ]),
  ];
}

function buildTemplate3Sections(): ResumeSection[] {
  return [
    createPersonalSection("productManagerBlue", {
      name: "张明远",
      title: "产品经理",
      targetRole: "产品经理",
      phone: "（+86）199-XXXX-0688",
      email: "ziqXXXXX@163.com",
      wechat: "616XXXX992",
      location: "",
      avatar: MALE_AVATAR,
      summary: "",
    }),
    createEducationSection("productManagerBlue", "教育背景", [
      educationItem(
        "edu-1",
        "某某大学",
        "商业信息系统硕士",
        "2018.02",
        "2019.12",
        "主修课程：系统分析与设计、项目管理、商业智能建模、基础数据库操作、Java 基础、数据科学等。"
      ),
      educationItem(
        "edu-2",
        "某某某大学",
        "地球与大气科学学士",
        "2013.09",
        "2017.12",
        "主修课程：海洋与大气动力学、计算机基础理论、地理信息系统与遥感等；荣誉奖项：优秀国际学生入学奖学金。"
      ),
    ]),
    createExperienceSection("productManagerBlue", "实习经历", [
      experienceItem(
        "exp-1",
        "Altitude Communications（澳洲）",
        "商业分析师实习",
        "2020.04",
        "2020.07",
        "全英文交流：接待到店客户，协助其购买合约机、办理手机卡、转换手机套餐，并查询 NBN 可用性及网络业务。\n新客户开拓：通过电话和实地形式陌拜了解客户需求，按企业类型、规模和使用部门等信息为 8 位企业客户制定内部通讯方案。\n跨部门沟通：运用公司 Sales Forces 云端 CRM 创建、跟进和归类客户订单（45+ 份），并联动相关部门完成交付。"
      ),
    ]),
    createProjectsSection("productManagerBlue", "项目经历", "project-main", [
      projectItem(
        "proj-1",
        "Quitpathway 戒烟网站网页应用开发项目",
        "团队组长",
        "2019.08",
        "2019.11",
        "团队管理：带领 5 人多文化团队从 0 到 1 开发一款帮助 25-40 岁吸烟者戒烟的网页产品，组织每周例会并使用 Leankit 管理任务进度。\n产品原型设计：使用“墨刀”完成原型绘制，结合 LucidChart 绘制用户故事，并独立撰写 12000+ 字产品需求文档。\n产品迭代测试：对 18 位潜在用户进行三轮迭代测试，持续优化核心计算器、戒烟方法和身体变化模块。"
      ),
      projectItem(
        "proj-2",
        "RMIT Academic Management System 项目管理",
        "团队组员",
        "2018.04",
        "2018.06",
        "项目管理：在 4 人团队中从时间、范围和成本三方面完成系统改造建议，累计撰写 50+ 份文档。\n网络图绘制：使用 LucidChart 和 Gantt Chart 绘制多层级网络图，为关键活动提供清晰视图。\n成本管理：结合 WBS 与 Function Point System 估算成本，得到新系统成本显著下降的结论。"
      ),
    ]),
    createProjectsSection("productManagerBlue", "校园经历", "project-campus", [
      projectItem(
        "proj-3",
        "Zoover International Travel Club 某某分社",
        "活动部部长",
        "2018.03",
        "2019.11",
        "带领 25 名社员，多次组织策划跨部门线下活动，包括主题选定、赞助拉取、前期宣传和当天控场。\n主持 “Memory of Childhood Party” 与 “2019 S/S Welcome Party”，沉淀后续活动执行模板。\n协助举办 “2019 留学生嘉年华”（8000+ 人流量），负责场控及机动事项，并获“优秀志愿者”证书。"
      ),
    ]),
    createSkillsSection("productManagerBlue", "技能特长", [
      skillItem("skill-1", "语言：英语流利（七年海外生活，有国外企业实习经历）。"),
      skillItem("skill-2", "计算机：Excel（Vlookup、Solver）、SAP S/4HANA、基础 SQL；了解 Java、R、Python、Linux。"),
      skillItem("skill-3", "商业分析：Agile、LucidChart、墨刀、Stella Architect、ExtendSim 等。"),
    ]),
  ];
}

function buildTemplate4Sections(): ResumeSection[] {
  return [
    createPersonalSection("hrRecruitmentTable", {
      name: "赵思涵",
      title: "",
      phone: "(+1) 614-xxx-9944",
      email: "zhxxxxx@sina.com",
      location: "",
      avatar: FEMALE_AVATAR,
      summary: "",
    }),
    createEducationSection("hrRecruitmentTable", "教育背景", [
      educationItem(
        "edu-1",
        "某某大学",
        "公司与组织沟通 / 人力资源管理 / 硕士",
        "2019.09",
        "2020.12",
        "",
        "波士顿，美国"
      ),
      educationItem(
        "edu-2",
        "某某大学",
        "人力资源管理 / 本科",
        "2018.08",
        "2019.06",
        "",
        "底特律，美国"
      ),
      educationItem(
        "edu-3",
        "天津某学院",
        "人力资源管理 / 本科",
        "2015.09",
        "2018.06",
        "",
        "天津，中国"
      ),
    ]),
    createExperienceSection("hrRecruitmentTable", "实践经历", [
      experienceItem(
        "exp-1",
        "深圳市某某生物工程股份有限公司",
        "人事部 / 招聘助理",
        "2018.05",
        "2018.06",
        "协助 15+ 个岗位招聘，独立撰写职位描述并发布在智联招聘、前程无忧、猎聘等网站，每日处理 200+ 份简历。\n独立在各大招聘网站进行简历初筛，每日针对财务与职能类岗位搜集 50+ 份简历，并协调用人经理、业务部门及候选人安排面试。\n协助校园招聘，利用 Excel 独立整理 2000+ 份简历并录入公司人才库，为后续招聘提供保障。"
      ),
      experienceItem(
        "exp-2",
        "中国某行某庄分行",
        "人事部 / 人事助理",
        "2017.06",
        "2017.08",
        "参与制定并完善档案管理制度、流程和操作规范，协助员工档案信息化建设，整理 150+ 份员工档案。\n负责新员工入职事务，包括手续办理、信息录入及员工建档，并编制员工花名册。\n负责劳动合同签订与归档，使用 Excel 编制合同统计表，显著提升工作效率。"
      ),
    ]),
    createProjectsSection("hrRecruitmentTable", "校园经历", "project-campus", [
      projectItem(
        "proj-1",
        "天津某大学人文学院学生会",
        "学习部 / 部长",
        "2016.09",
        "2017.06",
        "负责学习部学期整体规划和工作安排，生成活动安排与工作计划，分配任务并监督执行。\n负责学院教学质量管理，带领 5 名干事每周进行出勤和课堂纪律检查，为提升教学质量提供依据。\n策划组织第一届英语辩论比赛，共吸引 9 个专业 54 名同学参赛，举办 12 场比赛，历时 35 天。"
      ),
      projectItem(
        "proj-2",
        "天津某大学人文学院学生会",
        "生活部 / 副部长",
        "2015.09",
        "2016.06",
        "协助策划开展宿舍文化节、院级元旦晚会等校园活动，负责活动宣传、需求收集等，丰富学生课余生活。\n推动与校外组织的公益合作项目，发起“旧衣旧书公益回收捐赠”活动。\n制定并完善宿舍卫生检查制度，以定期与不定期抽查结合的方式推进校园卫生管理。"
      ),
    ]),
    createProjectsSection("hrRecruitmentTable", "项目经历", "project-main", [
      projectItem(
        "proj-3",
        "某某大学 - 交流评估项目：对公司与组织沟通专业领域论坛进行评估",
        "",
        "2020.07",
        "2020.09",
        "参与三人团队对 LinkedIn 领域交流活动进行受众分析，使用 SurveyMonkey 制定调研问卷并向 522 位成员发放，问卷回收率超过 85%，结合 SPSS 进行数据分析并提出沟通建议。"
      ),
    ]),
    createSkillsSection("hrRecruitmentTable", "技能 & 爱好", [
      skillItem("skill-1", "计算机：数据分析（R 语言），熟练操作办公软件（Excel、Word、PowerPoint）。"),
      skillItem("skill-2", "英语能力：托福 108，英语听说读写熟练。"),
      skillItem("skill-3", "爱好：钢琴、健身、户外运动。"),
    ]),
  ];
}

function buildTemplate5Sections(): ResumeSection[] {
  return [
    createPersonalSection("campusOperationsDense", {
      name: "黄浩然",
      title: "",
      phone: "(+86)139-XXXX-6676",
      email: "huaXXXXuoli_@163.com",
      wechat: "hzXXXX0373",
      location: "",
      avatar: FEMALE_AVATAR,
      summary: "",
    }),
    createEducationSection("campusOperationsDense", "教育背景", [
      educationItem(
        "edu-1",
        "某某师范大学（985 工程）",
        "中共党史 / 硕士",
        "2018.09",
        "2021.07",
        "GPA：3.87/4.0（1/7） 教育部社科青年项目《非公经济组织区域化党建参与意愿的影响因素和提升路径研究》。\n相关课程：政治学研究方法、STATA、党的建设专题研究、中国资本市场政治学研究、当代中国的政治经济分析。"
      ),
      educationItem(
        "edu-2",
        "某某师范大学（211 工程）",
        "行政管理 / 学士",
        "2014.09",
        "2018.07",
        "GPA：3.85/4.0（Top 3%） 教育部国家奖学金、校“十大科技之星”、“挑战杯”全国三等奖、“互联网+”省级三等奖。\n相关课程：当代中国政府与政治、人力资源开发与管理、项目与战略管理、社会调查理论与方法、组织行为学、社会心理学。"
      ),
    ]),
    createExperienceSection("campusOperationsDense", "实习经历", [
      experienceItem(
        "exp-1",
        "某某出行",
        "电池事业部 / 产品运营",
        "2020.06",
        "2020.08",
        "内容文案转化：运用 XMind 梳理并优化新产品内容体系，结合使用场景厘清用户需求、产品功效和核心卖点，独立策划 Banner 与 H5 页面文案。\n市场运营支持：调研新产品用户使用意愿，筛选整合 2000+ 加盟商线索，推进 200W 用户量级的平台导流推广，月付费转化率由 11% 提升到 24%。\n公众号运营：独立负责“换电”新业务微信公众号编辑与涨粉活动，1 个月内用户数从 5000+ 突破 1w。\n用户触达：围绕“用户意愿采集 - 下单路线优化”输出 MRD 文档，并定期进行 Push 触达和短信推送。"
      ),
      experienceItem(
        "exp-2",
        "某某智库",
        "资源中心 / 项目运营",
        "2019.07",
        "2019.11",
        "产业升级调研：10 天内走访 17 家科技技术转移部门，输出 15w+ 字调研报告，支持产学研行业分析与新项目落地。\n商务对接洽谈：收集政府和企业技改需求，制作调研简报和项目汇报 PPT，协助区域商务接待与洽谈。\n项目策划申报：完成 4 份“十四五营商环境优化课题”申报材料。\n活动运营执行：对接京东、爱库存、快仓等标杆企业，实习生项目考评获 A。"
      ),
    ]),
    createProjectsSection("campusOperationsDense", "校园经历", "project-campus", [
      projectItem(
        "proj-1",
        "“小红书”主题互联网产品实战培训项目",
        "",
        "2020.06",
        "",
        "市场调研：以小红书为对象进行需求调研、功能设计和活动运营学习，访谈种子用户并提出邀请好友、团购等优化方向。\n竞品分析：以小红书为参照，从产品定位、市场和功能等维度对比分析网易考拉，输出产品体验与竞品分析报告。\n运营策划：结合小红书 UGC 运营模式，分析短视频选题策略，制定产品活动推广方案。"
      ),
      projectItem(
        "proj-2",
        "某某师范大学校研究生会",
        "学术交流中心主任",
        "2019.06",
        "2020.09",
        "品牌活动推广：带领 51 人团队承办 2 场研讨会、校级讲座和系列论坛，推动学生用户参与增长 21.5%。\n赛事社群运营：建立 200+ 人赛事社群，通过赛事资讯、经验分享和福利发放提升社群活跃。\n团队招新管理：负责年度招新工作，撰写宣传文案、完成简历初筛和面试，并通过内部考核机制强化团队参与。"
      ),
      projectItem(
        "proj-3",
        "“人工智能赋能新时代”2018 第一届世界人工智能大会项目",
        "",
        "2018.09",
        "",
        "论坛服务：负责“智引万物”人工智能平台主题论坛的信息咨询工作，引导并接待国内外嘉宾，以及论坛和企业讲解。"
      ),
    ]),
    createSkillsSection("campusOperationsDense", "技能特长", [
      skillItem("skill-1", "语言：英语（CET-6）。"),
      skillItem("skill-2", "计算机：计算机二级（高级 Office）、设计类（PPT、PS）、思维类（XMind、Visio）、基础数据分析（SPSS）。"),
      skillItem("skill-3", "爱好：乒乓球、羽毛球（高远球）、硬笔书法，热爱挖掘优质韩剧及 OST。"),
    ]),
  ];
}

function buildTemplate6Sections(): ResumeSection[] {
  return [
    createPersonalSection("personalResumeGold", {
      name: "小豆",
      phone: "13888888888",
      email: "88888@163.com",
      location: "浙江省杭州市滨江区",
      ethnicity: "汉",
      birthDate: "20xx.05",
      height: "167cm",
      politicalStatus: "团员",
      graduateSchool: "XX 科技大学",
      education: "本科",
      avatar: FEMALE_AVATAR,
      summary: "",
    }),
    createEducationSection("personalResumeGold", "教育背景", [
      educationItem(
        "edu-1",
        "XX 大学",
        "市场营销（本科）",
        "20xx.07",
        "20xx.06",
        "主修课程：管理学、微观经济学、宏观经济学、管理信息系统、统计学、会计学、财务管理、市场营销、经济法、消费者行为学、国际市场营销。"
      ),
    ]),
    createProjectsSection("personalResumeGold", "在校经历", "campus", [
      projectItem(
        "proj-1",
        "XX 大学学生会",
        "干事",
        "20xx.04",
        "至今",
        "积极参与学生会的各项活动，与其他干事一起参与各类学生活动的策划。\n负责学院活动的赞助拉取，制作活动赞助方案，并上门拜访企业拉取赞助。\n完成其他学生会的工作任务，成功举办多次大型活动，如“迎新晚会”“送毕业生晚会”等。\n利用寒暑假从事家教、勤工助学工作，利用课外周末时间进行社会兼职，积极参加学校组织的公益活动。"
      ),
    ]),
    createSkillsSection("personalResumeGold", "技能证书", [
      skillItem("skill-1", "专业技能：会计从业资格证书、助理会计师资格证（初级会计师资格证）。"),
      skillItem("skill-2", "软件技能：计算机《二级 MS Office 高级应用》《二级 Access 数据库》证书。"),
      skillItem("skill-3", "语言能力：通过大学英语六级、普通话二级甲等。"),
      skillItem("skill-4", "计算机能力：通过全国计算机等级考试（二级 C），熟练掌握 Word、Excel、PPT 等日常办公。"),
    ]),
    createSkillsSection("personalResumeGold", "自我评价", [
      skillItem("skill-5", "通过在校期间的学习，掌握了专业相关知识技能，并有着良好的道德修养和专业素养。"),
      skillItem("skill-6", "具有良好的团队精神，为人诚实可靠，品行端正，具有亲和力，独立完成工作能力强。"),
      skillItem("skill-7", "良好的沟通技巧并且具有高度的敬业精神和团队精神，有良好的组织判断能力和公关能力。"),
      skillItem("skill-8", "能承受工作压力，处事认真谨慎，注重工作效率，有很好的团队精神。"),
    ]),
  ];
}

function buildTemplate7Sections(): ResumeSection[] {
  return [
    createPersonalSection("slateMarketingCampus", {
      name: "胡小豆",
      targetRole: "市场销售工作",
      phone: "88888888888",
      email: "00000@xx.com",
      birthDate: "20XX.05.07",
      currentCity: "江苏南通市",
      avatar: MALE_AVATAR,
      summary: "",
    }),
    createEducationSection("slateMarketingCampus", "教育背景", [
      educationItem(
        "edu-1",
        "上海同济大学",
        "会计学（本科）",
        "20XX.09",
        "20XX.6",
        "主修课程：关系型数据库、基础会计、财务与金融基础知识、税收基础、统计基础知识、经济法律法规、会计基本技能、企业财务筹资、财务管理、政府与非营利组织会计、会计电算化、审计基础知识、会计模拟实习、成本会计、工业经济学基础知识、成本会计模拟。"
      ),
    ]),
    createProjectsSection("slateMarketingCampus", "校园经历", "campus", [
      projectItem(
        "proj-1",
        "XX 大学",
        "部门干事",
        "20XX.8",
        "20XX.7",
        "团队管理：负责拆解社团工作目标，制定工作计划等工作，社团年度工作计划完成率高达 100%。\n活动统筹：制定纳新计划，介绍工作内容和收获，每年纳新人员 XX 人，确保社群各项事务开展。"
      ),
      projectItem(
        "proj-2",
        "XX 大学",
        "社团干事",
        "20XX.8",
        "20XX.7",
        "担任大学技术部海报制作干事，负责策划、设计和制作校园活动海报，参与创意话题的讨论等；与团队成员灵活切合作，进行海报内容和样式的讨论和协商，充分发挥团队协作和沟通能力，确保海报制作的高质量和时效性。"
      ),
    ]),
    createSkillsSection("slateMarketingCampus", "技能证书", [
      skillItem("skill-1", "学习成绩 GPA 3.7/4.3（优秀），平均分 87.34，连续 4 次获得专项奖学金（专业第一）。"),
      skillItem("skill-2", "英语技能：托福成绩 10120XX 秀），大学英语 6 级 558 分（优秀）。"),
      skillItem("skill-3", "财务课程：完成财务相关课程：跨级（94/100）、财务管理（97/100）、经济法（88/100）。"),
      skillItem("skill-4", "交换项目：赴香港大学完成为期 4 个月的交换生项目（20XX.01-05）。"),
    ]),
    createSkillsSection("slateMarketingCampus", "自我评价", [
      skillItem("skill-5", "工作积极认真，细心负责，熟练运用办公自动化软件，善于在工作中提出问题、发现问题、解决问题。"),
      skillItem("skill-6", "有较强的分析能力；勤奋好学，踏实肯干，动手能力强，认真负责，有很强的社会责任感。"),
      skillItem("skill-7", "坚毅不拔，吃苦耐劳，喜欢和勇于迎接新挑战。"),
    ]),
  ];
}

function buildTemplate8Sections(): ResumeSection[] {
  return [
    createPersonalSection("roundedJobResume", {
      name: "胡小豆",
      targetRole: "行政经理/主管",
      phone: "158XXXX8856",
      email: "xxxx@xx.com",
      wechat: "xxxx00000",
      location: "上海市浦东区",
      age: "23",
      education: "大学本科",
      avatar: FEMALE_AVATAR,
      summary:
        "工作积极认真，细心负责，熟练运用办公自动化软件，善于在工作中提出问题、发现问题、解决问题，有较强的分析能力；勤奋好学，踏实肯干，动手能力强，认真负责，有很强的社会责任感；坚毅不拔，吃苦耐劳，喜欢和勇于迎接新挑战。",
    }),
    createEducationSection("roundedJobResume", "教育背景", [
      educationItem(
        "edu-1",
        "上海大学（本科）",
        "工商管理",
        "20XX.09",
        "20XX.07",
        "主修课程：基础会计学、货币银行学、统计学、经济法概论、财务会计学、管理学原理、组织行为学、市场营销学、国际贸易理论、国际贸易实务、人力资源开发与管理、财务管理学、企业经营战略概论、质量管理学、西方经济学等。"
      ),
    ]),
    createProjectsSection("roundedJobResume", "在校经历", "campus", [
      projectItem(
        "proj-1",
        "XX 大学",
        "部门干事",
        "20XX.8",
        "20XX.7",
        "团队管理：负责拆解社团工作目标，制定工作计划等工作，社团年度工作计划完成率高达 100%。\n活动统筹：制定纳新计划，介绍工作内容和收获，每年纳新人员 XX 人，确保社群各项事务开展。"
      ),
      projectItem(
        "proj-2",
        "XX 大学",
        "社团干事",
        "20XX.8",
        "20XX.7",
        "担任大学技术部海报制作干事，负责策划、设计和制作校园活动海报，参与创意话题的讨论等；与团队成员灵活切合作，进行海报内容和样式的讨论和协商，充分发挥团队协作和沟通能力，确保海报制作的高质量和时效性。"
      ),
    ]),
    createSkillsSection("roundedJobResume", "职业技能", [
      skillItem("skill-1", "语言能力：大学英语 6 级证书，荣获全国大学生英语竞赛一等奖，能够熟练地进行听、说、读、写。"),
      skillItem("skill-2", "计算机：计算机二级证书，熟练操作 Windows 平台上的各类应用软件，如 Word、Excel、PowerPoint。"),
      skillItem("skill-3", "团队能力：具有丰富的团队组建与扩充经验和项目管理与协调经验，能够独挡一面。"),
    ]),
  ];
}

function buildTemplate9Sections(): ResumeSection[] {
  return [
    createPersonalSection("personalResumeBlue", {
      name: "綉梦",
      phone: "13888888888",
      email: "88888@163.com",
      location: "浙江省杭州市滨江区",
      ethnicity: "汉",
      birthDate: "20xx.05",
      height: "167cm",
      politicalStatus: "团员",
      graduateSchool: "XX 科技大学",
      education: "本科",
      avatar: FEMALE_AVATAR,
      summary: "",
    }),
    createEducationSection("personalResumeBlue", "教育背景", [
      educationItem(
        "edu-1",
        "XX 大学",
        "市场营销（本科）",
        "20xx.07",
        "20xx.06",
        "主修课程：管理学、微观经济学、宏观经济学、管理信息系统、统计学、会计学、财务管理、市场营销、经济法、消费者行为学、国际市场营销。"
      ),
    ]),
    createProjectsSection("personalResumeBlue", "在校经历", "campus", [
      projectItem(
        "proj-1",
        "XX 大学学生会",
        "干事",
        "20xx.04",
        "至今",
        "积极参与学生会的各项活动，与其他干事一起参与各类学生活动的策划。\n负责学院活动的赞助拉取，制作活动赞助方案，并上门拜访企业拉取赞助。\n完成其他学生会的工作任务，成功举办多次大型活动，如“迎新晚会”“送毕业生晚会”等。\n利用寒暑假从事家教、勤工助学工作，利用课外周末时间进行社会兼职，积极参加学校组织的公益活动。"
      ),
    ]),
    createSkillsSection("personalResumeBlue", "技能证书", [
      skillItem("skill-1", "专业技能：会计从业资格证书、助理会计师资格证（初级会计师资格证）。"),
      skillItem("skill-2", "软件技能：计算机《二级 MS Office 高级应用》《二级 Access 数据库》证书。"),
      skillItem("skill-3", "语言能力：通过大学英语六级、普通话二级甲等。"),
      skillItem("skill-4", "计算机能力：通过全国计算机等级考试（二级 C），熟练掌握 Word、Excel、PPT 等日常办公。"),
    ]),
    createSkillsSection("personalResumeBlue", "自我评价", [
      skillItem("skill-5", "通过在校期间的学习，掌握了专业相关知识技能，并有着良好的道德修养和专业素养。"),
      skillItem("skill-6", "具有良好的团队精神，为人诚实可靠，品行端正，具有亲和力，独立完成工作能力强。"),
      skillItem("skill-7", "良好的沟通技巧并且具有高度的敬业精神和团队精神，有良好的组织判断能力和公关能力。"),
      skillItem("skill-8", "能承受工作压力，处事认真谨慎，注重工作效率，有很好的团队精神。"),
    ]),
  ];
}

function buildTemplate10Sections(): ResumeSection[] {
  return [
    createPersonalSection("grayIconCampus", {
      name: "小豆",
      phone: "10000000000",
      email: "123@123.me",
      location: "广东省广州市海珠区",
      ethnicity: "汉",
      birthDate: "20xx.05",
      height: "177cm",
      politicalStatus: "中共党员",
      graduateSchool: "XX 师范大学",
      education: "本科",
      avatar: MALE_AVATAR,
      summary: "",
    }),
    createEducationSection("grayIconCampus", "教育背景", [
      educationItem(
        "edu-1",
        "XXX 师范大学",
        "市场营销（本科）",
        "20XX.07",
        "20XX.06",
        "主修课程：管理学、微观经济学、宏观经济学、管理信息系统、统计学、会计学、财务管理、市场营销、经济法、消费者行为学、国际市场营销。"
      ),
    ]),
    createProjectsSection("grayIconCampus", "校园实践", "campus", [
      projectItem(
        "proj-1",
        "XXX 科技大学",
        "辩论队（队长）",
        "20XX.05",
        "20XX.06",
        "负责 50 余人团队的日常训练、选拔及团队建设。\n作为负责人对接多项商业校园行活动，如《奔跑吧兄弟》XXX 大学站录制、《时代周末》校园行。"
      ),
      projectItem(
        "proj-2",
        "沟通与交流协会",
        "创始人 / 副会长",
        "20XX.11",
        "20XX.06",
        "协助湖北省通协分会创立武汉大学分部，从零开始组建初期团队。\n策划协会培训、选拔、培训协会导师，推出一系列沟通课程。"
      ),
    ]),
    createSkillsSection("grayIconCampus", "奖项荣誉", [
      skillItem("skill-1", "20XX 年 新长城四川大学自强社“优秀社员”。"),
      skillItem("skill-2", "20XX 年 三下乡“社会实践活动”优秀学生。"),
      skillItem("skill-3", "20XX 年 四川大学学生田径运动会 10 人立定跳远团体赛第三名。"),
      skillItem("skill-4", "20XX 年 学生车事技能训练“优秀学员”。"),
      skillItem("skill-5", "20XX 年 四川大学助学杯烘焙食品创意大赛优秀奖。"),
    ]),
    createSkillsSection("grayIconCampus", "技能证书", [
      skillItem("skill-6", "普通话一级甲等。"),
      skillItem("skill-7", "通过全国计算机一级考试，熟练运用 Office 相关软件。"),
      skillItem("skill-8", "熟练使用绘声绘色软件，剪辑过各种类型的电影及班级视频。"),
      skillItem("skill-9", "大学英语四 / 六级（CET-4/6），良好听说读写能力，快速浏览英语专业书籍。"),
    ]),
    createSkillsSection("grayIconCampus", "自我评价", [
      skillItem("skill-10", "拥有多年的市场管理及品牌营销经验，卓越的规划、组织、策划、方案执行和团队领导能力。"),
      skillItem("skill-11", "积累较强的人际关系处理能力和商务谈判技巧，善于沟通，具备良好的合作关系掌控能力与市场开拓能力。"),
    ]),
  ];
}

function buildTemplate11Sections(): ResumeSection[] {
  return [
    createPersonalSection("cleanBusinessFormal", {
      name: "胡小豆",
      phone: "13500000000",
      email: "0000@xx.me",
      location: "广东省广州市海珠区滨江东路",
      ethnicity: "汉",
      birthDate: "1996.05",
      politicalStatus: "中共党员",
      graduateSchool: "鹿大仙设计科技大学",
      education: "本科",
      avatar: MALE_AVATAR,
      summary: "",
    }),
    createEducationSection("cleanBusinessFormal", "教育背景", [
      educationItem(
        "edu-1",
        "XX 设计大学",
        "市场营销（本科）",
        "20XX.07",
        "20XX.06",
        "主修课程：管理学、微观经济学、宏观经济学、管理信息系统、统计学、会计学、财务管理、市场营销、经济法、消费者行为学、国际市场营销。"
      ),
    ]),
    createProjectsSection("cleanBusinessFormal", "校内实践", "campus", [
      projectItem(
        "proj-1",
        "广州 XX 设计信息科技有限公司",
        "校园大使主席",
        "20XX.03",
        "20XX.06",
        "带领自己的团队，辅助鹿大仙设计公司完成在各高校的“伏龙计划”，向全球顶尖的 AXA 金融公司推送实习生资源。\n整体运营前期开展了相关的线上线下宣传活动，中期为进行咨询的人员提供讲解，后期进行了项目的维护阶段，保证了整个项目的完整性。\n带领本校园队超额完成鹿大仙设计公司的业绩，绩效占到大连区的 30% 左右。"
      ),
      projectItem(
        "proj-2",
        "XX 设计会计知识竞赛",
        "校经济贸易协会会长",
        "20XX.07",
        "20XX.09",
        "目标社团会长期间，带领本社成员协助大连金州区会计协会举办了“祝融杯会计大赛”，旨在为本校同学带来高含金量比赛。"
      ),
    ]),
    createExperienceSection("cleanBusinessFormal", "实习经历", [
      experienceItem(
        "exp-1",
        "广州鹿大仙设计信息科技有限公司",
        "市场营销（实习生）",
        "20XX.04",
        "至今",
        "负责公司线上端资源的销售工作（以开拓客户为主），公司主要资源以广点通、智汇推、百度、小米、360、沃门广告等。\n实时了解行业变化，跟踪客户的详细数据，为客户制定更完善的投放计划（合作过珍爱网、世纪佳缘、56 视频、京东等客户）。"
      ),
    ]),
    createSkillsSection("cleanBusinessFormal", "技能证书", [
      skillItem("skill-1", "普通话一级甲等。"),
      skillItem("skill-2", "大学英语四六级（CET-4/6），良好的听说读写能力，快速浏览英语专业文件及书籍。"),
      skillItem("skill-3", "通过全国计算机二级考试，熟练运用 Office 相关软件。"),
    ]),
    createSkillsSection("cleanBusinessFormal", "自我评价", [
      skillItem("skill-4", "深度互联网从业人员，对互联网保持高度的敏感性和关注度，熟悉产品开发流程，有很强的产品规划、需求分析、交互设计能力。"),
      skillItem("skill-5", "能够立承担 APP 和 WEB 项目的管控工作，善于沟通，贴近用户。"),
    ]),
  ];
}

function buildTemplate12Sections(): ResumeSection[] {
  return [
    createPersonalSection("iconTargetNavy", {
      name: "小豆",
      targetRole: "JAVA 开发工程师",
      phone: "138-0000-0000",
      email: "0000000@xx.com",
      location: "上海市杨浦区",
      avatar: FEMALE_AVATAR,
      summary: "",
    }),
    createEducationSection("iconTargetNavy", "教育背景", [
      educationItem(
        "edu-1",
        "中国社会大学",
        "市场营销 / 本科学",
        "20XX.09",
        "20XX.07",
        "主修课程：基本会计、统计学、市场营销、国际市场营销、市场调查与预测、商业心理学等。\n连续 2 年获得校综合奖学金“励志奖”，获校一等奖学金、国家励志奖学金各一次。"
      ),
    ]),
    createExperienceSection("iconTargetNavy", "实习经历", [
      experienceItem(
        "exp-1",
        "“OPPO 校园俱乐部”项目",
        "新媒体运营",
        "20XX.07",
        "20XX.08",
        "在官方微博平台中，打造“OPPO 校园俱乐部”的概念，为 OPPO 公司在全国范围内各大高校集结粉丝，让学生参与考察及创造者，变成 OPPO 的校园代言人。\n根据 OPPO 客户诉求，基于产品特点，负责品牌传播策略，包括创意构想、文案撰写等。\n挖掘分析网友使用习惯、情感及体验感受，结合产品特点撰写传播文案。"
      ),
      experienceItem(
        "exp-2",
        "北京乔布有限公司",
        "运营实习",
        "20XX.07",
        "20XX.08",
        "要负责撰写软文，协助运营执行推广活动。"
      ),
    ]),
    createProjectsSection("iconTargetNavy", "校园经历", "campus", [
      projectItem(
        "proj-1",
        "院学生会",
        "干事",
        "20XX.09",
        "20XX.06",
        "积极参与学生会的各项活动，与其他干事一起参与各类学生活动的策划。\n完成其他学生会的工作任务，成功举办多次大型活动，如“迎新晚会”“送毕业生晚会”等。"
      ),
    ]),
    createSkillsSection("iconTargetNavy", "技能证书", [
      skillItem("skill-1", "语言能力：通过大学英语六级、普通话二级甲等。"),
      skillItem("skill-2", "计算机能力：通过国家计算机二级，熟练使用 office 系列办公软件。"),
      skillItem("skill-3", "其他能力：C1 驾照。"),
    ]),
    createSkillsSection("iconTargetNavy", "自我评价", [
      skillItem("skill-4", "有运营实习及活动策划经历，熟悉新媒体渠道和用户。"),
      skillItem("skill-5", "熟悉常用微信编辑器的使用方法，能使用 Maka 等工具制作简单的 H5 页面，也能根据公司要求制定新媒体活动方案，并确保活动的良好执行。"),
      skillItem("skill-6", "同时，我具备良好的沟通能力和团队协作能力，能快速融入团队。"),
    ]),
  ];
}

function buildTemplate13Sections(): ResumeSection[] {
  return [
    createPersonalSection("timelineMarketingBlue", {
      name: "胡小豆",
      targetRole: "鹿大仙设计市场专员",
      phone: "1350XXXX00",
      email: "sXXXX@XXD.me",
      location: "广东省广州市",
      age: "24 岁",
      avatar: FEMALE_AVATAR,
      summary: "",
    }),
    createEducationSection("timelineMarketingBlue", "教育背景", [
      educationItem(
        "edu-1",
        "鹿大仙设计科技大学",
        "市场营销",
        "20XX.9",
        "20XX.6",
        "主修课程：基本会计、统计学、市场营销、国际市场营销、市场调查与预测、商业心理学、广告学、公共关系学、货币银行学、经济法、国际贸易、大学英语、计算机应用等。"
      ),
    ]),
    createExperienceSection("timelineMarketingBlue", "工作背景", [
      experienceItem(
        "exp-1",
        "XX 信息科技有限公司",
        "运营推广主管",
        "20XX.10",
        "至今",
        "负责社会化媒体营销团队的搭建工作，制定相关运营策略和指标，带领团队实施计划。\n网站常态运营活动规划和推进执行。\n相关数据报告和统计，为公司决策层提供决策依据。\n轻量级产品和应用的策划，统筹产品、技术团队成员实施。\n工作成果：社会化媒体账号总共涨粉 67 万，日均互动量和比赛手前提升 1000%，评论转发量级达到百千级。"
      ),
      experienceItem(
        "exp-2",
        "XXXX 文化活动有限公司",
        "市场推广专员",
        "20XX.8",
        "20XX.9",
        "网络推广渠道搭建，包含 QQ 空间、微博、豆瓣等。\n负责软文广投放、网络舆情监控、公关稿撰写、事件营销策划。\n标书制作和撰写，甲方沟通工作。"
      ),
    ]),
    createSkillsSection("timelineMarketingBlue", "技能证书", [
      skillItem("skill-1", "CET-6，优秀的听说写能力。"),
      skillItem("skill-2", "计算机二级，熟悉计算机各项操作。"),
      skillItem("skill-3", "高级营销员，国家职业资格四级。"),
    ]),
    createSkillsSection("timelineMarketingBlue", "自我评价", [
      skillItem("skill-4", "本人是市场营销专业毕业生，有丰富的营销知识体系做基础。"),
      skillItem("skill-5", "对于市场营销方面的前沿和动态有一定的了解，善于分析和吸取经验。"),
      skillItem("skill-6", "熟悉网络推广，尤其是社会化媒体方面，有独到的见解和经验；个性开朗，容易相处，团队荣誉感强。"),
    ]),
  ];
}

function buildTemplate14Sections(): ResumeSection[] {
  return [
    createPersonalSection("simpleStarCampus", {
      name: "胡小豆",
      targetRole: "市场运营专员",
      phone: "135XXXXXXXX",
      email: "xx@xx.com",
      location: "上海",
      ethnicity: "汉族",
      birthDate: "20XX.05",
      gender: "女",
      avatar: MALE_AVATAR,
      summary: "",
    }),
    createEducationSection("simpleStarCampus", "教育背景", [
      educationItem(
        "edu-1",
        "鹿大仙设计科技大学",
        "市场营销（本科）",
        "20XX.07",
        "20XX.06",
        "主修课程：管理学、微观经济学、宏观经济学、管理信息系统、统计学、财务管理、市场营销、经济法。"
      ),
    ]),
    createProjectsSection("simpleStarCampus", "校园经历", "campus", [
      projectItem(
        "proj-1",
        "上海鹿大仙设计信息科技有限公司",
        "校园大使主席",
        "20XX.03",
        "20XX.06",
        "目标项目自己的团队，辅助完成在各高校的“伏龙计划”，向全球顶尖的 AXA 金融公司推送实习生资源。\n整体运营前期开展了相关的线上线下宣传活动，中期为进行咨询的人员提供讲解，后期进行了项目维护，保证了整个项目完整性。"
      ),
    ]),
    createExperienceSection("simpleStarCampus", "实习经历", [
      experienceItem(
        "exp-1",
        "上海鹿大仙设计信息科技有限公司",
        "市场营销（实习生）",
        "20XX.04",
        "至今",
        "负责公司线上端资源的销售工作，公司主要资源以广点通、智汇推、百度、小米、360 等为主。\n实时了解行业变化，跟踪客户详细数据，为客户制定更完善的投放计划。"
      ),
      experienceItem(
        "exp-2",
        "上海一百丁信息科技公司",
        "软件工程师",
        "20XX.03",
        "20XX.03",
        "负责公司业务系统的设计及改进，参与公司网上商城系统产品功能设计及实施工作。\n负责客户调研、客户需求分析、方案写作等工作，参与公司多个大型电子商务项目策划。"
      ),
    ]),
    createSkillsSection("simpleStarCampus", "奖项荣誉", [
      skillItem("skill-1", "20XX 年暑假社会实践活动“优秀团队二等奖”。"),
      skillItem("skill-2", "20XX 年暑假社会实践活动“优秀调研报告”。"),
      skillItem("skill-3", "20XX 年暑假社会实践活动“先进个人”。"),
    ]),
    createSkillsSection("simpleStarCampus", "技能证书", [
      skillItem("skill-4", "资格证书：正在参加 CFA 的考试，已过 Level 1；CPA 已经通过考试资格许可，计划在年底考完四个科目；CFP 已经在研究生期间学习完了所有要求的科目。"),
      skillItem("skill-5", "语言能力：在美国留学 6 年，雅思 7 分，能够在全英文的环境下熟练与人沟通和表达。"),
      skillItem("skill-6", "同时也具备流利的普通话能力，具备良好的沟通和人际关系技巧。"),
    ]),
    createSkillsSection("simpleStarCampus", "自我评价", [
      skillItem("skill-7", "营销专业的学科背景，系统学习了定性与定量的研究方法，掌握了问卷、访谈等数据搜集技术。"),
      skillItem("skill-8", "可通过前后测试进行需求评估及用户研究，并结合 SPSS、Excel 等进行数据处理分析工作。"),
    ]),
  ];
}

function getSectionByTitle(
  sections: ResumeSection[],
  title: string,
  type?: ResumeSection["type"]
) {
  return sections.find(
    (section) => section.title === title && (!type || section.type === type)
  );
}

function getSkillLines(sections: ResumeSection[], title: string) {
  const section = getSectionByTitle(sections, title, "skills");
  return section ? (section.content as SkillItem[]).map((item) => item.name) : [];
}

function renderMintDesignerClean(sections: ResumeSection[], personal: PersonalInfo) {
  const education = getSectionByTitle(sections, "教育背景", "education");
  const experience = getSectionByTitle(sections, "工作经历", "experience");
  const skillLines = getSkillLines(sections, "专业技能");
  const selfLines = getSkillLines(sections, "自我评价");

  return plainResumeShell(`
    <div style="border:4px solid #a7cbd0;padding:26px 34px 36px;">
      <div style="text-align:center;">
        <img src="${getAvatar(personal, FEMALE_AVATAR)}" alt="resume avatar" style="width:108px;height:142px;border:2px solid #9bc4ce;object-fit:cover;background:#f8fafc;" />
        <div style="margin-top:10px;font-size:22px;font-weight:700;">Personal Resume</div>
        <div style="width:220px;height:2px;background:#9bc4ce;margin:8px auto 6px;"></div>
        <div style="font-size:14px;">求职意向：${escapeHtml(personal.targetRole || "设计师")}</div>
      </div>
      ${ribbonSectionHeader("基本资料", "#a7cbd0", "#a7cbd0")}
      <div style="display:grid;grid-template-columns:1fr 1fr;column-gap:88px;font-size:12.5px;line-height:2;margin-top:8px;padding:0 28px;">
        <div>
          ${labelValue("姓名：", personal.name || "")}
          ${labelValue("年龄：", personal.age || "")}
          ${labelValue("电话：", personal.phone || "")}
        </div>
        <div>
          ${labelValue("毕业院校：", personal.graduateSchool || "")}
          ${labelValue("所在地：", personal.location || "")}
          ${labelValue("邮箱：", personal.email || "")}
        </div>
      </div>
      ${
        education
          ? renderRowsWithHeading(
              education,
              ribbonSectionHeader("教育背景", "#a7cbd0", "#a7cbd0"),
              "education",
              { leftWidth: "24%", rightWidth: "22%", descriptionStyle: "text" }
            )
          : ""
      }
      ${
        experience
          ? renderRowsWithHeading(
              experience,
              ribbonSectionHeader("工作经历", "#a7cbd0", "#a7cbd0"),
              "experience",
              { leftWidth: "24%", rightWidth: "22%", descriptionStyle: "diamond" }
            )
          : ""
      }
      ${renderListSection(ribbonSectionHeader("专业技能", "#a7cbd0", "#a7cbd0"), skillLines, "text")}
      ${renderListSection(ribbonSectionHeader("自我评价", "#a7cbd0", "#a7cbd0"), selfLines, "diamond")}
    </div>
  `);
}

function renderSidebarPanelLayout(
  personal: PersonalInfo,
  options: {
    leftBg: string;
    leftAccent?: string;
    titleColor?: string;
    bottomText?: string;
    extraBlocks?: string;
    mainContent: string;
  }
) {
  return plainResumeShell(`
    <div style="display:grid;grid-template-columns:238px 1fr;min-height:1080px;">
      <div style="background:${options.leftBg};color:#fff;padding:22px 0 28px;">
        <div style="padding:0 24px;text-align:center;">
          <img src="${getAvatar(personal, FEMALE_AVATAR)}" alt="resume avatar" style="width:134px;height:170px;object-fit:cover;border:2px solid rgba(255,255,255,0.5);background:#f8fafc;" />
          <div style="margin-top:18px;font-size:30px;font-weight:700;">${escapeHtml(personal.name || "")}</div>
          <div style="margin-top:6px;font-size:14px;">求职意向：${escapeHtml(personal.targetRole || "")}</div>
        </div>
        ${options.extraBlocks || ""}
        ${
          options.bottomText
            ? `<div style="padding:0 22px;margin-top:34px;font-size:18px;font-weight:700;letter-spacing:1px;opacity:0.95;">${escapeHtml(
                options.bottomText
              )}</div>`
            : ""
        }
      </div>
      <div style="padding:28px 28px 28px 34px;">
        ${options.mainContent}
      </div>
    </div>
  `);
}

function renderDarkSidebarManager(sections: ResumeSection[], personal: PersonalInfo) {
  const education = getSectionByTitle(sections, "教育背景", "education");
  const experience = getSectionByTitle(sections, "工作经历", "experience");
  const campus = getSectionByTitle(sections, "校内实践", "projects");
  const certs = getSkillLines(sections, "证书奖励");
  const selfLines = getSkillLines(sections, "自我评价");

  const extraBlocks = `
    <div style="margin-top:20px;border-top:1px solid rgba(255,255,255,0.3);">
      ${[
        ["生日", personal.birthDate || ""],
        ["现居", personal.currentCity || personal.location || ""],
        ["学历", personal.education || ""],
        ["专业", personal.title || ""],
        ["手机", personal.phone || ""],
        ["微信", personal.wechat || ""],
        ["微博", personal.website || ""],
        ["邮箱", personal.email || ""],
      ]
        .map(
          ([label, value]) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 22px;border-bottom:1px solid rgba(255,255,255,0.24);font-size:13px;">
              <span>${escapeHtml(label)}：</span><span>${escapeHtml(value)}</span>
            </div>
          `
        )
        .join("")}
    </div>
  `;

  const mainContent = `
    ${
      education
        ? renderRowsWithHeading(education, simpleSectionLine("教育背景", "#2e4664", "🎓"), "education", {
            leftWidth: "24%",
            rightWidth: "20%",
            descriptionStyle: "text",
          })
        : ""
    }
    ${
      experience
        ? renderRowsWithHeading(experience, simpleSectionLine("工作经历", "#2e4664", "🧾"), "experience", {
            leftWidth: "24%",
            rightWidth: "24%",
            descriptionStyle: "text",
          })
        : ""
    }
    ${
      campus
        ? renderRowsWithHeading(campus, simpleSectionLine("校内实践", "#2e4664", "📊"), "projects", {
            leftWidth: "24%",
            rightWidth: "22%",
            descriptionStyle: "text",
          })
        : ""
    }
    ${renderListSection(simpleSectionLine("证书奖励", "#2e4664", "🏆"), certs, "text")}
    ${renderListSection(simpleSectionLine("自我评价", "#2e4664", "👤"), selfLines, "text")}
  `;

  return renderSidebarPanelLayout(personal, {
    leftBg: "#39495b",
    bottomText: "PERSONAL RESUME",
    extraBlocks,
    mainContent,
  });
}

function renderBlueSidebarSales(sections: ResumeSection[], personal: PersonalInfo) {
  const education = getSectionByTitle(sections, "教育背景", "education");
  const experience = getSectionByTitle(sections, "工作经历", "experience");
  const awards = getSkillLines(sections, "技能证书");
  const hobbies = getSkillLines(sections, "兴趣爱好");
  const selfLines = getSkillLines(sections, "自我评价");

  const extraBlocks = `
    <div style="padding:0 26px;margin-top:18px;font-size:14px;line-height:1.9;color:#111827;">
      ${labelValue("姓 名：", personal.name || "")}
      ${labelValue("籍 贯：", personal.ethnicity || "")}
      ${labelValue("求职意向：", personal.targetRole || "")}
      ${labelValue("现居地：", personal.location || "")}
      ${labelValue("出生年月：", personal.birthDate || "")}
      ${labelValue("政治面貌：", personal.politicalStatus || "")}
    </div>
    <div style="padding:0 26px;margin-top:18px;">
      <div style="font-size:16px;font-weight:700;color:#2c66b7;border-bottom:2px solid #7aa4e8;padding-bottom:6px;">联系方式</div>
      <div style="margin-top:10px;font-size:14px;line-height:1.8;color:#111827;">
        <div>${escapeHtml(personal.phone || "")}</div>
        <div>${escapeHtml(personal.email || "")}</div>
      </div>
    </div>
    <div style="padding:0 26px;margin-top:18px;">
      <div style="font-size:16px;font-weight:700;color:#2c66b7;border-bottom:2px solid #7aa4e8;padding-bottom:6px;">技能证书</div>
      ${bulletList(awards, 12.5, 1.75)}
    </div>
    <div style="padding:0 26px;margin-top:18px;">
      <div style="font-size:16px;font-weight:700;color:#2c66b7;border-bottom:2px solid #7aa4e8;padding-bottom:6px;">兴趣爱好</div>
      ${bulletList(hobbies, 12.5, 1.75)}
    </div>
  `;

  const mainContent = `
    ${
      education
        ? renderRowsWithHeading(education, timelineSectionHeader("教育背景", "#326ecc"), "education", {
            leftWidth: "22%",
            rightWidth: "18%",
            descriptionStyle: "bullet",
          })
        : ""
    }
    ${
      experience
        ? renderRowsWithHeading(experience, timelineSectionHeader("工作经历", "#326ecc"), "experience", {
            leftWidth: "22%",
            rightWidth: "18%",
            descriptionStyle: "bullet",
          })
        : ""
    }
    ${renderListSection(timelineSectionHeader("自我评价", "#326ecc"), selfLines, "bullet")}
  `;

  return renderSidebarPanelLayout(personal, {
    leftBg: "#ffffff",
    extraBlocks,
    mainContent,
  });
}

function renderGrayMarketingBars(sections: ResumeSection[], personal: PersonalInfo) {
  return plainResumeShell(`
    <div>
      <div style="display:flex;align-items:flex-start;gap:22px;margin-bottom:12px;">
        <img src="${getAvatar(personal, FEMALE_AVATAR)}" alt="resume avatar" style="width:102px;height:136px;object-fit:cover;background:#f8fafc;" />
        <div style="flex:1;">
          <div style="font-size:44px;font-weight:700;">${escapeHtml(personal.name || "")}</div>
          <div style="margin-top:8px;font-size:15px;">求职意向：${escapeHtml(personal.targetRole || "")}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;column-gap:26px;row-gap:6px;margin-top:12px;font-size:13px;">
            <div>生日：${escapeHtml(personal.birthDate || "")}</div>
            <div>地址：${escapeHtml(personal.location || "")}</div>
            <div>电话：${escapeHtml(personal.phone || "")}</div>
            <div>邮箱：${escapeHtml(personal.email || "")}</div>
          </div>
        </div>
      </div>
      ${sections
        .filter((s) => s.type !== "personal")
        .map((section) => {
          const resolvedAccent = resolveWordAccent("#6b7280");
          const heading = `<div style="margin-top:12px;background:#f3f4f6;border-left:4px solid ${resolvedAccent};padding:4px 10px;font-size:15px;font-weight:700;color:${resolvedAccent};">${escapeHtml(section.title)}</div>`;
          if (section.type === "education") {
            return renderRowsWithHeading(section, heading, "education", {
              leftWidth: "18%",
              rightWidth: "22%",
              descriptionStyle: "text",
            });
          }
          if (section.type === "experience") {
            return renderRowsWithHeading(section, heading, "experience", {
              leftWidth: "18%",
              rightWidth: "22%",
              descriptionStyle: "bullet",
            });
          }
          if (section.type === "projects") {
            return renderRowsWithHeading(section, heading, "projects", {
              leftWidth: "18%",
              rightWidth: "22%",
              descriptionStyle: "text",
            });
          }
          return renderListSection(heading, (section.content as SkillItem[]).map((i) => i.name), "text");
        })
        .join("")}
    </div>
  `);
}

function renderTealTimelineDesigner(sections: ResumeSection[], personal: PersonalInfo) {
  const education = getSectionByTitle(sections, "教育背景", "education");
  const experience = getSectionByTitle(sections, "工作经历", "experience");
  const selfLines = getSkillLines(sections, "自我评价");
  const hobbyLines = getSkillLines(sections, "个人爱好");

  const extraBlocks = `
    <div style="padding:0 22px;margin-top:24px;">
      <div style="font-size:16px;font-weight:700;color:#fff;">基本信息</div>
      <div style="margin-top:10px;font-size:13px;line-height:1.9;color:#fff;">
        <div>姓名：${escapeHtml(personal.name || "")}</div>
        <div>年龄：${escapeHtml(personal.age || "")}</div>
        <div>籍贯：${escapeHtml(personal.ethnicity || "")}</div>
        <div>学历：${escapeHtml(personal.education || "")}</div>
      </div>
      <div style="margin-top:26px;font-size:16px;font-weight:700;color:#fff;">联系方式</div>
      <div style="margin-top:10px;font-size:13px;line-height:1.9;color:#fff;">
        <div>${escapeHtml(personal.phone || "")}</div>
        <div>${escapeHtml(personal.email || "")}</div>
      </div>
      <div style="margin-top:26px;font-size:16px;font-weight:700;color:#fff;">自我评价</div>
      ${renderListSection("", selfLines, "bullet").replace("<div style=\"margin-top:8px;font-size:12.5px;line-height:1.8;color:#111827;\">", '<div style="margin-top:8px;font-size:12.5px;line-height:1.8;color:#fff;">')}
      <div style="margin-top:26px;font-size:16px;font-weight:700;color:#fff;">个人爱好</div>
      ${bulletList(hobbyLines, 12.5, 1.75).replace('color:#111827', 'color:#fff')}
    </div>
  `;

  const mainContent = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;">
      <div>
        <div style="font-size:40px;font-weight:700;color:#222;">${escapeHtml(personal.name || "")}</div>
        <div style="margin-top:8px;font-size:16px;">求职意向：${escapeHtml(personal.targetRole || "")}</div>
      </div>
    </div>
    ${
      education
        ? renderRowsWithHeading(education, simpleSectionLine("教育背景", "#222", "🎓"), "education", {
            leftWidth: "24%",
            rightWidth: "16%",
            descriptionStyle: "bullet",
          })
        : ""
    }
    ${
      experience
        ? `
            ${simpleSectionLine("工作经历", "#222", "💼")}
            ${timelineItems(
              (experience.content as ExperienceItem[]).map((item) => ({
                period: formatPeriod(item.startDate, item.endDate),
                title: item.company,
                role: item.role,
                description: item.description,
              })),
              "#6fc3d6"
            )}
          `
        : ""
    }
  `;

  return renderSidebarPanelLayout(personal, {
    leftBg: "linear-gradient(180deg,#77cad3 0%, #2f8aa0 42%, #2f8aa0 100%)",
    extraBlocks,
    mainContent,
  });
}

function renderTealTeacherFlow(sections: ResumeSection[], personal: PersonalInfo) {
  return plainResumeShell(`
    <div style="margin:-18px -18px 0 -18px;background:#39bdb5;color:#fff;padding:22px 26px 18px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:22px;">
        <div>
          <div style="font-size:46px;font-weight:700;">${escapeHtml(personal.name || "")}</div>
          <div style="margin-top:12px;font-size:16px;font-weight:700;">求职目标：${escapeHtml(personal.targetRole || "")}</div>
          <div style="display:grid;grid-template-columns:repeat(3,auto);column-gap:24px;row-gap:12px;margin-top:16px;font-size:14px;">
            <div>📅 ${escapeHtml(personal.birthDate || "")}</div>
            <div>📞 ${escapeHtml(personal.phone || "")}</div>
            <div>📍 ${escapeHtml(personal.location || "")}</div>
            <div>✉️ ${escapeHtml(personal.email || "")}</div>
          </div>
        </div>
        <img src="${getAvatar(personal, FEMALE_AVATAR)}" alt="resume avatar" style="width:132px;height:164px;object-fit:cover;border:3px solid rgba(255,255,255,0.9);" />
      </div>
      <div style="height:16px;margin:16px -26px -18px;background:linear-gradient(-45deg,#fff 8px,transparent 0) 0 0/16px 16px repeat-x;"></div>
    </div>
    ${
      sections
        .filter((section) => section.type !== "personal")
        .map((section) => {
          const heading = timelineSectionHeader(section.title, "#2dbcb4");
          if (section.type === "education") {
            return renderRowsWithHeading(section, heading, "education", {
              leftWidth: "18%",
              rightWidth: "18%",
              descriptionStyle: "text",
            });
          }
          if (section.type === "experience") {
            return `
              ${heading}
              ${timelineItems(
                (section.content as ExperienceItem[]).map((item) => ({
                  period: formatPeriod(item.startDate, item.endDate),
                  title: item.company,
                  role: item.role,
                  description: item.description,
                })),
                "#2dbcb4"
              )}
            `;
          }
          return renderListSection(
            heading,
            (section.content as SkillItem[]).map((item) => item.name),
            section.title.includes("自我") ? "numbered" : "diamond"
          );
        })
        .join("")
    }
  `);
}

function renderDarkDualColumnIntern(sections: ResumeSection[], personal: PersonalInfo) {
  const education = getSectionByTitle(sections, "教育背景", "education");
  const skills = getSkillLines(sections, "技能证书");
  const selfLines = getSkillLines(sections, "自我评价");
  const work = getSectionByTitle(sections, "工作经历", "experience");
  const campus = getSectionByTitle(sections, "校内实践", "projects");

  return plainResumeShell(`
    <div style="margin:-18px -18px 0 -18px;background:#241f20;color:#fff;padding:22px 26px;">
      <div style="display:flex;align-items:center;gap:26px;">
        <img src="${getAvatar(personal, FEMALE_AVATAR)}" alt="resume avatar" style="width:110px;height:134px;object-fit:cover;border:2px solid rgba(255,255,255,0.75);" />
        <div>
          <div style="font-size:56px;font-weight:700;line-height:1;">${escapeHtml(personal.name || "")}</div>
          <div style="margin-top:10px;font-size:20px;">${escapeHtml(personal.targetRole || "")}</div>
          <div style="margin-top:12px;font-size:14px;">📱${escapeHtml(personal.phone || "")} &nbsp;&nbsp; ✉️ ${escapeHtml(personal.email || "")}</div>
        </div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;column-gap:34px;padding-top:16px;position:relative;">
      <div style="position:absolute;left:50%;top:0;bottom:0;width:2px;background:#2d2627;opacity:0.75;"></div>
      <div style="padding-right:18px;">
        ${
          education
            ? renderRowsWithHeading(education, simpleSectionLine("教育背景", "#111827", "●"), "education", {
                leftWidth: "34%",
                rightWidth: "30%",
                descriptionStyle: "text",
              })
            : ""
        }
        ${renderListSection(simpleSectionLine("技能证书", "#111827", "●"), skills, "text")}
        ${renderListSection(simpleSectionLine("自我评价", "#111827", "●"), selfLines, "text")}
      </div>
      <div style="padding-left:18px;">
        ${
          work
            ? renderRowsWithHeading(work, simpleSectionLine("工作经历", "#111827", "●"), "experience", {
                leftWidth: "34%",
                rightWidth: "24%",
                descriptionStyle: "text",
              })
            : ""
        }
        ${
          campus
            ? renderRowsWithHeading(campus, simpleSectionLine("校内实践", "#111827", "●"), "projects", {
                leftWidth: "34%",
                rightWidth: "24%",
                descriptionStyle: "text",
              })
            : ""
        }
      </div>
    </div>
  `);
}

function renderFloralMarketingSoft(sections: ResumeSection[], personal: PersonalInfo) {
  return plainResumeShell(`
    <div style="position:relative;overflow:hidden;min-height:1080px;padding:18px 10px 36px;">
      <div style="position:absolute;left:-60px;bottom:320px;width:180px;height:180px;border-radius:999px;background:rgba(207,232,236,0.7);"></div>
      <div style="position:absolute;right:-60px;bottom:-20px;width:260px;height:260px;border-radius:999px;background:rgba(225,239,233,0.8);"></div>
      <div style="position:absolute;right:0;top:0;width:180px;height:90px;background:radial-gradient(circle at top right, rgba(216,240,232,0.9), transparent 62%);"></div>
      <div style="font-size:58px;font-weight:700;color:#8d766d;line-height:1;">${escapeHtml(personal.name || "")}</div>
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:18px;margin-top:10px;">
        <div style="font-size:22px;color:#8d766d;">个人简历</div>
        <div style="font-size:12px;color:#8d766d;">天空没留下翅膀的痕迹，但我已飞过。</div>
      </div>
      <div style="height:10px;background:#8d766d;margin-top:18px;"></div>
      <div style="display:grid;grid-template-columns:1fr 180px;column-gap:28px;margin-top:22px;">
        <div>
          <div style="font-size:18px;font-weight:700;color:#8d766d;">基本信息</div>
          <div style="margin-top:10px;font-size:13px;line-height:2;">
            ${labelValue("生日：", personal.birthDate || "")}
            ${labelValue("籍贯：", personal.ethnicity || "")}
            ${labelValue("现居：", personal.currentCity || personal.location || "")}
            ${labelValue("院校：", personal.graduateSchool || "")}
            ${labelValue("学历：", personal.education || "")}
            ${labelValue("专业：", personal.title || "")}
          </div>
        </div>
        <img src="${getAvatar(personal, FEMALE_AVATAR)}" alt="resume avatar" style="width:160px;height:190px;object-fit:cover;border:2px solid #b08b2a;background:#f8fafc;" />
      </div>
      ${sections
        .filter((s) => s.type !== "personal")
        .map((section) => {
          const resolvedAccent = resolveWordAccent("#8d766d");
          const heading = `<div style="margin-top:18px;border-top:2px dashed ${resolvedAccent};padding-top:14px;font-size:18px;font-weight:700;color:${resolvedAccent};">${escapeHtml(section.title)}</div>`;
          if (section.type === "education") {
            return renderRowsWithHeading(section, heading, "education", {
              leftWidth: "18%",
              rightWidth: "18%",
              descriptionStyle: "text",
            });
          }
          if (section.type === "experience") {
            return renderRowsWithHeading(section, heading, "experience", {
              leftWidth: "18%",
              rightWidth: "18%",
              descriptionStyle: "bullet",
            });
          }
          if (section.type === "projects") {
            return renderRowsWithHeading(section, heading, "projects", {
              leftWidth: "18%",
              rightWidth: "18%",
              descriptionStyle: "text",
            });
          }
          return renderListSection(
            heading,
            (section.content as SkillItem[]).map((item) => item.name),
            section.title.includes("自我") ? "text" : "text"
          );
        })
        .join("")}
    </div>
  `);
}

function renderSageTeacherSidebar(sections: ResumeSection[], personal: PersonalInfo) {
  const extraBlocks = `
    <div style="padding:0 18px;margin-top:20px;color:#111827;font-size:14px;line-height:2;">
      ${labelValue("姓名：", personal.name || "")}
      ${labelValue("性别：", personal.gender || "")}
      ${labelValue("出生日期：", personal.birthDate || "")}
      ${labelValue("民族：", personal.ethnicity || "")}
      ${labelValue("籍贯：", personal.location || "")}
      ${labelValue("学历：", personal.education || "")}
      ${labelValue("政治面貌：", personal.politicalStatus || "")}
      ${labelValue("工作经验：", personal.yearsOfExperience || "")}
      ${labelValue("电话：", personal.phone || "")}
      ${labelValue("邮箱：", personal.email || "")}
    </div>
    <div style="padding:0 18px;margin-top:24px;">
      <div style="background:#8ea09a;color:#fff;border-radius:999px;padding:6px 14px;font-size:16px;font-weight:700;">求职意向</div>
      <div style="margin-top:10px;font-size:14px;line-height:2;color:#111827;">
        <div>求职岗位：${escapeHtml(personal.targetRole || "")}</div>
        <div>求职类型：${escapeHtml(personal.status || "全职")}</div>
        <div>期望薪资：${escapeHtml(personal.expectedSalary || "")}</div>
      </div>
    </div>
    <div style="padding:0 18px;margin-top:24px;">
      <div style="background:#8ea09a;color:#fff;border-radius:999px;padding:6px 14px;font-size:16px;font-weight:700;">奖项证书</div>
      <div style="margin-top:10px;font-size:14px;line-height:2;color:#111827;">${getSkillLines(
        sections,
        "奖项证书"
      )
        .map((line) => `<div>${escapeHtml(line)}</div>`)
        .join("")}</div>
    </div>
  `;

  const mainContent = sections
    .filter((section) => section.type !== "personal")
    .map((section) => {
      const heading = simpleSectionLine(section.title, "#8ea09a", section.title.includes("教育") ? "🎓" : section.title.includes("工作") ? "💼" : section.title.includes("技能") ? "🛠" : "👤");
      if (section.type === "education") {
        return renderRowsWithHeading(section, heading, "education", {
          leftWidth: "22%",
          rightWidth: "20%",
          descriptionStyle: "text",
        });
      }
      if (section.type === "experience") {
        return renderRowsWithHeading(section, heading, "experience", {
          leftWidth: "22%",
          rightWidth: "30%",
          descriptionStyle: "numbered" as never,
        }).replace(/<div style="margin-top:6px;font-size:12.5px;line-height:1.9;color:#111827;">/g, '<div style="margin-top:6px;font-size:12.5px;line-height:1.9;color:#111827;">');
      }
      if (section.type === "skills") {
        return renderListSection(
          heading,
          (section.content as SkillItem[]).map((item) => item.name),
          section.title.includes("自我") ? "numbered" : "text"
        );
      }
      return "";
    })
    .join("");

  return renderSidebarPanelLayout(personal, {
    leftBg: "#ececec",
    extraBlocks,
    mainContent,
  });
}

function renderCyanHeaderDesigner(sections: ResumeSection[], personal: PersonalInfo) {
  return plainResumeShell(`
    <div style="margin:-18px -18px 18px -18px;background:#7cb9cb;padding:20px 24px 14px;color:#fff;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:24px;">
        <div>
          <div style="display:flex;align-items:center;gap:16px;">
            <div style="width:34px;height:34px;border:5px solid #fff;border-radius:8px;box-sizing:border-box;"></div>
            <div>
              <div style="font-size:42px;font-weight:700;">${escapeHtml(personal.name || "")}</div>
              <div style="font-size:14px;margin-top:4px;">求职意向：${escapeHtml(personal.targetRole || "")}</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(4,auto);column-gap:26px;row-gap:8px;margin-top:20px;font-size:14px;">
            <div>姓名：${escapeHtml(personal.name || "")}</div>
            <div>现居：${escapeHtml(personal.currentCity || personal.location || "")}</div>
            <div>电话：${escapeHtml(personal.phone || "")}</div>
            <div>生日：${escapeHtml(personal.birthDate || "")}</div>
            <div>政治面貌：${escapeHtml(personal.politicalStatus || "")}</div>
            <div>邮箱：${escapeHtml(personal.email || "")}</div>
          </div>
        </div>
        <img src="${getAvatar(personal, FEMALE_AVATAR)}" alt="resume avatar" style="width:126px;height:166px;border:5px solid #fff;object-fit:cover;background:#f8fafc;" />
      </div>
    </div>
    ${sections
      .filter((section) => section.type !== "personal")
      .map((section) => {
        const heading = timelineSectionHeader(section.title, "#6cb7cf");
        if (section.type === "education") {
          return renderRowsWithHeading(section, heading, "education", {
            leftWidth: "24%",
            rightWidth: "22%",
            descriptionStyle: "text",
          });
        }
        if (section.type === "experience") {
          return renderRowsWithHeading(section, heading, "experience", {
            leftWidth: "24%",
            rightWidth: "26%",
            descriptionStyle: "text",
          });
        }
        if (section.type === "projects") {
          return renderRowsWithHeading(section, heading, "projects", {
            leftWidth: "24%",
            rightWidth: "26%",
            descriptionStyle: "text",
          });
        }
        if (section.type === "skills") {
          return renderListSection(heading, (section.content as SkillItem[]).map((item) => item.name), "text");
        }
        return renderWordFallbackSection(section);
      })
      .join("")}
  `);
}

function renderBlueCampusAwards(sections: ResumeSection[], personal: PersonalInfo) {
  return plainResumeShell(`
    <div style="font-size:48px;font-weight:700;color:#5c9de0;line-height:1;margin-bottom:12px;">个人简历</div>
    <div style="height:18px;background:#6aa3e8;margin:-4px -18px 14px -18px;"></div>
    <div style="display:grid;grid-template-columns:1fr 160px;column-gap:28px;font-size:13px;line-height:2;">
      <div>
        ${labelValue("姓 名：", personal.name || "")}
        ${labelValue("民 族：", personal.ethnicity || "")}
        ${labelValue("电 话：", personal.phone || "")}
        ${labelValue("邮 箱：", personal.email || "")}
        ${labelValue("住 址：", personal.location || "")}
      </div>
      <div>
        ${labelValue("出生年月：", personal.birthDate || "")}
        ${labelValue("身 高：", personal.height || "")}
        ${labelValue("政治面貌：", personal.politicalStatus || "")}
        ${labelValue("毕业院校：", personal.graduateSchool || "")}
        ${labelValue("学 历：", personal.education || "")}
      </div>
      <img src="${getAvatar(personal, FEMALE_AVATAR)}" alt="resume avatar" style="grid-column:2;grid-row:1 / span 2;width:132px;height:164px;object-fit:cover;background:#f8fafc;" />
    </div>
    ${sections
      .filter((section) => section.type !== "personal")
      .map((section) => {
        const icon =
          section.title.includes("教育")
            ? "🎓"
            : section.title.includes("实践")
              ? "🏛"
              : section.title.includes("奖项")
                ? "🏅"
                : section.title.includes("技能")
                  ? "🛠"
                  : section.title.includes("工作")
                    ? "💼"
                    : "✎";
        const heading = simpleSectionLine(section.title, "#5c9de0", icon);
        if (section.type === "education") {
          return renderRowsWithHeading(section, heading, "education", {
            leftWidth: "22%",
            rightWidth: "22%",
            descriptionStyle: "text",
          });
        }
        if (section.type === "experience") {
          return renderRowsWithHeading(section, heading, "experience", {
            leftWidth: "22%",
            rightWidth: "22%",
            descriptionStyle: "bullet",
          });
        }
        if (section.type === "projects") {
          return renderRowsWithHeading(section, heading, "projects", {
            leftWidth: "22%",
            rightWidth: "22%",
            descriptionStyle: "bullet",
          });
        }
        return renderListSection(
          heading,
          (section.content as SkillItem[]).map((item) => item.name),
          section.title.includes("自我") ? "text" : "text"
        );
      })
      .join("")}
  `);
}

function renderDarkTopSales(sections: ResumeSection[], personal: PersonalInfo) {
  return plainResumeShell(`
    <div style="margin:-18px -18px 18px -18px;background:#14212e;color:#fff;padding:12px 24px;font-size:24px;font-weight:700;">个人简历</div>
    <div style="display:grid;grid-template-columns:120px 1fr 180px;column-gap:26px;align-items:start;">
      <img src="${getAvatar(personal, FEMALE_AVATAR)}" alt="resume avatar" style="width:104px;height:132px;object-fit:cover;background:#f8fafc;" />
      <div>
        <div style="font-size:52px;font-weight:700;color:#14212e;">${escapeHtml(personal.name || "")}</div>
        <div style="margin-top:4px;font-size:15px;color:#3b84d3;">求职意向：${escapeHtml(personal.targetRole || "")}</div>
      </div>
      <div style="font-size:14px;line-height:2;">
        <div>${escapeHtml(personal.age || "")}</div>
        <div>${escapeHtml(personal.phone || "")}</div>
        <div>${escapeHtml(personal.email || "")}</div>
        <div>${escapeHtml(personal.currentCity || personal.location || "")}</div>
      </div>
    </div>
    ${sections
      .filter((section) => section.type !== "personal")
      .map((section) => {
        const heading = simpleSectionLine(section.title, "#111827");
        if (section.type === "education") {
          return renderRowsWithHeading(section, heading, "education", {
            leftWidth: "22%",
            rightWidth: "22%",
            descriptionStyle: "text",
          });
        }
        if (section.type === "experience") {
          return renderRowsWithHeading(section, heading, "experience", {
            leftWidth: "22%",
            rightWidth: "22%",
            descriptionStyle: "bullet",
          });
        }
        if (section.type === "projects") {
          return renderRowsWithHeading(section, heading, "projects", {
            leftWidth: "22%",
            rightWidth: "22%",
            descriptionStyle: "bullet",
          });
        }
        if (section.type === "skills") {
          return renderListSection(heading, (section.content as SkillItem[]).map((item) => item.name), "text");
        }
        return renderWordFallbackSection(section);
      })
      .join("")}
  `);
}

function renderGrayFinanceLight(sections: ResumeSection[], personal: PersonalInfo) {
  return plainResumeShell(`
    <div style="margin:-18px -18px 14px -18px;background:#b8b7b7;height:14px;position:relative;">
      <div style="position:absolute;right:24px;top:0;background:#6f6f6f;color:#fff;padding:6px 20px;font-size:16px;font-weight:700;">个人简历</div>
    </div>
    <div style="display:grid;grid-template-columns:120px 1fr;column-gap:24px;align-items:start;">
      <img src="${getAvatar(personal, FEMALE_AVATAR)}" alt="resume avatar" style="width:116px;height:146px;object-fit:cover;border:2px solid #7c93b3;background:#f8fafc;" />
      <div>
        <div style="font-size:46px;font-weight:700;color:#7c93b3;">${escapeHtml(personal.name || "")}</div>
        <div style="margin-top:6px;font-size:16px;">求职意向：${escapeHtml(personal.targetRole || "")}</div>
        <div style="display:grid;grid-template-columns:repeat(4,auto);column-gap:20px;row-gap:10px;margin-top:14px;font-size:14px;color:#7c93b3;">
          <div>👤 ${escapeHtml(personal.birthDate || "")}</div>
          <div>📍 ${escapeHtml(personal.location || "")}</div>
          <div>📞 ${escapeHtml(personal.phone || "")}</div>
          <div>✉️ ${escapeHtml(personal.email || "")}</div>
        </div>
      </div>
    </div>
    ${sections
      .filter((section) => section.type !== "personal")
      .map((section) => {
        const resolvedAccent = resolveWordAccent("#7c93b3");
        const heading = `<div style="margin-top:16px;background:#ececec;padding:5px 10px;font-size:16px;color:${resolvedAccent};font-weight:700;border-left:4px solid ${resolvedAccent};">${escapeHtml(section.title)}</div>`;
        if (section.type === "education") {
          return renderRowsWithHeading(section, heading, "education", {
            leftWidth: "24%",
            rightWidth: "22%",
            descriptionStyle: "text",
          });
        }
        if (section.type === "experience") {
          return renderRowsWithHeading(section, heading, "experience", {
            leftWidth: "24%",
            rightWidth: "22%",
            descriptionStyle: "bullet",
          });
        }
        return renderListSection(heading, (section.content as SkillItem[]).map((item) => item.name), "text");
      })
      .join("")}
  `);
}

function renderBlueNurseResume(sections: ResumeSection[], personal: PersonalInfo) {
  return plainResumeShell(`
    <div style="margin:-18px -18px 18px -18px;background:#5e79b6;color:#fff;padding:8px 18px;font-size:26px;font-weight:700;">▶ PERSONAL RESUME</div>
    <div style="display:grid;grid-template-columns:1fr 180px;column-gap:24px;align-items:start;">
      <div>
        <div style="font-size:40px;font-weight:700;color:#4b65a7;">${escapeHtml(personal.name || "")}</div>
        <div style="margin-top:6px;font-size:15px;">求职意向：${escapeHtml(personal.targetRole || "")}</div>
        <div style="display:grid;grid-template-columns:repeat(3,auto);column-gap:24px;row-gap:10px;margin-top:12px;font-size:14px;color:#4b65a7;">
          <div>📅 ${escapeHtml(personal.birthDate || "")}</div>
          <div>📞 ${escapeHtml(personal.phone || "")}</div>
          <div>💬 工作经验：${escapeHtml(personal.yearsOfExperience || "")}</div>
          <div>📍 ${escapeHtml(personal.location || "")}</div>
          <div>✉️ ${escapeHtml(personal.email || "")}</div>
          <div>👤 政治面貌：${escapeHtml(personal.politicalStatus || "")}</div>
        </div>
      </div>
      <img src="${getAvatar(personal, FEMALE_AVATAR)}" alt="resume avatar" style="width:136px;height:176px;object-fit:cover;background:#f8fafc;" />
    </div>
    ${sections
      .filter((section) => section.type !== "personal")
      .map((section) => {
        const heading = timelineSectionHeader(section.title, "#4f70b6");
        if (section.type === "education") {
          return renderRowsWithHeading(section, heading, "education", {
            leftWidth: "22%",
            rightWidth: "24%",
            descriptionStyle: "text",
          });
        }
        if (section.type === "experience") {
          return renderRowsWithHeading(section, heading, "experience", {
            leftWidth: "22%",
            rightWidth: "22%",
            descriptionStyle: "diamond",
          });
        }
        if (section.title === "证书奖励") {
          const lines = (section.content as SkillItem[]).map((item) => item.name);
          return `
            ${heading}
            <table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:13px;line-height:1.9;">
              ${lines
                .map((line) => {
                  const idx = line.indexOf("：");
                  if (idx > 0) {
                    return `<tr><td style="width:90px;font-weight:700;vertical-align:top;">${escapeHtml(
                      line.slice(0, idx + 1)
                    )}</td><td>${escapeHtml(line.slice(idx + 1).trim())}</td></tr>`;
                  }
                  return `<tr><td colspan="2">${escapeHtml(line)}</td></tr>`;
                })
                .join("")}
            </table>
          `;
        }
        return renderListSection(heading, (section.content as SkillItem[]).map((item) => item.name), "text");
      })
      .join("")}
  `);
}

function renderMinimalFrontendPlain(sections: ResumeSection[], personal: PersonalInfo) {
  const accent = resolveWordAccent("#2563eb");
  const renderHeading = (title: string) => `
    <div style="margin-top:16px;margin-bottom:7px;">
      <div style="display:flex;align-items:center;gap:10px;color:${accent};font-size:15px;font-weight:800;">
        <span>${escapeHtml(title)}</span>
        <span style="flex:1;height:1px;background:${accent};opacity:0.45;"></span>
      </div>
    </div>
  `;

  const renderMetaRow = (left: string, middle: string, right: string) => `
    <table style="width:100%;border-collapse:collapse;margin-top:6px;font-size:12.4px;line-height:1.45;color:#111827;">
      <tr>
        <td style="width:23%;font-weight:700;padding:0 10px 0 0;vertical-align:top;">${escapeHtml(left)}</td>
        <td style="font-weight:700;text-align:center;padding:0 8px;vertical-align:top;">${escapeHtml(middle)}</td>
        <td style="width:30%;font-weight:700;text-align:right;padding:0 0 0 10px;vertical-align:top;">${escapeHtml(right)}</td>
      </tr>
    </table>
  `;

  const renderReadableBullets = (description: string | undefined) => {
    const lines = splitLines(description);
    if (!lines.length) {
      return "";
    }

    return `
      <ul style="margin:6px 0 0 18px;padding:0;font-size:12px;line-height:1.55;color:#111827;">
        ${lines
          .map((line) => `<li style="margin:1px 0 0 0;">${escapeHtml(line)}</li>`)
          .join("")}
      </ul>
    `;
  };

  return plainResumeShell(`
    <div style="padding:10px 18px 24px;font-size:12px;line-height:1.6;color:#111827;">
      <div style="font-size:30px;line-height:1.12;font-weight:800;letter-spacing:-0.03em;color:#111827;">${escapeHtml(personal.name || "")} - ${escapeHtml(personal.targetRole || "")}</div>
      <div style="margin-top:8px;font-size:12px;color:#475569;">${escapeHtml(personal.phone || "")} | ${escapeHtml(personal.email || "")} | ${escapeHtml(personal.yearsOfExperience || "")}</div>
      ${sections
        .filter((section) => section.type !== "personal")
        .map((section) => {
          const heading = renderHeading(section.title);
          if (section.type === "education") {
            return `
              ${heading}
              ${(section.content as EducationItem[])
                .map((item) =>
                  renderMetaRow(
                    formatPeriod(item.startDate, item.endDate),
                    item.school,
                    item.degree
                  )
                )
                .join("")}
            `;
          }
          if (section.type === "experience") {
            return `
              ${heading}
              ${(section.content as ExperienceItem[])
                .map(
                  (item, index) => `
                    <div style="margin-top:${index === 0 ? 0 : 10}px;">
                      ${renderMetaRow(
                        formatPeriod(item.startDate, item.endDate),
                        item.company,
                        item.role
                      )}
                      ${renderReadableBullets(item.description)}
                    </div>
                  `
                )
                .join("")}
            `;
          }
          return `
            ${heading}
            <div style="margin-top:6px;font-size:12px;line-height:1.65;color:#111827;">
              ${(section.content as SkillItem[])
                .map((item) => `<div style="margin-top:1px;">${escapeHtml(item.name)}</div>`)
                .join("")}
            </div>
          `;
        })
        .join("")}
    </div>
  `);
}

function renderAlgorithmEngineerResearch(sections: ResumeSection[], personal: PersonalInfo) {
  const accent = resolveWordAccent("#111827");
  const profileLine = [personal.location, personal.gender, personal.birthDate]
    .filter((value): value is string => Boolean(value))
    .map(escapeHtml)
    .join(" / ");
  const sectionHeading = (title: string) => `
    <div style="margin-top:18px;margin-bottom:9px;">
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="font-size:15px;font-weight:800;color:${accent};white-space:nowrap;">${escapeHtml(title)}</div>
        <div style="height:1px;flex:1;background:#111827;opacity:0.28;"></div>
      </div>
    </div>
  `;

  const renderBulletItems = (description: string | undefined) => {
    const lines = (description || "")
      .split(/\n+/)
      .map((line) => line.replace(/\s+$/g, ""))
      .filter((line) => line.trim());

    if (!lines.length) {
      return "";
    }

    return `
      <ul style="margin:6px 0 0 18px;padding:0;font-size:${resolveBodyFontSize(
        12.2
      )}px;line-height:${resolveBodyLineHeight(1.55)};color:#111827;">
        ${lines
          .map((line) => {
            const nested = /^\s{2,}[-•]/.test(line);
            const text = line.replace(/^\s*[-•]\s*/, "").trim();
            return `<li style="margin:2px 0 0 ${
              nested ? "18px" : "0"
            };">${escapeHtml(text)}</li>`;
          })
          .join("")}
      </ul>
    `;
  };

  const renderSkillSection = (section: ResumeSection) => `
    ${sectionHeading(section.title)}
    <ul style="margin:0 0 0 18px;padding:0;font-size:${resolveBodyFontSize(
      12.4
    )}px;line-height:${resolveBodyLineHeight(1.7)};color:#111827;">
      ${(section.content as SkillItem[])
        .map((item) => `<li style="margin-top:2px;">${escapeHtml(item.name)}</li>`)
        .join("")}
    </ul>
  `;

  const renderEducationSection = (section: ResumeSection) => `
    ${sectionHeading(section.title)}
    <div style="display:grid;grid-template-columns:1fr 128px;gap:10px 24px;font-size:${resolveBodyFontSize(
      12.2
    )}px;line-height:${resolveBodyLineHeight(1.55)};">
      ${(section.content as EducationItem[])
        .map(
          (item) => `
            <div>
              <div style="font-weight:700;">${escapeHtml(item.school)} ${escapeHtml(
                item.degree
              )}</div>
              ${
                item.description
                  ? `<div style="margin-top:3px;color:#475569;">${escapeHtml(item.description)}</div>`
                  : ""
              }
            </div>
            <div style="text-align:right;color:#111827;font-weight:700;">${escapeHtml(
              formatPeriod(item.startDate, item.endDate)
            )}</div>
          `
        )
        .join("")}
    </div>
  `;

  const renderExperienceSection = (section: ResumeSection) => `
    ${sectionHeading(section.title)}
    ${(section.content as ExperienceItem[])
      .map(
        (item) => `
          <div style="margin-top:12px;">
            <div style="display:flex;justify-content:space-between;gap:16px;font-size:${resolveBodyFontSize(
              13
            )}px;font-weight:800;color:#111827;">
              <span>${escapeHtml(item.company)}</span>
              <span style="white-space:nowrap;">${escapeHtml(
                formatPeriod(item.startDate, item.endDate)
              )}</span>
            </div>
            ${
              item.role
                ? `<div style="margin-top:4px;font-size:${resolveBodyFontSize(
                    12.2
                  )}px;font-weight:700;color:#334155;">${escapeHtml(item.role)}</div>`
                : ""
            }
            ${renderBulletItems(item.description)}
          </div>
        `
      )
      .join("")}
  `;

  const renderProjectSection = (section: ResumeSection) => `
    ${sectionHeading(section.title)}
    ${(section.content as ProjectItem[])
      .map(
        (item) => `
          <div style="margin-top:12px;">
            <div style="display:flex;justify-content:space-between;gap:16px;font-size:${resolveBodyFontSize(
              13
            )}px;font-weight:800;color:#111827;">
              <span>${escapeHtml(item.name)}</span>
              <span style="white-space:nowrap;color:#475569;">${escapeHtml(item.role || "")}</span>
            </div>
            ${
              item.link
                ? `<div style="margin-top:4px;font-size:${resolveBodyFontSize(
                    11.8
                  )}px;color:#2563eb;">Github地址：<a href="${escapeHtml(
                    item.link
                  )}" style="color:#2563eb;text-decoration:none;">${escapeHtml(item.link)}</a></div>`
                : ""
            }
            ${renderBulletItems(item.description)}
          </div>
        `
      )
      .join("")}
  `;

  const renderSection = (section: ResumeSection) => {
    if (section.type === "skills") {
      return renderSkillSection(section);
    }
    if (section.type === "education") {
      return renderEducationSection(section);
    }
    if (section.type === "experience") {
      return renderExperienceSection(section);
    }
    if (section.type === "projects") {
      return renderProjectSection(section);
    }
    return renderTemplateSection("algorithmEngineerResearch", section) || renderWordFallbackSection(section);
  };

  return plainResumeShell(`
    <div style="padding:10px 18px 18px;color:#111827;">
      <div style="display:grid;grid-template-columns:1fr 210px;gap:26px;align-items:start;border-bottom:2px solid #111827;padding-bottom:12px;">
        <div>
          <div style="font-size:30px;line-height:1.1;font-weight:900;letter-spacing:-0.03em;">${escapeHtml(
            personal.name || ""
          )} - ${escapeHtml(personal.targetRole || "")}</div>
          <div style="margin-top:10px;font-size:${resolveBodyFontSize(
            12.2
          )}px;line-height:${resolveBodyLineHeight(1.65)};color:#334155;">
            ${profileLine}<br/>
            ${escapeHtml(personal.graduateSchool || "")}${
              personal.education ? ` / ${escapeHtml(personal.education)}` : ""
            }
          </div>
        </div>
        <div style="font-size:${resolveBodyFontSize(
          12.2
        )}px;line-height:${resolveBodyLineHeight(1.75)};color:#111827;text-align:right;">
          ${
            personal.website
              ? `<div>Blog：<a href="${escapeHtml(
                  personal.website
                )}" style="color:#111827;text-decoration:none;">${escapeHtml(personal.website)}</a></div>`
              : ""
          }
          ${personal.wechat ? `<div>微信：${escapeHtml(personal.wechat)}</div>` : ""}
        </div>
      </div>
      ${renderWordPersonalFallbackBlock(personal, [
        "location",
        "gender",
        "birthDate",
        "graduateSchool",
        "education",
        "website",
        "wechat",
        "targetRole",
      ])}
      ${sections
        .filter((section) => section.isVisible && section.type !== "personal")
        .map(renderSection)
        .join("")}
    </div>
  `);
}

function renderJavaBackendEngineer(sections: ResumeSection[], personal: PersonalInfo) {
  const inlineIcon = (path: string) =>
    `<span style="display:inline-flex;width:16px;height:16px;margin-right:5px;vertical-align:-2px;color:#000;">` +
    `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" style="display:block;fill:currentColor;">${path}</svg>` +
    `</span>`;
  const icons = {
    user: inlineIcon(
      '<path d="M12 12c2.35 0 4.25-1.9 4.25-4.25S14.35 3.5 12 3.5s-4.25 1.9-4.25 4.25S9.65 12 12 12Zm0 2c-3.35 0-6.5 1.7-6.5 4.2v.8c0 .83.67 1.5 1.5 1.5h10c.83 0 1.5-.67 1.5-1.5v-.8c0-2.5-3.15-4.2-6.5-4.2Z"/>'
    ),
    wechat: inlineIcon(
      '<path d="M9.4 5C5.85 5 3 7.33 3 10.18c0 1.65.96 3.1 2.46 4.04l-.56 1.68 1.97-.98c.78.27 1.63.42 2.53.42.2 0 .4 0 .6-.02a5.1 5.1 0 0 1-.18-1.35c0-2.9 2.78-5.25 6.25-5.25.1 0 .21 0 .31.01C15.63 6.56 12.87 5 9.4 5Zm-2.1 3.98a.82.82 0 1 1 0-1.64.82.82 0 0 1 0 1.64Zm4.12 0a.82.82 0 1 1 0-1.64.82.82 0 0 1 0 1.64Zm4.65.76c-2.91 0-5.27 1.9-5.27 4.23s2.36 4.23 5.27 4.23c.72 0 1.4-.12 2.02-.34l1.62.8-.46-1.37C20.44 16.52 21.2 15.34 21.2 14c0-2.35-2.35-4.25-5.13-4.25Zm-1.72 3.16a.68.68 0 1 1 0-1.36.68.68 0 0 1 0 1.36Zm3.42 0a.68.68 0 1 1 0-1.36.68.68 0 0 1 0 1.36Z"/>'
    ),
    home: inlineIcon(
      '<path d="M3.5 11.1 12 4l8.5 7.1-1.28 1.54L18 11.62V20h-5v-5H11v5H6v-8.38l-1.22 1.02L3.5 11.1Z"/>'
    ),
    github: inlineIcon(
      '<path d="M12 2.5a9.5 9.5 0 0 0-3 18.52c.48.09.65-.2.65-.46v-1.7c-2.66.58-3.22-1.13-3.22-1.13-.44-1.12-1.07-1.42-1.07-1.42-.87-.6.07-.59.07-.59.96.07 1.47.99 1.47.99.86 1.46 2.24 1.04 2.78.8.09-.62.34-1.04.61-1.28-2.12-.24-4.35-1.06-4.35-4.72 0-1.04.37-1.9.98-2.56-.1-.24-.43-1.22.09-2.53 0 0 .8-.26 2.62.98A9.1 9.1 0 0 1 12 7.08c.8 0 1.6.11 2.36.32 1.82-1.24 2.62-.98 2.62-.98.52 1.31.19 2.29.09 2.53.61.66.98 1.52.98 2.56 0 3.67-2.23 4.47-4.36 4.71.35.3.66.88.66 1.79v2.65c0 .26.17.56.66.46A9.5 9.5 0 0 0 12 2.5Z"/>'
    ),
  };
  const sectionHeading = (title: string) => `
    <div style="margin-top:25px;margin-bottom:13px;">
      <div style="font-size:22px;line-height:1.18;font-weight:900;color:#000;">${escapeHtml(title)}</div>
      <div style="height:1px;background:#111827;margin-top:8px;"></div>
    </div>
  `;

  const formatInlineMarkdown = (value: string) =>
    escapeHtml(value)
      .replace(/`([^`]+)`/g, '<span style="display:inline-block;margin:0 4px 4px 0;border:1px solid #d1d5db;border-radius:4px;padding:1px 6px;background:#f8fafc;font-size:11px;font-family:Consolas,monospace;">$1</span>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  const paragraphText = (value: string) => escapeHtml(value).replaceAll("\n", "<br />");

  const renderBullets = (description: string | undefined) => {
    const lines = (description || "")
      .split(/\n+/)
      .map((line) => line.replace(/\s+$/g, ""))
      .filter((line) => line.trim());

    if (!lines.length) {
      return "";
    }

    return `
      <ul style="margin:11px 0 0 19px;padding:0;font-size:14px;line-height:1.62;color:#000;list-style-type:square;">
        ${lines
          .map((line) => {
            const nested = /^\s{2,}[-•]/.test(line);
            const text = line.replace(/^\s*[-•]\s*/, "").trim();
            return `<li style="margin:2px 0 0 ${
              nested ? "18px" : "0"
            };list-style-type:${nested ? "circle" : "square"};">${formatInlineMarkdown(text)}</li>`;
          })
          .join("")}
      </ul>
    `;
  };

  const renderProjectDetails = (description: string | undefined) => {
    const lines = (description || "")
      .split(/\n+/)
      .map((line) => line.replace(/\s+$/g, ""))
      .filter((line) => line.trim());

    if (!lines.length) {
      return "";
    }

    return `
      <ul style="margin:8px 0 0 19px;padding:0;font-size:14px;line-height:1.62;color:#000;list-style-type:square;">
        ${lines
          .map((line) => {
            const raw = line.trim();
            const isNested = /^\s{2,}[-•]/.test(line);
            const text = raw.replace(/^[-•]\s*/, "");
            const labelOnly = /^\*\*[^*]+\*\*：?$/.test(raw);

            if (isNested) {
              return `<li style="margin:3px 0 0 22px;list-style-type:circle;">${formatInlineMarkdown(text)}</li>`;
            }

            if (labelOnly) {
              return `<li style="margin-top:5px;list-style-type:square;">${formatInlineMarkdown(text)}</li>`;
            }

            return `<li style="margin:4px 0 0 -19px;list-style-type:none;">${formatInlineMarkdown(raw)}</li>`;
          })
          .join("")}
      </ul>
    `;
  };

  const renderEducation = (section: ResumeSection) => `
    ${sectionHeading(section.title)}
    ${(section.content as EducationItem[])
      .map(
        (item) => `
          <div style="margin-top:10px;">
            <div style="display:flex;justify-content:space-between;gap:18px;font-size:15px;font-weight:800;">
              <span>${escapeHtml(item.school)} - ${escapeHtml(item.degree)}</span>
              <span style="white-space:nowrap;">${escapeHtml(formatPeriod(item.startDate, item.endDate))}</span>
            </div>
            ${
              item.description
                ? `<div style="margin-top:5px;font-size:14px;line-height:1.62;color:#000;">${paragraphText(item.description)}</div>`
                : ""
            }
          </div>
        `
      )
      .join("")}
  `;

  const renderExperience = (section: ResumeSection) => `
    ${sectionHeading(section.title)}
    ${(section.content as ExperienceItem[])
      .map(
        (item) => `
          <div style="margin-top:10px;">
            <div style="display:flex;justify-content:space-between;gap:18px;font-size:15px;font-weight:800;">
              <span>${escapeHtml(item.company)} - ${escapeHtml(item.role)}</span>
              <span style="white-space:nowrap;">${escapeHtml(formatPeriod(item.startDate, item.endDate))}</span>
            </div>
            ${renderBullets(item.description)}
          </div>
        `
      )
      .join("")}
  `;

  const renderProjects = (section: ResumeSection) => `
    ${sectionHeading(section.title)}
    ${(section.content as ProjectItem[])
      .map(
        (item) => `
          <div style="margin-top:11px;">
            <div style="font-size:15px;font-weight:900;">${escapeHtml(item.name)}</div>
            ${
              item.role
                ? `<div style="margin-top:5px;font-size:12px;line-height:1.6;">${formatInlineMarkdown(item.role)}</div>`
                : ""
            }
            ${renderProjectDetails(item.description)}
          </div>
        `
      )
      .join("")}
  `;

  const renderSkills = (section: ResumeSection) => `
    ${sectionHeading(section.title)}
    <ul style="margin:0 0 0 19px;padding:0;font-size:14px;line-height:1.62;color:#000;list-style-type:square;">
      ${(section.content as SkillItem[])
        .map((item) => `<li style="margin-top:4px;">${formatInlineMarkdown(item.name)}</li>`)
        .join("")}
    </ul>
  `;

  const renderSection = (section: ResumeSection) => {
    if (section.type === "education") return renderEducation(section);
    if (section.type === "experience") return renderExperience(section);
    if (section.type === "projects") return renderProjects(section);
    if (section.type === "skills") return renderSkills(section);
    return renderTemplateSection("javaBackendEngineer", section) || renderWordFallbackSection(section);
  };

  return plainResumeShell(`
    <div style="padding:18px 28px 24px;color:#000;">
      <div>
        <div style="font-size:32px;line-height:1.1;font-weight:900;letter-spacing:-0.035em;color:#000;white-space:nowrap;">${escapeHtml(
          personal.name || ""
        )} - ${escapeHtml(personal.targetRole || "")}</div>
        <div style="display:grid;grid-template-columns:1fr 330px;gap:30px;align-items:start;margin-top:25px;">
          <div>
          <div style="margin-top:25px;font-size:14px;line-height:1.75;color:#000;">
            ${
              [personal.gender, personal.birthDate].filter((value): value is string => Boolean(value)).length
                ? `<div>${icons.user}${[personal.gender, personal.birthDate]
                    .filter((value): value is string => Boolean(value))
                    .map(escapeHtml)
                    .join("/")}</div>`
                : ""
            }
            ${
              personal.wechat
                ? `<div>${icons.wechat}${escapeHtml(personal.wechat)}</div>`
                : ""
            }
          </div>
        </div>
        <div style="font-size:14px;line-height:1.8;text-align:right;color:#000;">
          ${
            personal.website
              ? `<div>${icons.home}<a href="${escapeHtml(
                  personal.website
                )}" style="color:#000;text-decoration:none;">${escapeHtml(personal.website)}</a></div>`
              : ""
          }
          ${
            personal.github
              ? `<div>${icons.github}<a href="${escapeHtml(
                  personal.github
                )}" style="color:#000;text-decoration:none;">${escapeHtml(personal.github)}</a></div>`
              : ""
          }
        </div>
      </div>
      ${renderWordPersonalFallbackBlock(personal, [
        "gender",
        "birthDate",
        "wechat",
        "website",
        "github",
        "targetRole",
      ])}
      ${sections
        .filter((section) => section.isVisible && section.type !== "personal")
        .map(renderSection)
        .join("")}
    </div>
  `);
}

function renderMinimalOpsAvatar(sections: ResumeSection[], personal: PersonalInfo) {
  return plainResumeShell(`
    <div style="padding:6px 14px 20px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;">
        <div>
          <div style="font-size:34px;font-weight:700;">${escapeHtml(personal.name || "")} - ${escapeHtml(personal.targetRole || "")}</div>
          <div style="margin-top:12px;font-size:13px;color:#222;">👤 ${escapeHtml(personal.gender || "")}/${escapeHtml(personal.birthDate || "")} | 📱 ${escapeHtml(personal.phone || "")} | ✉ ${escapeHtml(personal.email || "")}</div>
        </div>
        <img src="${getAvatar(personal, MALE_AVATAR)}" alt="resume avatar" style="width:104px;height:132px;object-fit:cover;background:#f8fafc;" />
      </div>
      ${sections
        .filter((section) => section.type !== "personal")
        .map((section) => {
          const heading = simpleSectionLine(section.title, "#111827");
          if (section.type === "education") {
            return renderRowsWithHeading(section, heading, "education", {
              leftWidth: "50%",
              rightWidth: "24%",
              descriptionStyle: "text",
            });
          }
          if (section.type === "experience") {
            return renderRowsWithHeading(section, heading, "experience", {
              leftWidth: "42%",
              rightWidth: "24%",
              descriptionStyle: "bullet",
            });
          }
          if (section.type === "projects") {
            return renderRowsWithHeading(section, heading, "projects", {
              leftWidth: "42%",
              rightWidth: "24%",
              descriptionStyle: "bullet",
            });
          }
          if (section.type === "skills") {
            return renderListSection(heading, (section.content as SkillItem[]).map((item) => item.name), "bullet");
          }
          return renderWordFallbackSection(section);
        })
        .join("")}
    </div>
  `);
}

function renderCampusJavaResume(sections: ResumeSection[], personal: PersonalInfo) {
  return plainResumeShell(`
    <div style="padding:10px 12px 24px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;">
        <div style="flex:1;">
          <div style="text-align:center;font-size:34px;font-weight:700;">李明简历</div>
          <div style="display:flex;justify-content:center;gap:14px;margin-top:10px;font-size:13px;flex-wrap:wrap;">
            <span>📞 ${escapeHtml(personal.phone || "")}</span>
            <span>✉ ${escapeHtml(personal.email || "")}</span>
            <span>♀ 女</span>
            <span>⚥ ${escapeHtml(personal.age || "")}</span>
          </div>
          <div style="display:flex;justify-content:center;gap:14px;margin-top:8px;font-size:13px;flex-wrap:wrap;">
            <span>📌 ${escapeHtml(personal.status || "应届毕业生")}</span>
            <span>💼 ${escapeHtml(personal.targetRole || "")}</span>
            <span>📍 ${escapeHtml(personal.location || "")}</span>
          </div>
        </div>
        <img src="${getAvatar(personal, FEMALE_AVATAR)}" alt="resume avatar" style="width:92px;height:122px;object-fit:cover;background:#f8fafc;" />
      </div>
      ${sections
        .filter((section) => section.type !== "personal")
        .map((section) => {
          const heading = simpleSectionLine(section.title, "#22395d");
          if (!["education", "experience", "projects", "skills"].includes(section.type)) {
            return renderWordFallbackSection(section);
          }
          if (section.type === "education") {
            return renderRowsWithHeading(section, heading, "education", {
              leftWidth: "26%",
              rightWidth: "20%",
              descriptionStyle: "bullet",
            });
          }
          if (section.type === "experience") {
            return renderRowsWithHeading(section, heading, "experience", {
              leftWidth: "28%",
              rightWidth: "20%",
              descriptionStyle: "numbered" as never,
            });
          }
          if (section.type === "projects") {
            return renderRowsWithHeading(section, heading, "projects", {
              leftWidth: "28%",
              rightWidth: "20%",
              descriptionStyle: "bullet",
            });
          }
          return renderListSection(heading, (section.content as SkillItem[]).map((item) => item.name), section.title.includes("总结") ? "text" : "bullet");
        })
        .join("")}
    </div>
  `);
}

function renderBlueBlocksJavaResume(sections: ResumeSection[], personal: PersonalInfo) {
  return plainResumeShell(`
    <div style="padding:10px 14px 24px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;">
        <div>
          <div style="font-size:34px;font-weight:700;">李明简历</div>
          <div style="margin-top:10px;font-size:14px;">📞 ${escapeHtml(personal.phone || "")} ✉ ${escapeHtml(personal.email || "")}</div>
        </div>
        <img src="${getAvatar(personal, FEMALE_AVATAR)}" alt="resume avatar" style="width:92px;height:122px;object-fit:cover;background:#f8fafc;" />
      </div>
      ${sections
        .filter((section) => section.type !== "personal")
        .map((section) => {
          const resolvedAccent = resolveWordAccent("#4a6fe6");
          const heading = `<div style="margin-top:18px;background:#eef3ff;padding:8px 12px;border-left:5px solid ${resolvedAccent};font-size:16px;font-weight:700;color:${resolvedAccent};">${escapeHtml(section.title)}</div>`;
          if (section.type === "education") {
            return renderRowsWithHeading(section, heading, "education", {
              leftWidth: "30%",
              rightWidth: "24%",
              descriptionStyle: "text",
            });
          }
          if (section.type === "experience") {
            return renderRowsWithHeading(section, heading, "experience", {
              leftWidth: "24%",
              rightWidth: "24%",
              descriptionStyle: "text",
            });
          }
          if (section.type === "projects") {
            return renderRowsWithHeading(section, heading, "projects", {
              leftWidth: "24%",
              rightWidth: "24%",
              descriptionStyle: "text",
            });
          }
          if (section.type === "skills") {
            return renderListSection(heading, (section.content as SkillItem[]).map((item) => item.name), "text");
          }
          return renderWordFallbackSection(section);
        })
        .join("")}
    </div>
  `);
}

function renderBeigeSidebarGuide(sections: ResumeSection[], personal: PersonalInfo) {
  const extraBlocks = `
    <div style="padding:0 20px;color:#111827;">
      <div style="font-size:42px;font-weight:700;margin-top:18px;">个人简历</div>
      <div style="margin-top:12px;font-size:14px;line-height:2;">
        <div>电话 ${escapeHtml(personal.phone || "")}</div>
        <div>邮箱 ${escapeHtml(personal.email || "")}</div>
      </div>
      <div style="margin-top:24px;font-size:18px;font-weight:700;color:#4a6fe6;">侧栏教育</div>
      ${renderListSection("", getSkillLines(sections, "侧栏教育"), "text")}
      <div style="margin-top:24px;font-size:18px;font-weight:700;color:#4a6fe6;">荣誉奖项</div>
      ${renderListSection("", getSkillLines(sections, "荣誉奖项"), "text")}
      <div style="margin-top:24px;font-size:18px;font-weight:700;color:#4a6fe6;">个人简介</div>
      ${renderListSection("", getSkillLines(sections, "个人简介"), "text")}
    </div>
  `;

  const mainContent = sections
    .filter(
      (section) =>
        section.type === "skills" &&
        !["侧栏教育", "荣誉奖项", "个人简介"].includes(section.title)
    )
    .map((section) => {
      const heading = timelineSectionHeader(section.title, "#4a6fe6");
      return renderListSection(
        heading,
        (section.content as SkillItem[]).map((item) => item.name),
        "numbered"
      );
    })
    .join("");

  return renderSidebarPanelLayout(personal, {
    leftBg: "#ece7d4",
    extraBlocks,
    mainContent,
  });
}

function renderPurpleGuideResume(sections: ResumeSection[], personal: PersonalInfo) {
  return plainResumeShell(`
    <div style="margin:-18px -18px 18px -18px;background:linear-gradient(180deg,#a05ccc 0%,#9d62d4 100%);color:#fff;padding:18px 26px 24px;clip-path:polygon(0 0,100% 0,100% 82%,0 100%);">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:24px;">
        <div>
          <div style="font-size:42px;font-weight:700;">李明简历</div>
          <div style="margin-top:12px;font-size:15px;line-height:1.8;">
            <div>📞 ${escapeHtml(personal.phone || "")} ✉ ${escapeHtml(personal.email || "")} 🌐 ${escapeHtml(personal.github || "")}</div>
            <div>📍 ${escapeHtml(personal.status || "")}  意向职位：${escapeHtml(personal.targetRole || "")}</div>
          </div>
        </div>
        <img src="${getAvatar(personal, FEMALE_AVATAR)}" alt="resume avatar" style="width:96px;height:126px;object-fit:cover;background:#f8fafc;" />
      </div>
    </div>
    ${sections
      .filter((section) => section.type !== "personal")
      .map((section) => {
        const heading = simpleSectionLine(section.title, "#a05ccc", "●");
        if (section.type === "education") {
          return renderRowsWithHeading(section, heading, "education", {
            leftWidth: "22%",
            rightWidth: "24%",
            descriptionStyle: "text",
          });
        }
        if (section.type === "experience") {
          return renderRowsWithHeading(section, heading, "experience", {
            leftWidth: "24%",
            rightWidth: "24%",
            descriptionStyle: "numbered" as never,
          });
        }
        if (section.type === "projects") {
          return renderRowsWithHeading(section, heading, "projects", {
            leftWidth: "24%",
            rightWidth: "24%",
            descriptionStyle: "numbered" as never,
          });
        }
        if (section.type === "skills") {
          return renderListSection(heading, (section.content as SkillItem[]).map((item) => item.name), "numbered");
        }
        return renderWordFallbackSection(section);
      })
      .join("")}
  `);
}

function renderGreenDataRiskResume(sections: ResumeSection[], personal: PersonalInfo) {
  const education = getSectionByTitle(sections, "教育背景", "education");
  const skills = getSkillLines(sections, "技能证书");
  const selfLines = getSkillLines(sections, "自我评价");
  const experience = getSectionByTitle(sections, "工作经历", "experience");

  return plainResumeShell(`
    <div style="margin:-18px -18px 0 -18px;background:#76b5a7;height:48px;"></div>
    <div style="height:8px;background:#76b5a7;margin:6px -18px 18px;"></div>
    <div style="display:grid;grid-template-columns:220px 1fr;column-gap:32px;">
      <div style="padding-left:18px;">
        <img src="${getAvatar(personal, FEMALE_AVATAR)}" alt="resume avatar" style="width:114px;height:146px;object-fit:cover;background:#f8fafc;margin:18px 0 22px 24px;" />
        <div style="font-size:44px;font-weight:700;text-align:center;">${escapeHtml(personal.name || "")}</div>
        <div style="display:flex;align-items:center;gap:10px;justify-content:center;margin-top:6px;">
          <div style="height:2px;width:44px;background:#111827;"></div>
          <div style="font-size:18px;font-weight:700;">求职意向</div>
          <div style="height:2px;width:44px;background:#111827;"></div>
        </div>
        <div style="margin:10px auto 26px;background:#76b5a7;color:#fff;width:160px;text-align:center;padding:6px 0;font-size:16px;font-weight:700;">${escapeHtml(
          personal.targetRole || ""
        )}</div>
        ${
          education
            ? renderListSection(
                simpleSectionLine("教育背景", "#111827"),
                [
                  `${(education.content as EducationItem[])[0]?.school || ""}`,
                  `${(education.content as EducationItem[])[0]?.degree || ""}`,
                  `${splitLines((education.content as EducationItem[])[0]?.description || "").join("\n")}`,
                ],
                "text"
              )
            : ""
        }
        ${renderListSection(simpleSectionLine("技能证书", "#111827"), skills, "text")}
      </div>
      <div>
        ${
          experience
            ? `
              ${timelineSectionHeader("工作经历", "#111827")}
              ${timelineItems(
                (experience.content as ExperienceItem[]).map((item) => ({
                  period: formatPeriod(item.startDate, item.endDate),
                  title: item.company,
                  role: item.role,
                  description: item.description,
                })),
                "#76b5a7"
              )}
            `
            : ""
        }
        ${renderListSection(timelineSectionHeader("自我评价", "#111827"), selfLines, "bullet")}
      </div>
    </div>
    <div style="margin:24px -18px -18px;background:#76b5a7;color:#fff;padding:12px 30px;font-size:14px;display:flex;justify-content:space-around;">
      <div>📱 ${escapeHtml(personal.phone || "")}</div>
      <div>🏠 ${escapeHtml(personal.location || "")}</div>
      <div>✉️ ${escapeHtml(personal.email || "")}</div>
    </div>
  `);
}

function renderJavaBilingualIcons(sections: ResumeSection[], personal: PersonalInfo) {
  const bodyFontSize = resolveBodyFontSize(14);
  const bodyLineHeight = resolveBodyLineHeight(1.9);
  const accent = resolveWordAccent("#5d6f94");
  return plainResumeShell(`
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:18px;margin-bottom:8px;">
      <div style="flex:1;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div style="font-size:34px;font-weight:700;color:#4167a8;">${escapeHtml(personal.name || "")}</div>
          <div style="font-size:18px;letter-spacing:8px;color:#4167a8;">PERSONAL RESUME</div>
        </div>
        <div style="margin-top:6px;font-size:16px;font-weight:700;color:#4167a8;">求职意向：${escapeHtml(
          personal.targetRole || ""
        )}</div>
        <div style="height:8px;background:${accent};margin-top:8px;"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;column-gap:30px;row-gap:6px;margin-top:${Math.max(6, resolveHeadingBottomSpacing(12))}px;font-size:${bodyFontSize}px;line-height:${bodyLineHeight};">
          <div>${labelValue("年 龄：", personal.age || "")}${labelValue("学 历：", personal.education || "")}${labelValue("地 址：", personal.location || "")}</div>
          <div>${labelValue("工作经验：", personal.yearsOfExperience || "")}${labelValue("电 话：", personal.phone || "")}${labelValue("邮 箱：", personal.email || "")}</div>
        </div>
      </div>
      <img src="${getAvatar(personal, MALE_AVATAR)}" alt="resume avatar" style="width:108px;height:142px;object-fit:cover;background:#f8fafc;" />
    </div>
    ${sections
      .filter((section) => section.type !== "personal")
      .map((section) => {
        const icon =
          section.title.includes("教育")
            ? "🎓"
            : section.title.includes("校园")
              ? "📚"
              : section.title.includes("工作")
                ? "💼"
                : section.title.includes("技能")
                  ? "⚙"
                  : "☰";
        const heading = simpleSectionLine(`${section.title}  ${section.title === "教育背景" ? "Education" : section.title === "校园经历" ? "University" : section.title === "工作经历" ? "Experience" : section.title === "个人技能" ? "Expertise" : "Evaluation"}`, "#5d6f94", icon);
        if (section.type === "education") {
          return renderRowsWithHeading(section, heading, "education", {
            leftWidth: "22%",
            rightWidth: "18%",
            descriptionStyle: "text",
          });
        }
        if (section.type === "experience") {
          return renderRowsWithHeading(section, heading, "experience", {
            leftWidth: "22%",
            rightWidth: "18%",
            descriptionStyle: "numbered" as never,
          });
        }
        if (section.type === "projects") {
          return renderRowsWithHeading(section, heading, "projects", {
            leftWidth: "22%",
            rightWidth: "18%",
            descriptionStyle: "numbered" as never,
          });
        }
        if (section.type === "skills") {
          return renderListSection(heading, (section.content as SkillItem[]).map((item) => item.name), "numbered");
        }
        return renderWordFallbackSection(section);
      })
      .join("")}
  `);
}

function renderSlantedGrayJava(sections: ResumeSection[], personal: PersonalInfo) {
  return plainResumeShell(`
    <div style="margin:-18px -18px 10px -18px;background:#555;padding:14px 20px;color:#fff;display:flex;justify-content:flex-end;font-size:18px;letter-spacing:2px;">PERSONAL RESUME</div>
    <div style="display:grid;grid-template-columns:1fr 140px;column-gap:20px;align-items:start;">
      <div>
        <div style="display:flex;align-items:center;gap:18px;">
          <div style="font-size:54px;color:#666;">${escapeHtml(personal.name || "")}</div>
          <div style="font-size:18px;font-weight:700;">求职意向：${escapeHtml(personal.targetRole || "")}</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);column-gap:18px;row-gap:8px;margin-top:12px;font-size:14px;">
          <div>生日：${escapeHtml(personal.birthDate || "")}</div>
          <div>电话：${escapeHtml(personal.phone || "")}</div>
          <div>地址：${escapeHtml(personal.location || "")}</div>
          <div>邮箱：${escapeHtml(personal.email || "")}</div>
        </div>
      </div>
      <img src="${getAvatar(personal, MALE_AVATAR)}" alt="resume avatar" style="width:120px;height:152px;object-fit:cover;background:#f8fafc;" />
    </div>
    ${sections
      .filter((section) => section.type !== "personal")
      .map((section) => {
        const heading = slantedSectionHeader(section.title, "#5a5a5a", section.title.includes("教育") ? "🔗" : section.title.includes("工作") ? "🖥" : section.title.includes("技能") ? "📑" : "👤");
        if (section.type === "education") {
          return renderRowsWithHeading(section, heading, "education", { leftWidth: "24%", rightWidth: "22%", descriptionStyle: "text" });
        }
        if (section.type === "experience") {
          return renderRowsWithHeading(section, heading, "experience", { leftWidth: "24%", rightWidth: "24%", descriptionStyle: "diamond" });
        }
        if (section.type === "skills") {
          return renderListSection(heading, (section.content as SkillItem[]).map((item) => item.name), "text");
        }
        return renderWordFallbackSection(section);
      })
      .join("")}
  `);
}

function renderStripedClassicJava(sections: ResumeSection[], personal: PersonalInfo) {
  return plainResumeShell(`
    <div style="text-align:center;margin-bottom:8px;">
      <div style="font-size:44px;font-weight:700;">个人简历</div>
      <div style="margin-top:6px;font-size:16px;letter-spacing:6px;color:#87684b;">PERSONAL RESUME</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 180px;column-gap:24px;align-items:start;">
      <div style="display:grid;grid-template-columns:repeat(3,1fr);column-gap:18px;row-gap:10px;font-size:15px;line-height:1.8;">
        <div>${labelValue("姓名：", personal.name || "")}${labelValue("学历：", personal.education || "")}${labelValue("年龄：", personal.age || "")}</div>
        <div>${labelValue("求职意向：", personal.targetRole || "")}${labelValue("到岗时间：", personal.status || "")}${labelValue("工作年限：", personal.yearsOfExperience || "")}</div>
        <div>${labelValue("期望薪资：", personal.expectedSalary || "")}${labelValue("电话：", personal.phone || "")}${labelValue("邮箱：", personal.email || "")}</div>
      </div>
      <img src="${getAvatar(personal, FEMALE_AVATAR)}" alt="resume avatar" style="width:128px;height:160px;object-fit:cover;background:#f8fafc;" />
    </div>
    ${sections
      .filter((section) => section.type !== "personal")
      .map((section) => {
        const resolvedAccent = resolveWordAccent("#3f3f3f");
        const heading = `<div style="display:flex;align-items:center;gap:8px;margin-top:18px;"><div style="background:${resolvedAccent};color:#fff;padding:6px 18px;font-size:16px;font-weight:700;">${escapeHtml(section.title)}</div><div style=\"flex:1;height:2px;background:${resolvedAccent};opacity:0.35;\"></div></div>`;
        if (section.type === "education") {
          return renderRowsWithHeading(section, heading, "education", { leftWidth: "22%", rightWidth: "22%", descriptionStyle: "text" });
        }
        if (section.type === "experience") {
          return renderRowsWithHeading(section, heading, "experience", { leftWidth: "22%", rightWidth: "24%", descriptionStyle: "numbered" as never });
        }
        if (section.type === "skills") {
          return renderListSection(heading, (section.content as SkillItem[]).map((item) => item.name), "numbered");
        }
        return renderWordFallbackSection(section);
      })
      .join("")}
  `);
}

function renderBlueBorderJava(sections: ResumeSection[], personal: PersonalInfo) {
  return plainResumeShell(`
    <div style="margin:-18px -18px 12px -18px;background:#5875a8;height:20px;"></div>
    <div style="border:3px solid #d0d8e8;padding:20px 26px 30px;">
      <div style="display:grid;grid-template-columns:1fr 150px;column-gap:24px;align-items:start;">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);column-gap:18px;row-gap:8px;font-size:14px;line-height:1.9;">
          <div>${labelValue("姓名：", personal.name || "")}${labelValue("出生：", personal.birthDate || "")}${labelValue("民族：", personal.ethnicity || "")}</div>
          <div>${labelValue("应聘：", personal.targetRole || "")}${labelValue("学历：", personal.education || "")}${labelValue("籍贯：", personal.location || "")}</div>
          <div>${labelValue("工作年限：", personal.yearsOfExperience || "")}${labelValue("联系手机：", personal.phone || "")}${labelValue("电子邮箱：", personal.email || "")}</div>
        </div>
        <img src="${getAvatar(personal, MALE_AVATAR)}" alt="resume avatar" style="width:110px;height:142px;object-fit:cover;background:#f8fafc;" />
      </div>
      ${sections
        .filter((section) => section.type !== "personal")
        .map((section) => {
          const resolvedAccent = resolveWordAccent("#5875a8");
          const heading = `<div style="display:inline-flex;align-items:center;gap:10px;border:3px solid ${resolvedAccent};padding:4px 16px;margin-top:18px;font-size:16px;font-weight:700;color:${resolvedAccent};">${escapeHtml(section.title)}</div>`;
          if (section.type === "education") {
            return renderRowsWithHeading(section, heading, "education", { leftWidth: "24%", rightWidth: "24%", descriptionStyle: "text" });
          }
          if (section.type === "experience") {
            return renderRowsWithHeading(section, heading, "experience", { leftWidth: "24%", rightWidth: "24%", descriptionStyle: "numbered" as never });
          }
          if (section.type === "skills") {
            return renderListSection(heading, (section.content as SkillItem[]).map((item) => item.name), "text");
          }
          return renderWordFallbackSection(section);
        })
        .join("")}
    </div>
  `);
}

function renderSeniorOpsMinimal(sections: ResumeSection[], personal: PersonalInfo) {
  return plainResumeShell(`
    <div style="font-size:34px;font-weight:700;">${escapeHtml(personal.name || "")} – ${escapeHtml(personal.targetRole || "")}</div>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:18px;margin-top:12px;font-size:14px;">
      <div>👤 ${escapeHtml(personal.gender || "")}/${escapeHtml(personal.birthDate || "")}<br/>💬 ${escapeHtml(personal.wechat || "")}</div>
      <div>🏠 ${escapeHtml(personal.website || "")}<br/>🐙 ${escapeHtml(personal.github || "")}</div>
    </div>
    ${sections
      .filter((section) => section.type !== "personal")
      .map((section) => {
        const heading = simpleSectionLine(section.title, "#111827");
        if (section.type === "education") return renderRowsWithHeading(section, heading, "education", { leftWidth: "55%", rightWidth: "24%", descriptionStyle: "text" });
        if (section.type === "experience") return renderRowsWithHeading(section, heading, "experience", { leftWidth: "40%", rightWidth: "24%", descriptionStyle: "bullet" });
        if (section.type === "projects") return renderRowsWithHeading(section, heading, "projects", { leftWidth: "40%", rightWidth: "24%", descriptionStyle: "bullet" });
        if (section.type === "skills") {
          return renderListSection(heading, (section.content as SkillItem[]).map((item) => item.name), "bullet");
        }
        return renderWordFallbackSection(section);
      })
      .join("")}
  `);
}

function renderDarkHeaderFrontend(sections: ResumeSection[], personal: PersonalInfo) {
  const intro = getSkillLines(sections, "个人简介");
  const work = getSectionByTitle(sections, "工作经历", "experience");

  return plainResumeShell(`
    <div style="margin:-18px -18px 18px -18px;background:#3a3a3a;color:#fff;padding:18px 24px 24px;">
      <div style="font-size:38px;font-weight:700;">个人简历 · ${escapeHtml(personal.targetRole || "前端工程师")}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;column-gap:30px;row-gap:8px;margin-top:14px;font-size:14px;line-height:1.8;">
        <div>
          ${escapeHtml(personal.name || "李明")}/${escapeHtml(personal.gender || "男")}/${escapeHtml(personal.birthDate || "xxxx.xx")}<br/>
          ${escapeHtml(personal.location || "xxxx")}/${escapeHtml(personal.graduateSchool || "某某大学")}<br/>
          ${escapeHtml(personal.education || "本科")}/${escapeHtml(personal.politicalStatus || "群众")}
        </div>
        <div style="text-align:right;">
          网站 ${escapeHtml(personal.website || "https://qiufeng.blue")}<br/>
          GitHub ${escapeHtml(personal.github || "https://github.com/hua1995116")}<br/>
          邮箱 ${escapeHtml(personal.email || "qiufenghyf@163.com")}<br/>
          微信 ${escapeHtml(personal.wechat || "qiufengblue")}
        </div>
      </div>
    </div>
    ${renderListSection(capsuleSectionHeader("个人简介", "#e6e6e6"), intro, "text")}
    ${
      work
        ? `
            ${capsuleSectionHeader("工作经历", "#e6e6e6")}
            ${(work.content as ExperienceItem[])
              .map(
                (item) => `
                  <div style="margin-top:14px;">
                    <div style="display:flex;justify-content:space-between;gap:12px;font-size:14px;font-weight:700;">
                      <div>${escapeHtml(item.company)} · ${escapeHtml(formatPeriod(item.startDate, item.endDate))}</div>
                    </div>
                    <div style="margin-top:8px;display:flex;gap:10px;font-size:12px;flex-wrap:wrap;">
                      ${splitLines(item.role)
                        .map(
                          (line) =>
                            `<span style="background:#ededed;padding:4px 10px;border-radius:999px;">${escapeHtml(line)}</span>`
                        )
                        .join("")}
                    </div>
                    ${bulletList(splitLines(item.description), 12.5, 1.75)}
                  </div>
                `
              )
              .join("")}
          `
        : ""
    }
  `);
}

function renderPlaceholderCampusResume(sections: ResumeSection[], personal: PersonalInfo) {
  return plainResumeShell(`
    <div style="display:grid;grid-template-columns:1fr 130px;column-gap:20px;align-items:start;">
      <div>
        <div style="font-size:34px;font-weight:700;">${escapeHtml(personal.name || "")}</div>
        <div style="margin-top:8px;font-size:14px;">${escapeHtml(personal.phone || "")} | ${escapeHtml(personal.email || "")} | ${escapeHtml(personal.website || "")}</div>
        <div style="margin-top:6px;font-size:13px;">籍贯 住址（简短，只要强调现在位置即可）</div>
      </div>
      <img src="${getAvatar(personal, FEMALE_AVATAR)}" alt="resume avatar" style="width:96px;height:126px;object-fit:cover;background:#f8fafc;" />
    </div>
    ${sections
      .filter((section) => section.type !== "personal")
      .map((section) => {
        const heading = simpleSectionLine(section.title, "#111827");
        if (section.type === "education") return renderRowsWithHeading(section, heading, "education", { leftWidth: "42%", rightWidth: "22%", descriptionStyle: "bullet" });
        if (section.type === "experience") return renderRowsWithHeading(section, heading, "experience", { leftWidth: "44%", rightWidth: "22%", descriptionStyle: "bullet" });
        if (section.type === "projects") return renderRowsWithHeading(section, heading, "projects", { leftWidth: "42%", rightWidth: "22%", descriptionStyle: "bullet" });
        if (section.type === "skills") {
          return renderListSection(heading, (section.content as SkillItem[]).map((item) => item.name), "text");
        }
        return renderWordFallbackSection(section);
      })
      .join("")}
  `);
}

function buildTemplate15Sections(): ResumeSection[] {
  return [
    createPersonalSection("mintDesignerClean", {
      name: "胡小豆",
      targetRole: "设计师",
      age: "21岁",
      graduateSchool: "中国美院",
      location: "北京",
      phone: "133xxxxxxx",
      email: "258xxx@xx.com",
      avatar: FEMALE_AVATAR,
    }),
    createEducationSection("mintDesignerClean", "教育背景", [
      educationItem("edu-1", "中国美术学院", "视觉传达专业", "20xx.3", "20xx.6", "优秀实习生、优秀毕业设计、校级奖学金二等奖、英语演讲比赛一等奖爱那邦"),
    ]),
    createExperienceSection("mintDesignerClean", "工作经历", [
      experienceItem("exp-1", "某某服装公司", "实习设计师", "20xx.3", "20xx.6", "负责设计公司相关产品的 UI 设计。\n排版相关文章，设计相关产品，编辑相关产品。\n更显产品的 UI 框架。\n对相关产品提出自己的一键或者几解等。"),
      experienceItem("exp-2", "某某服装公司", "实习设计师", "20xx.3", "20xx.6", "负责设计公司相关产品的 UI 设计。\n排版相关文章，设计相关产品，编辑相关产品。\n更显产品的 UI 框架。\n对相关产品提出自己的一键或者几解等。"),
    ]),
    createSkillsSection("mintDesignerClean", "专业技能", [
      skillItem("s1", "美感较好，擅长使用各种作图软件，能够熟练排版，设计产品，能够独立设计产品，熟悉整个工作流程，熟练使用常用办公软件。"),
      skillItem("s2", "经常参加各类设计比赛，曾经获得小级别最佳设计师，在 XX 杂志上方便玻造论文等，为学校创业项目设计 UI，熟练使用 PS 等常用作图工具，擅长编辑裁剪图片，热爱摄影等。"),
    ]),
    createSkillsSection("mintDesignerClean", "自我评价", [
      skillItem("s3", "本人是美术专业毕业生，有良好的美感，擅长使用各种作图软件。"),
      skillItem("s4", "对于服装设计有一定的见解，有一定的美感，经常浏览国外时尚网站。"),
      skillItem("s5", "熟悉服装设计的工作流程，对于工作的整体流程有一定的把握。"),
      skillItem("s6", "性格开朗活泼，乐于帮助他人，善于学习型的知识。"),
    ]),
  ];
}

function buildTemplate16Sections(): ResumeSection[] {
  return [
    createPersonalSection("darkSidebarManager", {
      name: "胡小豆",
      targetRole: "产品经理",
      birthDate: "20xx.06",
      currentCity: "北京海淀",
      education: "大学本科",
      title: "视觉传达",
      phone: "152 0000 0000",
      wechat: "Se7enPPT",
      website: "@月亮六便士",
      email: "xx@xx.com",
      avatar: MALE_AVATAR,
    }),
    createEducationSection("darkSidebarManager", "教育背景", [
      educationItem("edu-1", "湖北工业大学", "企业管理 / 专业 / 本科", "20XX.09", "20XX.06", ""),
      educationItem("edu-2", "湖北工业大学", "平面设计 / 专业 / 选修", "20XX.09", "20XX.06", ""),
    ]),
    createExperienceSection("darkSidebarManager", "工作经历", [
      experienceItem("exp-1", "武汉云石网络科技有限公司", "策划专员", "20XX.09", "20XX.06", "1. 项目进行期，能够制定短期目标，引导团队成员完成各项任务，来进行项目进度管理；\n2. 负责项目的推广，内测期间用微博与讲座结合获得 310 客户；"),
      experienceItem("exp-2", "武汉云石网络科技有限公司", "策划总监", "20XX.09", "20XX.06", "1. 项目进行期，能够制定短期目标，引导团队成员完成各项任务；\n2. 善用目标激励与情感激励，参赛小组至今仍保持团队文化。"),
    ]),
    createProjectsSection("darkSidebarManager", "校内实践", "campus", [
      projectItem("proj-1", "湖工工程院会计系办公室", "行政助理", "20XX.09", "20XX.06", "内务支持：负责收发传真复印、扫描文档、收发信件、文件、快递等；\n活动支持：负责学校员工活动，各会议安排、组织、文体活动安排。"),
    ]),
    createSkillsSection("darkSidebarManager", "证书奖励", [
      skillItem("k1", "通用技能证书：英语四级证书、普通话二级甲等证书、机动车驾驶证。"),
      skillItem("k2", "专业技能证书：Adobe 认证设计师资质，WPS 年度最佳设计师。"),
      skillItem("k3", "活动荣誉奖励：20XX 年湖北省创青春创业计划挑战专项赛银奖。"),
    ]),
    createSkillsSection("darkSidebarManager", "自我评价", [
      skillItem("k4", "良好的公共关系意识，善于沟通，具备活动策划和组织协调能力。"),
      skillItem("k5", "良好的心态和责任感，吃苦耐劳，擅于管理时间，勇于面对变化和挑战。"),
      skillItem("k6", "良好的学习能力，习惯制定切实可行的学习计划，勤于学习能不断提高。"),
    ]),
  ];
}

function buildTemplate17Sections(): ResumeSection[] {
  return [
    createPersonalSection("blueSidebarSales", {
      name: "胡小豆",
      targetRole: "销售经理",
      ethnicity: "北京",
      location: "北京朝阳区",
      birthDate: "20xx.09",
      politicalStatus: "团员",
      phone: "186-0000-0000",
      email: "XXXX@xx.com",
      avatar: FEMALE_AVATAR,
    }),
    createEducationSection("blueSidebarSales", "教育背景", [
      educationItem("edu-1", "苏州学院", "营销学专业 / 本科", "20XX.9", "20XX.6", "主修课程：西方经济学会计学基础、税法、成本会计、财务会计、会计电算化、中级财务管理、审计、会计电算化、税务学等。"),
    ]),
    createExperienceSection("blueSidebarSales", "工作经历", [
      experienceItem("exp-1", "苏州文化发展有限公司", "销售实习生", "20XX.07", "20XX.08", "快速学习收藏专业知识与行业动态，跟随销售主管学习销售话术和销售技巧；\n每天拨打电话约 100 条，及时发现客户的潜在需求，根据客户的需要为客户推荐藏品；\n与几家大客户建立并保持良好的关系，并连续两个月得到了月度销售亚军。"),
      experienceItem("exp-2", "苏宁电器苏州分店", "兼职销售", "20XX.07", "20XX.04", "主要工作为在门店销售华硕品牌的电脑产品，为顾客做产品介绍、性能讲解，并答疑解惑；\n每天工作 8 个小时，日销售额 10000 元，超额完成销售指标；\n完成领导布置的其他任务。"),
    ]),
    createSkillsSection("blueSidebarSales", "技能证书", [
      skillItem("s1", "语言能力：大学英语四级证书。"),
      skillItem("s2", "普通话水平二级甲等证书。"),
      skillItem("s3", "普通话流利。"),
      skillItem("s4", "具有良好的沟通表达能力。"),
      skillItem("s5", "计算机能力：全国计算机二级证书。"),
      skillItem("s6", "熟练掌握 word、excel、PPT 等日常办公软件。"),
    ]),
    createSkillsSection("blueSidebarSales", "兴趣爱好", [
      skillItem("h1", "游泳、篮球、羽毛球"),
      skillItem("h2", "摄影、户外运动"),
    ]),
    createSkillsSection("blueSidebarSales", "自我评价", [
      skillItem("e1", "1 年协会秘书长经历，1 年组织委员经历，多次策划组织活动经历，专业成绩优秀，具备较强学习能力和适应能力，有团队精神，能快速融入新团队；"),
      skillItem("e2", "有销售相关实习经历，熟悉销售工作流程，能准确发现客户潜在需求并有针对性的销售，能够胜任高压力的销售工作。"),
    ]),
  ];
}

function buildTemplate18Sections(): ResumeSection[] {
  return [
    createPersonalSection("grayMarketingBars", {
      name: "小豆",
      targetRole: "市场运营专员",
      birthDate: "1996.05",
      location: "广东省 广州市",
      phone: "13800000000",
      email: "xxx@xx.me",
      avatar: FEMALE_AVATAR,
    }),
    createSkillsSection("grayMarketingBars", "自我评价", [
      skillItem("e1", "有多年营销与管理经验，有较强的处理客户投诉能力及销售技巧，具备高度的工作热情和良好的团队合作精神；"),
      skillItem("e2", "懂得消费者心理，对行业市场有一定的判断力，具有一定的数据分析能力；"),
      skillItem("e3", "能够针对客户对产品的反馈，并结合主要竞争对手的市场变化，提出建议性方案或合理化建议；"),
      skillItem("e4", "善于收集客户信息，妥善处理客户的不满和意见，进行客户需求分析，向运营及相关部门提出合理化建议；"),
      skillItem("e5", "熟悉电商平台并有一定的电商客服主管经验，能够专业处理售前售后的事情，了解政策资源，能调动员工积极性；"),
      skillItem("e6", "善于对业务流程进行优化，不断追求提高服务效率和服务质量。"),
    ]),
    createEducationSection("grayMarketingBars", "教育背景", [
      educationItem("edu-1", "尚景设计科技大学", "市场营销（本科）", "20xx.07", "20xx.06", "主修课程：管理学、微观经济学、宏观经济学、管理信息系统、统计学、会计学、财务管理、市场营销、经济法、消费者行为学、国际市场营销等。"),
    ]),
    createExperienceSection("grayMarketingBars", "实习经历", [
      experienceItem("exp-1", "尚景设计科技有限公司", "市场营销（实习生）", "20xx.04", "至今", "工作描述：\n负责公司线上端资源的销售工作，公司主要资源以广点通、百度、小米、沃门户等；\n实时了解行业的变化，跟踪客户的详细数据，为客户制定更完善的投放计划（合作过珍爱网、世纪佳缘、56 视频、京东等客户）。"),
      experienceItem("exp-2", "尚景科技信息有限公司", "软件工程师", "20xx.03", "20xx.03", "工作描述：\n负责公司业务系统的设计及改进，参与公司网上商城系统产品功能设计及实施工作；\n负责客户调研、客户需求分析、方案写作等工作，参与公司多个大型电子商务项目的策划工作。"),
    ]),
    createSkillsSection("grayMarketingBars", "奖项荣誉", [
      skillItem("a1", "20xx-20xx 学年 荣获优秀团队、艺术活动优秀奖。"),
      skillItem("a2", "20xx-20xx 学年 优秀学生干部、学生会优秀干部称号。"),
      skillItem("a3", "20xx-20xx 学年 荣获社会工作先进个人、优秀学生干部称号。"),
    ]),
    createSkillsSection("grayMarketingBars", "技能证书", [
      skillItem("s1", "普通话一级甲等；"),
      skillItem("s2", "大学英语四/六级（CET-4/6），良好的听说读写能力，快速浏览英语专业书籍；"),
      skillItem("s3", "通过全国计算机二级考试，熟练运用 Office 相关软件。"),
    ]),
  ];
}

function buildTemplate19Sections(): ResumeSection[] {
  return [
    createPersonalSection("tealTimelineDesigner", {
      name: "胡小豆",
      targetRole: "设计师",
      age: "24 岁",
      ethnicity: "山东",
      education: "本科",
      phone: "139XXXX5678",
      email: "XXX@123.com",
      avatar: FEMALE_AVATAR,
    }),
    createEducationSection("tealTimelineDesigner", "教育背景", [
      educationItem("edu-1", "北京某大设计学院", "本科", "20XX", "20XX", "设计专业"),
    ]),
    createExperienceSection("tealTimelineDesigner", "工作经历", [
      experienceItem("exp-1", "设计顾问有限公司", "平面设计师", "20XX", "20XX", "负责企业画册设计、标志设计、产品包装设计、杂志广告跨页设计、户外广告。\n对公司的网站后台周期性的修改和维护。\n对公司所有的宣传广告全程负责一直到完成阶段。"),
      experienceItem("exp-2", "设计顾问有限公司", "平面设计师", "20XX", "20XX", "负责企业画册设计、标志设计、产品包装设计、杂志广告跨页设计、户外广告。\n对公司的网站后台周期性的修改和维护。\n对公司所有的宣传广告全程负责一直到完成阶段。"),
      experienceItem("exp-3", "设计顾问有限公司", "平面设计师", "20XX", "20XX", "负责企业画册设计、标志设计、产品包装设计、杂志广告跨页设计、户外广告。\n对公司的网站后台周期性的修改和维护。\n对公司所有的宣传广告全程负责一直到完成阶段。"),
      experienceItem("exp-4", "设计顾问有限公司", "平面设计师", "20XX", "20XX", "负责企业画册设计、标志设计、产品包装设计、杂志广告跨页设计、户外广告。\n对公司的网站后台周期性的修改和维护。\n对公司所有的宣传广告全程负责一直到完成阶段。"),
    ]),
    createSkillsSection("tealTimelineDesigner", "自我评价", [
      skillItem("e1", "填入自我评价，填入自我评价填入自我评价。"),
      skillItem("e2", "修改为自我评价填入自我评价填入自我评价。"),
      skillItem("e3", "填入自我评价，填入自我评价填入自我评价。"),
      skillItem("e4", "修改为自我评价填入自我评价填入自我评价。"),
      skillItem("e5", "填入自我评价，填入自我评价填入自我评价。"),
    ]),
    createSkillsSection("tealTimelineDesigner", "个人爱好", [
      skillItem("h1", "爱好一"),
      skillItem("h2", "爱好二"),
      skillItem("h3", "爱好三"),
      skillItem("h4", "爱好四"),
      skillItem("h5", "爱好五"),
    ]),
  ];
}

function buildTemplate20Sections(): ResumeSection[] {
  return [
    createPersonalSection("tealTeacherFlow", {
      name: "胡小豆",
      targetRole: "教师",
      birthDate: "20xx.09-20xx.07",
      location: "广东省广州市",
      phone: "1350xxxx00",
      email: "sXXXe@xx.me",
      avatar: FEMALE_AVATAR,
    }),
    createEducationSection("tealTeacherFlow", "教育背景", [
      educationItem("edu-1", "安徽科技大学", "学前教育 / 本科", "20xx.09", "20xx.07", "主修课程：幼儿教育学、幼儿心理学、幼儿卫生学、美术教学法、科学教学法、语言教学法、数学教学法、音乐教学法、体育教学法、游戏学、舞蹈、钢琴、声乐、儿童舞编排、编配儿童歌曲（双手弹奏）、儿童文学、普通话、幼儿园工作规程等。"),
    ]),
    createExperienceSection("tealTeacherFlow", "工作经历", [
      experienceItem("exp-1", "实验幼儿园", "教师 / 实习", "20xx.09", "20xx.07", "多年来曾经从事幼儿舞蹈、绘画、英语特长班教学，有丰富的工作经验。\n编排的幼儿舞蹈《掀起你的盖头来》获得总公司文艺汇报演出二等奖。\n指导的幼儿舞蹈《好儿郎》获得幼儿组一等奖。\n近来教《弟子规》《中庸》《大学》等经典教育。"),
      experienceItem("exp-2", "实验幼儿园", "教师 / 实习", "20xx.09", "20xx.07", "多年来曾经从事幼儿舞蹈、绘画、英语特长班教学，有丰富的工作经验。\n编排的幼儿舞蹈《掀起你的盖头来》获得总公司文艺汇报演出二等奖。\n指导的幼儿舞蹈《好儿郎》获得幼儿组一等奖。\n近来教《弟子规》《中庸》《大学》等经典教育。"),
    ]),
    createSkillsSection("tealTeacherFlow", "技能证书", [
      skillItem("s1", "教师资格证。"),
      skillItem("s2", "CET-6，优秀的听说写能力。"),
      skillItem("s3", "计算机二级，熟悉计算机各项操作。"),
      skillItem("s4", "高级营销员，国家职业资格四级。"),
    ]),
    createSkillsSection("tealTeacherFlow", "自我评价", [
      skillItem("e1", "1. 我在读英语专业的，在天津有三年的幼儿教师经验！"),
      skillItem("e2", "2. 经过三年的认真学习和不懈努力，我已具备了系统的专业知识和一定的教学实践能力。"),
      skillItem("e3", "3. 现在正准备以高昂的热情与所学的知识投入到社会之中，服务于教育事业，实现自身价值。"),
      skillItem("e4", "4. 我深深地懂得实践的重要性，所以多次到其他优秀幼儿园教研。受到其他老师们的一致好评。"),
    ]),
  ];
}

function buildTemplate21Sections(): ResumeSection[] {
  return [
    createPersonalSection("darkDualColumnIntern", {
      name: "胡小豆",
      targetRole: "外贸实习生",
      phone: "133xxxxxxxxx",
      email: "xxxx@xxxx.com",
      avatar: FEMALE_AVATAR,
    }),
    createEducationSection("darkDualColumnIntern", "教育背景", [
      educationItem("edu-1", "XX 设计科技大学", "金融学（本科）", "20xx.09", "20xx.07", "主修课程：国际金融、货币银行学、宏观/微观经济学、商业银行、保险学、基础会计、证券投资、计量经济、统计学、财政学、微积分、大学英语、国际贸易、计算机运用。"),
    ]),
    createExperienceSection("darkDualColumnIntern", "工作经历", [
      experienceItem("exp-1", "XXX 设计等一个人咖啡", "店店长兼咖啡师", "20xx.09", "20xx.12", "统筹店里各项事务，进行咖啡原料的采购；进行销售产品的营业计划；策划组织店内运营消费活动以提高营业额；具有一定担当策划能力，能带领团队很好的完成各项任务。"),
      experienceItem("exp-2", "麦当劳 XXX 设计大学东院店收银服务员", "", "20xx.01", "20xx.03", "在不同的工作岗位上服务顾客；协助餐厅达到最佳的质量、服务、清洁水平；让顾客感到宾至如归；能够适应快节奏和轮班工作环境。"),
      experienceItem("exp-3", "XXX 设计家乐福", "产品促销员", "20xx.07", "20xx.10", "尝试使用了各种不同的销售技巧，使一些消费者提高购买欲望；在向消费者宣传商品以企业间同时，也提高了一些品牌的知名度；具有良好的亲和力以及人际交往能力。"),
    ]),
    createProjectsSection("darkDualColumnIntern", "校内实践", "campus", [
      projectItem("proj-1", "XXX 设计大学海声老乡会", "会长", "20xx.03", "20xx.06", "负责社团组织建设、社团机构管理，协调各部门工作；组织策划社团传统文艺活动，策划多次社团文体活动以增进老乡之间的感情，提高文化归属感；如青岛大学老乡篮球运动会、端午中秋等传统节日的文艺联欢会。"),
    ]),
    createSkillsSection("darkDualColumnIntern", "技能证书", [
      skillItem("s1", "CET-4；"),
      skillItem("s2", "计算机二级，熟练掌握 office 办公软件 word、excel、ppt 等；C1 驾驶证。"),
      skillItem("s3", "CET-4；"),
      skillItem("s4", "计算机二级，熟练掌握 office 办公软件 word、excel、ppt 等；C1 驾驶证。"),
    ]),
    createSkillsSection("darkDualColumnIntern", "自我评价", [
      skillItem("e1", "我是一个阳光、开朗、乐观向上的人，抗压能力强；有较强的组织能力、活动策划能力。"),
      skillItem("e2", "在大学期间曾担任校团委文体部部长、班级宣传委员、老乡会会长，多次领衔组织体育、娱乐活动，各类晚会，并取得良好效果。"),
    ]),
  ];
}

function buildTemplate22Sections(): ResumeSection[] {
  return [
    createPersonalSection("floralMarketingSoft", {
      name: "胡小豆",
      birthDate: "20xx 年 8 月 10 日",
      ethnicity: "深 也",
      currentCity: "都 市",
      graduateSchool: "深林大学",
      education: "本科",
      title: "平面设计",
      avatar: FEMALE_AVATAR,
    }),
    createEducationSection("floralMarketingSoft", "教育经历", [
      educationItem("edu-1", "院校 专业", "大学/学院 / 就读细节（某某院校）", "20xx", "20xx", ""),
      educationItem("edu-2", "院校 专业", "大学/学院 / 就读细节（某某院校）", "20xx", "20xx", ""),
      educationItem("edu-3", "职业 培训", "大学/学院 / 就读细节（某某机构）", "20xx", "20xx", ""),
    ]),
    createSkillsSection("floralMarketingSoft", "获奖情况", [
      skillItem("a1", "20xx – 20xx。 所持证书：英语四级证书、普通话二级甲等证书。"),
      skillItem("a2", "20xx – 20xx。 研究生阶段：优秀党员、校级优秀毕业生。"),
      skillItem("a3", "20xx – 20xx。 本科阶段：校级三好学生、系级三好学生、优秀学生干部、优秀主持人。"),
    ]),
    createSkillsSection("floralMarketingSoft", "自我评价", [
      skillItem("e1", "本人是市场营销专业毕业生，有丰富的营销知识体系做基础；对于市场营销方面的前沿和动向有一定的了解，善于分析和吸取经验；"),
    ]),
  ];
}

function buildTemplate23Sections(): ResumeSection[] {
  return [
    createPersonalSection("sageTeacherSidebar", {
      name: "小豆",
      gender: "女",
      birthDate: "20XX. 01. 01",
      ethnicity: "汉族",
      location: "北京·朝阳区",
      education: "本科",
      politicalStatus: "党员",
      yearsOfExperience: "一年",
      phone: "1000000000",
      email: "00000123.cn",
      targetRole: "英语教师",
      status: "全职",
      expectedSalary: "5000-8000",
      avatar: FEMALE_AVATAR,
    }),
    createSkillsSection("sageTeacherSidebar", "奖项证书", [
      skillItem("a1", "教师资格证书。"),
      skillItem("a2", "英语教师资格证。"),
      skillItem("a3", "普通话二级甲等。"),
    ]),
    createEducationSection("sageTeacherSidebar", "教育背景", [
      educationItem("edu-1", "双 Y 学院", "对外汉语", "20XX. 09", "20XX. 07", "主修课程：基础英语、英语写作、英汉翻译、现代、古代汉语、中国文学、外国文学、国外汉学研究、语言学概论、对外汉语教学概论。"),
    ]),
    createExperienceSection("sageTeacherSidebar", "工作经历", [
      experienceItem("exp-1", "XXX 实验中学", "初中英语老师", "20XX. 03", "20XX. 06", "1. 为学生提供专业、高质量的英语教学服务；\n2. 帮助学生提高学习兴趣，养成良好的学习方法及习惯；\n3. 与学生和家长保持良好、长期的合作关系，不断学习提高业务水平；\n4. 参加学科教研活动，努力提高自身的教师水平。"),
      experienceItem("exp-2", "XXX 实验中学", "高中英语老师", "20XX. 03", "20XX. 06", "1. 负责初中或高中英语科目的教学和服务工作；\n2. 进行个性化课程准备及授课，为学生提供高质量的教学服务；\n3. 帮助学生提高学科学习兴趣，帮助养成好的学习方法及学习习惯；\n4. 课中严格完成授课目标，和学生良好互动沟通，打造高效课堂。"),
    ]),
    createSkillsSection("sageTeacherSidebar", "个人技能", [
      skillItem("s1", "语言能力：具有很强的英文读写能力，英语口语流利，普通话标准。"),
      skillItem("s2", "职业技能：讲课条理清晰、风趣幽默，有互动，能够因材施教，启发教学。"),
      skillItem("s3", "办公技能：熟练使用 Excel、Word 及 Office 等办公软件。"),
    ]),
    createSkillsSection("sageTeacherSidebar", "自我评价", [
      skillItem("e1", "1. 热爱教育行业，有良好的客户服务意识、能适应灵活的工作时间；"),
      skillItem("e2", "2. 良好的教师职业操守和服务意识，热爱教育工作，热爱学生，为人师表；"),
      skillItem("e3", "3. 有责任心、抗压力强、执行力强。"),
    ]),
  ];
}

function buildTemplate24Sections(): ResumeSection[] {
  return [
    createPersonalSection("cyanHeaderDesigner", {
      name: "胡小豆",
      targetRole: "网页 / 平面设计师",
      currentCity: "北京海淀",
      birthDate: "20XX.07.",
      politicalStatus: "党员",
      phone: "13500000000",
      email: "Xg@xx.com",
      avatar: FEMALE_AVATAR,
    }),
    createEducationSection("cyanHeaderDesigner", "教育背景", [
      educationItem("edu-1", "湖北工业大学工程技术学院", "企业管理专业 / 本科学历", "20XX.09", "20XX.06", ""),
      educationItem("edu-2", "湖北工业大学工程技术学院", "平面设计专业 / 选修结业", "20XX.09", "20XX.06", ""),
    ]),
    createExperienceSection("cyanHeaderDesigner", "工作经历", [
      experienceItem("exp-1", "武汉云石网络科技有限公司", "新媒体运营部 / 策划专员", "20XX.09", "20XX.06", "领导能力：项目进行期，能够制定短期目标，引导团队成员完成各项任务，来进行项目进度管理；\n营销能力：负责项目的推广，内测期间用微博与讲座结合获得 310 客户；取得不错效果；"),
      experienceItem("exp-2", "武汉云石网络科技有限公司", "新媒体运营部 / 策划总监", "20XX.09", "20XX.06", "领导能力：项目进行期，能够制定短期目标，引导团队成员完成各项任务，来进行项目进度管理；\n合作能力：善用目标激励与情感激励，参赛小组至今仍保持团队文化。"),
    ]),
    createProjectsSection("cyanHeaderDesigner", "校内实践", "campus", [
      projectItem("proj-1", "学院会计系办公室", "办公室行政助理", "20XX.09", "20XX.06", "内务支持：负责收发学校传真复印、扫描文档、收发信件、文件、快递包裹的接收等；\n活动支持：负责学校员工活动，各种会议安排、组织、文体活动安排等；"),
    ]),
    createSkillsSection("cyanHeaderDesigner", "证书奖励", [
      skillItem("s1", "通用技能证书：英语四级证书、普通话二级甲等证书、机动车驾驶证。"),
      skillItem("s2", "专业技能证书：Adobe 认证设计师资质，WPS 年度最佳设计师。"),
      skillItem("s3", "活动荣誉奖励：20XX 年湖北省创青春创业计划挑战专项银奖。"),
    ]),
    createSkillsSection("cyanHeaderDesigner", "自我评价", [
      skillItem("e1", "良好的公共关系意识，善于沟通，具备一定的活动策划和组织协调能力。"),
      skillItem("e2", "良好的心态和责任感，吃苦耐劳，擅于管理时间，勇于面对变化和挑战。"),
      skillItem("e3", "良好的学习能力，习惯制定切实可行的学习计划，勤于学习能不断提高。"),
    ]),
  ];
}

function buildTemplate25Sections(): ResumeSection[] {
  return [
    createPersonalSection("blueCampusAwards", {
      name: "小豆",
      birthDate: "20xx.05",
      ethnicity: "汉",
      phone: "10000000000",
      email: "123@123.me",
      location: "广东省广州市海珠区",
      height: "177cm",
      politicalStatus: "中共党员",
      graduateSchool: "XX 师范大学",
      education: "本科",
      avatar: FEMALE_AVATAR,
    }),
    createEducationSection("blueCampusAwards", "教育背景", [
      educationItem("edu-1", "XXX 师范大学", "市场营销（本科）", "20XX.07", "20XX.06", "主修课程：管理学、微观经济学、宏观经济学、管理信息系统、统计学、会计学、财务管理、市场营销、经济法、消费者行为学、国际市场营销。"),
    ]),
    createProjectsSection("blueCampusAwards", "校园实践", "campus", [
      projectItem("proj-1", "XXX 科技大学", "辩论队（队长）", "20XX.05", "20XX.06", "负责 50 余人团队的日常训练、选拔及团队建设；\n作为负责人对接多项商业校园行活动，如《奔跑吧兄弟》XXX 大学站录制、《时代周末》校园行。"),
      projectItem("proj-2", "沟通与交流协会", "创始人 / 副会长", "20XX.11", "20XX.06", "协助湖北省通协分会创立武汉大学分部，从零开始组建初期团队；\n策划协会会员制、选拔、培训协会导师，推出一系列沟通课程。"),
    ]),
    createSkillsSection("blueCampusAwards", "奖项荣誉", [
      skillItem("a1", "20XX 年 新长城四川大学自强社“优秀社员”。"),
      skillItem("a2", "20XX 年 三下乡“社会实践活动”优秀学生。"),
      skillItem("a3", "20XX 年 四川大学学生田径运动会 10 人立定跳远团体赛第三名。"),
      skillItem("a4", "20XX 年 学生军事技能训练“优秀学员”。"),
      skillItem("a5", "20XX 年 四川大学盼盼杯烘焙食品创意大赛优秀奖。"),
    ]),
    createSkillsSection("blueCampusAwards", "技能证书", [
      skillItem("s1", "普通话一级甲等。"),
      skillItem("s2", "通过全国计算机二级考试，熟练运用 office 相关软件。"),
      skillItem("s3", "熟练使用绘声绘色软件，剪辑过各种类型的电影及班级视频。"),
      skillItem("s4", "大学英语四/六级（CET-4/6），良好的听说读写能力，快速浏览英语专业书籍。"),
    ]),
    createSkillsSection("blueCampusAwards", "自我评价", [
      skillItem("e1", "拥有多年的市场管理及品牌营销经验，卓越的规划、组织、策划、方案执行和团队领导能力。"),
      skillItem("e2", "积累较强的人际关系处理能力和商务谈判技巧，善于沟通，具备良好的合作关系掌控能力与市场开拓能力。"),
    ]),
  ];
}

function buildTemplate26Sections(): ResumeSection[] {
  return [
    createPersonalSection("darkTopSales", {
      name: "胡小豆",
      targetRole: "市场营销（国企）",
      age: "24 岁",
      phone: "1380xxxx000",
      email: "xx@xx.com",
      currentCity: "北京市",
      avatar: FEMALE_AVATAR,
    }),
    createEducationSection("darkTopSales", "教育背景", [
      educationItem("edu-1", "鹿大仙师范科技大学", "市场营销（本科）", "20XX.07", "20XX.06", "主修课程：管理学、微观经济学、宏观经济学、管理信息系统、统计学、会计学、财务管理、市场营销、经济法、消费者行为学、国际市场营销。"),
    ]),
    createExperienceSection("darkTopSales", "实习经验", [
      experienceItem("exp-1", "鹿大仙素材店信息科技有限公司", "市场营销（实习生）", "20XX.04", "至今", "负责公司线上端资源的销售工作（以开拓客户为主）；\n公司主要资源以广点通、智汇推、百度、小米、360、沃门户等；\n实时了解行业的变化，跟踪客户的详细数据，为客户制定更完善的投放计划。"),
      experienceItem("exp-2", "鹿大仙素材店信息科技有限公司", "软件工程师", "20XX.03", "20XX.03", "负责公司业务系统的设计及改进；\n参与公司网上商城系统产品功能设计及实施工作；\n负责客户调研、客户需求分析、方案写作等工作；\n参与公司多个大型电子商务项目的策划工作。"),
    ]),
    createProjectsSection("darkTopSales", "校园经历", "campus", [
      projectItem("proj-1", "鹿大仙师范科技大学", "校园大使主席", "20XX.03", "20XX.06", "目标项目自己的团队，辅助完成在各高校的“伏龙计划”，向全球顶尖的 AXA 金融公司推送实习生资源。\n整体运营前期开展了相关的线上线下宣传活动，中期为进行咨询的人员提供讲解。\n后期进行了项目的维护阶段，保证了整个项目的完整性。"),
    ]),
    createSkillsSection("darkTopSales", "技能证书", [
      skillItem("s1", "普通话一级甲等；"),
      skillItem("s2", "大学英语四/六级（CET-4/6），良好的听说读写能力，快速浏览英语专业文件及书籍；"),
      skillItem("s3", "通过全国计算机二级考试，熟练运用 office 相关软件。"),
    ]),
    createSkillsSection("darkTopSales", "自我评价", [
      skillItem("e1", "深度互联网从业人员，对互联网保持高度的敏感性和关注度，熟悉产品开发流程，有很强的产品规划、需求分析、交互设计能力，能够立承担 APP 和 WEB 项目的管控工作，善于沟通，贴近用户。"),
    ]),
  ];
}

function buildTemplate27Sections(): ResumeSection[] {
  return [
    createPersonalSection("grayFinanceLight", {
      name: "胡小豆",
      targetRole: "金融分析师",
      birthDate: "20XX.02",
      location: "广东省珠海市",
      phone: "135xxxxxxx",
      email: "xx@xx.com",
      avatar: FEMALE_AVATAR,
    }),
    createEducationSection("grayFinanceLight", "教育背景", [
      educationItem("edu-1", "鹿大仙设计科技大学", "税务专业（本科）", "20XX.09", "20XX.07", "主修课程：金融学、管理学、微观经济学、宏观经济学、中级微观经济学、中级宏观经济学、统计学、会计学、中级财务会计、税法、审计、税收筹划、国家预算、外汇理论与实务、私募股权投资与理论、计算机应用等。"),
    ]),
    createExperienceSection("grayFinanceLight", "工作经验", [
      experienceItem("exp-1", "农商银行广州支行", "个贷经理（助理）", "20XX.04", "至今", "销售行个人贷款产品，信用卡，POS 机。\n协助签约，关注客户信用评估，跟进业务受理进度。\n了解部分柜台的业务知识；学习理财知识。\n实践成果：较全面掌握个贷部业务，对整个银行业务流程都有了基础的了解和掌握，熟练掌握银行平台操作业务。"),
      experienceItem("exp-2", "广州税务师事务所", "软件工程师", "20XX.03", "20XX.03", "整理企业记账凭证和账单，结合所学会计专业知识了解查账流程。\n学习审查货币资金。\n实践成果：学会了填制审计工作底稿的相关程序以及会计处理。"),
    ]),
    createSkillsSection("grayFinanceLight", "奖项证书", [
      skillItem("a1", "20XX.07 荣获全国青少年钢琴大赛福建赛业余少年组一等奖。"),
      skillItem("a2", "20XX.09 五百万学院一等奖学金。"),
      skillItem("a3", "会计从业资格证、英语 CET4 证书、全国普通话二级甲等、全国计算机一级证书、钢琴业余十级证书。"),
    ]),
    createSkillsSection("grayFinanceLight", "自我评价", [
      skillItem("e1", "品格评价：本人品德优良，个性随和富有亲和力，人际关系良好，能较快融入集体，待人诚恳乐于助人。"),
      skillItem("e2", "生活上喜欢弹钢琴、唱歌、运动，对个人修养的提高有较大的帮助，性格开朗活泼，面对困难能积极乐观并努力寻找解决方法。"),
      skillItem("e3", "在大学四年间的专业知识，掌握了较系统的金融知识和会计知识，让自己学习了多方面的课程学习。"),
    ]),
  ];
}

function buildTemplate28Sections(): ResumeSection[] {
  return [
    createPersonalSection("blueNurseResume", {
      name: "小豆",
      targetRole: "护士护理",
      birthDate: "20XX.07",
      location: "上海浦东",
      phone: "18000000000",
      yearsOfExperience: "1年",
      email: "123456@XX.com",
      politicalStatus: "党员",
      avatar: FEMALE_AVATAR,
    }),
    createEducationSection("blueNurseResume", "教育背景", [
      educationItem("edu-1", "上海职业技术学院", "护理专业（大专）", "20XX.09", "20XX.06", "主修：护理学导论、护理美学、基础护理学、健康评估、内科护理学、外科护理学、妇产科护理学、儿科护理学、老年病护理学、精神病护理学、传染病护理学、急救护理、护理心理学、护理教育、护理管理。"),
    ]),
    createExperienceSection("blueNurseResume", "工作经历", [
      experienceItem("exp-1", "上海天山医疗集团", "销售实习生", "20XX.05", "20XX.05", "认真执行门诊医生处方各种针剂的注射，负责出诊及各项医疗器械物品的消毒工作；\n配合医生处理外伤，及门诊的抢救工作；\n对院前突发事件的应急处理和门诊输液的输液反应的处理能有条不紊的进行；\n协助护士长督促各班护士认真执行各个本职工作，严防事故差错的发生；"),
      experienceItem("exp-2", "上海职业技术学院义务活动", "志愿者", "20XX.11", "20XX.04", "认随医学院来到高槐社区老人活动中心，为 70 多位老人量血压、义诊并解答咨询；\n为卧床老人翻身、扣背、指导用药。发放健康处方 100 余份；\n教育家属如何做好卧床病人的皮肤护理，以减少褥疮产生；\n帮助老人调节拐杖高度，以方便使用。"),
    ]),
    createSkillsSection("blueNurseResume", "证书奖励", [
      skillItem("s1", "语言能力：普通话二级甲等，英语 CET-6。"),
      skillItem("s2", "办公能力：计算机二级，熟练掌握 PPT、WORD、EXCEL 等办公软件；"),
      skillItem("s3", "获得荣誉：连续三年获得国家励志奖学金；"),
    ]),
    createSkillsSection("blueNurseResume", "自我评价", [
      skillItem("e1", "良好的公共关系意识，善于沟通，具备一定的活动策划和组织协调能力。"),
      skillItem("e2", "良好的心态和责任感，吃苦耐劳，擅于管理时间，勇于面对变化和挑战。"),
      skillItem("e3", "良好的学习能力，习惯制定切实可行的学习计划，勤于学习能不断提高。"),
    ]),
  ];
}

function buildTemplate29Sections(): ResumeSection[] {
  return [
    createPersonalSection("minimalFrontendPlain", {
      name: "秋风",
      targetRole: "前端工程师",
      phone: "178-xxx-2228",
      email: "qiufenghyf@163.com",
      yearsOfExperience: "3年经验",
    }),
    createEducationSection("minimalFrontendPlain", "教育经历", [
      educationItem("edu-1", "xx大学", "软件工程 本科", "2014", "2018", "主修课程：数据结构、计算机网络、操作系统、Web 前端开发、数据库原理、软件工程、算法设计与分析。"),
    ]),
    createSkillsSection("minimalFrontendPlain", "介绍", [
      skillItem("i1", "于2015年开始接触前端，喜欢编码，有 Geek 精神，对代码有洁癖，喜欢接触前沿技术，爱折腾。"),
      skillItem("i2", "获得省、国家级竞赛奖项9项（包含浙江省大学生多媒体竞赛一等奖1项）。"),
      skillItem("i3", "主持参与省、国家级项目4项；发表论文4篇，其中2篇EI索引。"),
    ]),
    createSkillsSection("minimalFrontendPlain", "技术栈", [
      skillItem("s1", "熟悉 JavaScript / TypeScript / ESNext，理解闭包、原型链、异步任务、模块化与工程化构建流程。"),
      skillItem("s2", "熟悉 React、Vue、Next.js、状态管理、组件抽象和复杂表单开发，能够独立完成中后台与活动页开发。"),
      skillItem("s3", "熟悉 Webpack、Vite、Babel、ESLint、Prettier 等前端工程工具，能优化构建体积、首屏性能和发布流程。"),
      skillItem("s4", "了解 Node.js、Redis、Elasticsearch、日志采集与监控链路，具备前后端协作和问题排查能力。"),
    ]),
    createExperienceSection("minimalFrontendPlain", "工作", [
      experienceItem("exp-1", "杭州兑吧网络有限公司", "前端架构组", "2018.7", "至今", "负责业务中台、监控平台和内部效率工具的前端研发，推进组件复用、异常监控和发布流程优化。\n沉淀表单、表格、权限、图表等通用模块，减少重复开发成本，提升多个业务线交付效率。\n参与前端工程化规范建设，补充 ESLint、提交校验、构建分析和灰度发布流程，降低线上回归风险。"),
      experienceItem("exp-2", "杭州兑吧网络有限公司 - 实习", "前端架构组", "2018.3", "2018.7", "前端错误监控系统（基建）（负责人）接入量 pv:3000w。\nweb端js-sdk开发，无侵入式接入，压缩后仅2kb。\n收集端Node开发、分布式存储日志。\n阿里云日志服务分析以及常用的数据分析。\nechart搭建可视化平台。\n前端性能监控系统（负责人）接入 pv:1000w。\nwebpack插件将外链形式改写成内联形式，优化落地页脚本加载。"),
      experienceItem("exp-3", "网易 – 实习", "信息技术部", "2017.11", "2018.3", "前端监控系统客户端监控载体端以及数据脚本开发。\n基于highcharts的可视化图形界面开发。\n平台的性能统计模块以及告警模块开发。\n高并发下的redis设计以及错误信息识别过滤处理。"),
    ]),
    createProjectsSection("minimalFrontendPlain", "项目经历", "frontend", [
      projectItem("p1", "落地页截图服务", "负责人", "2018.5", "2018.7", "基于 Node.js、Puppeteer 和 Cluster 实现批量截图服务。\n将 300 张页面截图耗时从约 60 分钟优化到 8 分钟，提升约 7 倍。\n设计自定义队列和失败重试机制，避免高并发场景下 Node 端请求丢失。"),
      projectItem("p2", "前端性能监控平台", "核心开发", "2018.3", "2018.6", "负责 Web SDK、日志上报、数据可视化和查询聚合模块。\n支持自定义上报、自动采集、错误聚合和趋势分析，帮助业务快速定位页面性能瓶颈。\n封装 Elasticsearch 查询模块，并结合 Redis 缓存优化高频查询性能。"),
    ]),
    createSkillsSection("minimalFrontendPlain", "开源与成果", [
      skillItem("o1", "维护 webpack-plugin-inner-script 等工具型插件，关注工程效率、构建产物和线上加载性能。"),
      skillItem("o2", "长期输出前端工程化、性能监控、可视化平台相关实践文章，具备良好的技术总结能力。"),
      skillItem("o3", "具备从问题定位、方案设计、编码实现到上线复盘的完整闭环经验。"),
    ]),
  ];
}

function buildTemplate30Sections(): ResumeSection[] {
  return [
    createPersonalSection("minimalOpsAvatar", {
      name: "小木",
      targetRole: "运维工程师",
      gender: "男",
      birthDate: "1999.12",
      phone: "1232142144",
      email: "dqefqfq@163.com",
      avatar: MALE_AVATAR,
    }),
    createExperienceSection("minimalOpsAvatar", "工作经历", [
      experienceItem("exp-1", "天津XXX 有限公司", "Linux运维工程师", "2021 年 12 月", "2022 年 04 月", "协助项目负责人，完成与客户的对接工作，并根据客户的需求，制定相关的技术解决方案；\n利用云运维技术，负责公司旗下云产品的日常运维工作，包括产品的运营、ES、存储等；\n负责部门Windows、Linux系统平台下的服务器部署工作，以及日常的维护、分析、故障排查工作；\n定期对服务器进行优化升级，确保服务器可以正常、高效的运转。"),
      experienceItem("exp-2", "北京 XXX 有限公司", "Linux运维工程师", "2021 年 09 月", "2021 年 12 月", "负责机房的维护工作，每日对机房进行巡视，并定期进行检测，确保公司网络正常运行；\n负责公司内部网络的搭建以及相关网络设备的正常运作；\n不定期对网络进行故障排查，确保在第一时间解决相关问题，保证公司网络顺利、高效运行；\n根据公司需求，参与到具体项目中，负责部分线上和线下的工作，参与部分业务部署；\n负责相关技术文档的编写，基于效率优化的原则，编写脚本，并利用脚本提升运维工作效率。"),
    ]),
    createProjectsSection("minimalOpsAvatar", "工作以外经历", "side-project", [
      projectItem("proj-1", "XX网站运维项目", "", "", "", "配合项目负责人，根据公司需要完成自动化运维工作，并根据实际制定方案，提升运维团队的工作效率；\n实时对运维数据进行监控和分析，并整合数据，行程报告，提交项目负责人；\n及时排查运维数据中出现的故障问题，并提出行之有效的解决方案，确保服务器正常运转；\n协助技术、测试部门完成系统升级工作，以及构架调整工作；\n按照要求，运用专业、准确的语言规范编写相关技术文档。"),
    ]),
    createEducationSection("minimalOpsAvatar", "教育经历", [
      educationItem("edu-1", "天津工业大学", "软件工程本科", "2018.09", "2022.06", ""),
    ]),
    createSkillsSection("minimalOpsAvatar", "其他", [
      skillItem("s1", "技能：熟练配置 nginx、tomcat、jboss、mysql、memcached、redis；"),
      skillItem("s2", "能编写 shell、perl脚本；熟悉 MySQL、ORACLE；"),
      skillItem("s3", "Sqlserver 数据库安装、配置、调试以及优化；"),
    ]),
  ];
}

function buildTemplate31Sections(): ResumeSection[] {
  return [
    createPersonalSection("campusJavaResume", {
      name: "李明",
      targetRole: "后端Java开发",
      phone: "13181821996",
      email: "mycv@gmail.com",
      gender: "女",
      age: "22",
      status: "应届毕业生",
      location: "深圳",
      avatar: FEMALE_AVATAR,
    }),
    createEducationSection("campusJavaResume", "教育经历", [
      educationItem("edu-1", "西北工业大学", "计算机科学与技术专业 / 本科", "2020-09", "2024-07", "GPA: 3.7/4.0（专业前三）\n在校期间自主开发了在线写简历系统，并申请了软件著作权专利。"),
    ]),
    createExperienceSection("campusJavaResume", "实习经历", [
      experienceItem("exp-1", "华为技术有限公司", "创新业务部 Java后端工程师 深圳", "2023-12", "至今", "1、负责研发领域IT系统技术方案的设计、开发等工作；\n2、负责项目开发过程中的技术攻关及解决运行中出现的技术问题；\n3、负责产品核心模块的代码编写和LTT测试；\n4、负责产品疑难问题的分析和定位。"),
    ]),
    createSkillsSection("campusJavaResume", "专业技能", [
      skillItem("s1", "编程基础与操作系统"),
      skillItem("s2", "熟悉 java 主流框架、容器及数据库，能够解决疑难问题。如 Spring，tomcat，MySQL 等。"),
      skillItem("s3", "熟悉微服务框架（如：Dubbo、ZooKeeper、Redis、Spring Cloud等）以及应用，有SOA或分布式高并发系统的设计和开发经验。"),
      skillItem("s4", "了解消息队列、分布式缓存、NoSQL、分词搜索等技术，能够快速掌握相关来源产品及使用。"),
    ]),
    createProjectsSection("campusJavaResume", "项目经历", "campus-java-proj", [
      projectItem("proj-1", "运营商计费系统项目", "Java后端开发工程师 深圳", "2023-07", "2023-12", "项目描述：该项目主要为中国电信提供可靠的计费系统，以处理大量的用户数据和计费事务。\n利用 Java 和 Spring Boot 框架，负责设计并实现后端 API，包括用户计费、账单生成等功能。\n通过优化 SQL 查询和使用 Redis 缓存，显著提升了系统的响应速度和处理能力。\n与团队紧密合作，采用敏捷开发方法，确保按时交付高质量的软件迭代。\n面对高并发挑战，实现了基于 RabbitMQ 的消息队列系统，有效平衡了系统负载。", "https://www.laoyujianli.com"),
    ]),
    createSkillsSection("campusJavaResume", "个人总结", [
      skillItem("x1", "热爱编程，基础扎实，熟悉掌握 Java，有良好的编程习惯。"),
      skillItem("x2", "具备独立工作能力和解决问题的能力，善于沟通，乐于合作，热衷新技术，善于总结分享，喜欢动手实践。"),
    ]),
  ];
}

function buildTemplate32Sections(): ResumeSection[] {
  return [
    createPersonalSection("blueBlocksJavaResume", {
      name: "李明",
      phone: "15372232131",
      email: "3072323235@qq.com",
      avatar: FEMALE_AVATAR,
    }),
    createEducationSection("blueBlocksJavaResume", "教育经历", [
      educationItem("edu-1", "浙江工业大学", "软件工程 / 本科", "2021-09", "2022-06", "非全日制   信息工程学院   杭州\n主修课程：Java编程基础（95分）、Java并发编程、Spring框架、Hibernate、微服务架构\n获奖证书：Oracle Certified Java Programmer、Spring Professional认证"),
    ]),
    createSkillsSection("blueBlocksJavaResume", "专业技能", [
      skillItem("s1", "Java技能1"),
      skillItem("s2", "熟练掌握 Java 核心技术，如集合类、反射、异常处理、多线程、面向对象程序设计。"),
      skillItem("s3", "Java技能2"),
      skillItem("s4", "熟悉 Java 虚拟机原理和优化，具备 Java 性能调优的经验。"),
    ]),
    createExperienceSection("blueBlocksJavaResume", "工作经历", [
      experienceItem("exp-1", "恒通科技", "后端开发部 Java 杭州", "2023-02", "2023-04", "在RapidTech公司，负责e-commerce平台的核心开发，使用Java Spring Boot和Hibernate实现，提升了系统响应速度30%。"),
      experienceItem("exp-2", "恒通科技", "后端开发部 Java 杭州", "2023-02", "2023-04", "为XYZ公司设计高并发Java应用，利用JVM调优和多线程技术，每秒处理上万请求。"),
    ]),
    createProjectsSection("blueBlocksJavaResume", "项目经历", "blue-java-proj", [
      projectItem("proj-1", "电商平台项目", "杭州", "2023-07", "2023-07", "主导了电商平台的后端开发，采用Spring Boot和MyBatis技术，处理了高并发订单请求。", "https://www.example.cn"),
      projectItem("proj-2", "电商平台项目", "杭州", "2023-07", "2023-07", "在团队中负责金融系统的开发，运用Java多线程和JVM优化，提高了交易处理速度。", "https://www.example.cn"),
    ]),
  ];
}

function buildTemplate33Sections(): ResumeSection[] {
  return [
    createPersonalSection("beigeSidebarGuide", {
      name: "李明",
      phone: "15372232131",
      email: "3072323235@qq.com",
      avatar: FEMALE_AVATAR,
    }),
    createSkillsSection("beigeSidebarGuide", "侧栏教育", [
      skillItem("e1", "XX 大学"),
      skillItem("e2", "XXXX，本科"),
      skillItem("e3", "2021-09 ～ 2022-06"),
      skillItem("e4", "非全日制 xxx学院 杭州"),
    ]),
    createSkillsSection("beigeSidebarGuide", "荣誉奖项", [
      skillItem("a1", "国家奖学金          2023-07"),
    ]),
    createSkillsSection("beigeSidebarGuide", "个人简介", [
      skillItem("i1", "有责任感、乐观，积极面对困难和挑战。"),
    ]),
    createSkillsSection("beigeSidebarGuide", "专业技能", [
      skillItem("s1", "具体性和量化"),
      skillItem("s2", "在描述你的技能时，尽量具体和量化。使用数字、百分比或具体的项目经验来支持你的陈述。例如，“成功管理了5个项目，每个项目的预算超过100万美元，并在预定时间内完成了它们”。"),
      skillItem("s3", "1. 关联职位要求：针对申请的特定职位，确保你的技能描述与招聘公告中的要求和关键词相匹配。这可以提高你的简历通过筛选的机会。"),
      skillItem("s4", "2. 使用动词：在描述技能时，使用有力的动词来传达你的行动和成就。例如，“领导团队，实施了新的流程改进，提高了生产效率”。"),
      skillItem("s5", "3. 简明扼要：尽量保持技能描述简明扼要。使用清晰而紧凑的语言来传达关键信息。"),
    ]),
    createSkillsSection("beigeSidebarGuide", "工作经历", [
      skillItem("w1", "xxxxxx"),
      skillItem("w2", "XXX XXX 杭州          2023-02 ～ 2023-04"),
      skillItem("w3", "1. 量化成就：尽量提供与你的工作成就相关的具体数据和度量标准。例如来说，“提高销售额10%以上”或“减少生产成本20%”。"),
      skillItem("w4", "2. 重点成就：突出你在该职位上取得的最重要成就。这可以包括项目成功、销售增长、成本削减、客户满意度提升等方面的成就。"),
      skillItem("w5", "3. 团队合作：如果你在团队中工作，描述你如何与团队成员协作，以实现共同目标。强调协作和领导经验。"),
      skillItem("w6", "4. 问题解决：描述你在工作中面临的挑战以及你如何解决这些问题。突出你的解决问题的能力。"),
      skillItem("w7", "5. 成长和发展：如果你在职位期间学到了新技能，接受了培训或晋升了，务必提及。这显示了你的职业发展和成长。"),
      skillItem("w8", "6. 行业专业知识：如果你的职位要求特定的行业专业知识，描述你在这方面的了解和经验。"),
      skillItem("w9", "7. 使用关键词：使用与目标职位和行业相关的关键词，以确保你的简历与招聘要求相匹配。"),
    ]),
    createSkillsSection("beigeSidebarGuide", "项目经历", [
      skillItem("p1", "xxxxxx"),
      skillItem("p2", "XXX 杭州                    2023-07 ～ 2023-07"),
      skillItem("p3", "https://www.example.cn"),
      skillItem("p4", "1. 关键词使用：使用与目标职位和行业相关的关键词，以确保你的项目经历与招聘要求相匹配。"),
      skillItem("p5", "2. 团队协作：强调你与团队成员的协作，以及如何促进团队合作，实现项目目标。"),
      skillItem("p6", "3. 关键词使用：使用与目标职位和行业相关的关键词，以确保你的项目经历与招聘要求相匹配。"),
    ]),
  ];
}

function buildTemplate34Sections(): ResumeSection[] {
  return [
    createPersonalSection("purpleGuideResume", {
      name: "李明",
      phone: "15372232131",
      email: "mycv@gmail.com",
      github: "https://github.com",
      status: "在职-考虑机会",
      targetRole: "全栈开发",
      avatar: FEMALE_AVATAR,
    }),
    createEducationSection("purpleGuideResume", "教育经历", [
      educationItem("edu-1", "上海交通大学", "计算机科学与技术 / 本科 / 计算机学院", "2020-09", "2024-07", "全日制"),
    ]),
    createSkillsSection("purpleGuideResume", "专业技能", [
      skillItem("s1", "具体性和量化"),
      skillItem("s2", "在描述你的技能时，尽量具体和量化。使用数字、百分比或具体的项目经验来支持你的陈述。例如，“成功管理了5个项目，每个项目的预算超过100万美元，并在预定时间内完成了它们”。"),
      skillItem("s3", "其他"),
      skillItem("s4", "1. 关联职位要求：针对申请的特定职位，确保你的技能描述与招聘公告中的要求和关键词相匹配。这可以提高你的简历通过筛选的机会。"),
      skillItem("s5", "2. 使用动词：在描述技能时，使用有力的动词来传达你的行动和成就。例如，“领导团队，实施了新的流程改进，提高了生产效率”。"),
      skillItem("s6", "3. 简明扼要：尽量保持技能描述简明扼要。使用清晰而紧凑的语言来传达关键信息。"),
    ]),
    createExperienceSection("purpleGuideResume", "工作经历", [
      experienceItem("exp-1", "XXX 互联网有限公司", "XXX部 技术人员 杭州", "2023-02", "2023-04", "1. 量化成就：尽量提供与你的工作成就相关的具体数据和度量标准。举例来说，“提高销售额10%以上”或“减少生产成本20%”。\n2. 重点成就：突出你在该职位上取得的最重要成就。这可以包括项目成功、销售增长、成本削减、客户满意度提升等方面的成就。\n3. 团队合作：描述你如何与团队成员协作，以实现共同目标。强调协作和领导经验。\n4. 问题解决：描述你在工作中面临的挑战以及你如何解决这些问题。突出你的解决问题的能力。\n5. 成长和发展：如果你在职位期间学到了新技能，接受了培训或晋升了，务必提及。这显示了你的职业发展和成长。\n6. 行业专业知识：如果你的职位要求特定的行业专业知识，描述你在这方面的了解和经验。\n7. 使用关键词：使用与目标职位和行业相关的关键词，以确保你的简历与招聘要求相匹配。"),
    ]),
    createProjectsSection("purpleGuideResume", "项目经历", "purple-guide-proj", [
      projectItem("proj-1", "xxxxxx", "XXX 杭州", "2023-07", "2023-07", "1. 关键词使用：使用与目标职位和行业相关的关键词，以确保你的项目经历与招聘要求相匹配。\n2. 团队协作：强调你与团队成员的协作，以及如何促进团队合作，实现项目目标。\n3. 关键词使用：使用与目标职位和行业相关的关键词，以确保你的项目经历与招聘要求相匹配。", "https://www.example.cn"),
    ]),
  ];
}

function buildTemplate35Sections(): ResumeSection[] {
  return [
    createPersonalSection("greenDataRiskResume", {
      name: "小豆",
      targetRole: "数据分析实习生",
      phone: "131XXXXXXXX",
      email: "XXX@xx.com",
      location: "广东省广州市",
      avatar: FEMALE_AVATAR,
    }),
    createEducationSection("greenDataRiskResume", "教育背景", [
      educationItem("edu-1", "XXX设计大学", "会计学（本科）", "", "", "主修课程：基本会计、统计学、市场营销、国际市场营销、市场调查与预测、商业心理学、广告学、公共关系学、货币银行学、经济法、国际贸易、大学英语、经济数学、计算机应用等。"),
    ]),
    createSkillsSection("greenDataRiskResume", "技能证书", [
      skillItem("s1", "CET-6"),
      skillItem("s2", "优秀的听说写能力"),
      skillItem("s3", "计算机二级"),
      skillItem("s4", "熟悉计算机各项操作"),
      skillItem("s5", "高级会计证书"),
    ]),
    createExperienceSection("greenDataRiskResume", "工作经历", [
      experienceItem("exp-1", "广州xxx设计网络科技有限公司", "司风控负责人", "20xx.01", "20xx.06", "负责建模风控部门；\n风控制度、风控流程的建立；\n引进多家风控大数据平台，确保风险把控到位；\n对贷款客户的进件材料进行审查，并利用征信大数据平台对客户的信用、涉案、社会信息，多重负债进行查询；\n参与并主要负责与其他互联网平台的合作。"),
      experienceItem("exp-2", "xxx设计数据有限公司", "司业务风控经理", "20xx.10", "20xx.01", "安排本组人员完成项目资格审查，材料收集工作。\n对贷款主体材料事实、合法、合规性审查，对贷款企业财务数据进行评估分析。\n对贷款企业实地考察，审查其经营情况，场地情况，团队能力，实际控制人情况。\n上门通话后，安排本组工作人员办理相关手续，包括：面签合同、强制性公证、办理抵押手续等。\n项目手续完成后，出具公司董事会决议，放款通知。\n按季季度进行回访，收集最新的财务数据定期下户回访，审查企业真实经营情况，确认返程撤销情况。"),
    ]),
    createSkillsSection("greenDataRiskResume", "自我评价", [
      skillItem("e1", "本人取得助理会计师职业资格。"),
      skillItem("e2", "作为银行业的从业者，在贷款项目审查、风险控制的环节不论什么原因，会坚持自己的原则和底线，并详细出有理有据的观点。"),
      skillItem("e3", "熟悉担保，传统金融贷款，互联网金融的业务模式及业务流程。"),
      skillItem("e4", "熟悉房产抵押，车辆抵押，股权质押等类流程。"),
      skillItem("e5", "有各类相关资源，包括：抵押、公证、银行、评估等，有多家直审可见的大数据平台资源。"),
      skillItem("e6", "有良好的工作习惯，习惯每日撰写工作日志、总结项目经验，努力补充专业知识。"),
    ]),
  ];
}

function buildTemplate36Sections(): ResumeSection[] {
  return [
    createPersonalSection("javaBilingualIcons", {
      name: "蛋蛋",
      targetRole: "JAVA 工程师",
      age: "22 岁",
      yearsOfExperience: "应届生",
      education: "本科学士学位",
      phone: "188-8888-8888",
      location: "北京市朝阳区",
      email: "docer@qq.com",
      avatar: MALE_AVATAR,
    }),
    createEducationSection("javaBilingualIcons", "教育背景", [
      educationItem("edu-1", "北京某区某某大学", "软件工程", "20XX.09", "20XX.06", "主修课程：高等数学、大学物理、物理实验、线性代数、概率论与数理统计、数据结构、离散数学、操作系统、程序设计语言、编译技术、软件工程概论等。\n校内荣誉：连续 2 年获得校综合奖学金“励志奖”，学习成绩优异，获校三好学生。"),
    ]),
    createProjectsSection("javaBilingualIcons", "校园经历", "campus", [
      projectItem("proj-1", "学生会网络信息部", "部门干事", "20XX.09", "20XX.06", "1、在校期间任学生会网络信息部干事，负责学校官方网站、微信公众号的维护和运营。\n2、负责为学校活动进行技术支持，包括设备后台操作、网络技术、平面设计、视频后期制作等。\n3、负责过某互联网产品的校园推广，进行很好的策划和宣传，吸引了5000+用户注册使用。"),
    ]),
    createExperienceSection("javaBilingualIcons", "工作经历", [
      experienceItem("exp-1", "北京某某有限公司", "实习工程师", "20XX.06", "20XX.10", "1、参与项目需求分析，编写概要设计、详细设计文档；\n2、根据项目具体要求，承担开发任务，按计划完成任务目标；\n3、完成项目编码实现、单元测试，协助测试人员完成模块测试，并对模块质量负责；"),
    ]),
    createSkillsSection("javaBilingualIcons", "个人技能", [
      skillItem("s1", "1、熟悉 Spring、SpringMVC、MyBatis、Springboot 等开发技术框架；"),
      skillItem("s2", "2、熟悉 MySql、Oracle 数据库，能编写较复杂的 SQL，具备一定的 SQL 优化能力；"),
      skillItem("s3", "3、熟练使用 Eclipse + Myeclipse，IDEA 等开发工具；熟悉常用的 Java 设计模式；"),
      skillItem("s4", "4、具备一定的需求分析和系统设计能力，较强的逻辑分析和独立解决问题能力；"),
    ]),
    createSkillsSection("javaBilingualIcons", "自我评价", [
      skillItem("e1", "本人热爱 JAVA 开发工作，熟悉 DUBBO、微服务，具备良好的编码规范；"),
      skillItem("e2", "熟悉关系型数据库，熟练使用 SQL 语言，掌握基本的 SQL 优化；"),
      skillItem("e3", "能承受出差；沟通能力佳，并具备一定的文档编写能力。"),
    ]),
  ];
}

function buildTemplate37Sections(): ResumeSection[] {
  return [
    createPersonalSection("slantedGrayJava", {
      name: "谭小辉",
      targetRole: "java 开发工程师",
      birthDate: "1989.1.18",
      phone: "13333333333",
      location: "深圳罗湖区",
      email: "00000@00.com",
      avatar: MALE_AVATAR,
    }),
    createEducationSection("slantedGrayJava", "教育背景", [
      educationItem("edu-1", "海洋大学", "计算机科学与技术专业/本科", "20XX.X", "20XX.X", ""),
    ]),
    createExperienceSection("slantedGrayJava", "工作经历", [
      experienceItem("exp-1", "辉煌文化传播有限公司", "Java 开发工程师", "20XX.X", "20XX.X", "参加清洁掌平台功能的设计、开发、单元测试、系统优化；\n参与系统平台产品实施、设计和优化，参与部分功能模块设计、数据结构设计、对外接口设计；\n参与日常项目版本升级、部署及实施工作；\n根据公司软件开发规范要求，编制软件开发设计文档，保证开发过程的透明度与可控性；"),
      experienceItem("exp-2", "辉煌文化传播有限公司", "Java 开发工程师", "20XX.X", "20XX.X", "与公司系统安全平台、安全管理平台等产品需求分析、负责技术方案的设计；\n负责产品功能模块代码的实现、维护及产品相关技术文档的编写；\n及时响应并处理客户反馈问题，保障项目的交付及运行。"),
    ]),
    createSkillsSection("slantedGrayJava", "专业技能", [
      skillItem("s1", "办公技能：熟练使用 office、PPT 办公软件；"),
      skillItem("s2", "证书技能：英语四级证书；计算机二级证书；"),
    ]),
    createSkillsSection("slantedGrayJava", "自我评价", [
      skillItem("e1", "3 年 Java 使用经验；熟练使用 java 等编程语言，熟悉前后端主流开发技术；"),
      skillItem("e2", "熟练使用 mysql、oracle、sqlserver 等数据库软件的一种或多种；"),
      skillItem("e3", "具有高度的责任心，具有较强的适应能力和自学能力，良好的沟通能力；具有一定的项目管理经验，有团队意识。"),
    ]),
  ];
}

function buildTemplate38Sections(): ResumeSection[] {
  return [
    createPersonalSection("stripedClassicJava", {
      name: "稻小亮",
      targetRole: "Java 开发",
      expectedSalary: "15K/月",
      education: "本科",
      status: "随时",
      age: "25 岁",
      yearsOfExperience: "3年",
      phone: "13800000001",
      email: "kingsoft@docer.cn",
      avatar: FEMALE_AVATAR,
    }),
    createEducationSection("stripedClassicJava", "教育背景", [
      educationItem("edu-1", "成都某某大学", "专业：软件工程", "20xx.09", "20xx.06", "主修课程：程序设计基础、计算机系统基础、软件工程导论、软件需求分析、软件设计与体系结构、数据结构与算法、软件项目管理、数据库原理、分布式数据库、数据结构、人工智能。"),
    ]),
    createExperienceSection("stripedClassicJava", "工作经历", [
      experienceItem("exp-1", "成都某某有限公司", "岗位：Java 开发", "20xx.07", "20xx.06", "1、负责物流系统软件的后台业务逻辑的功能设计、开发和实现；\n2、负责制定开发计划，开发核心业务模块，并解决复杂的技术问题；\n3、参与需求分析及设计评审、文档编写，根据公司产品及项目需求要求，开发新系统及迭代升级。"),
      experienceItem("exp-2", "成都某某有限公司", "岗位：Java 实习生", "20xx.06", "20xx.06", "1、负责公司 Web 产品、移动应用产品的功能设计与开发调优，撰写并整理开发、设计文档；\n2、优化升级系统，完成所承担功能模块与其他模块的集成、部署、修改、重构与调优。"),
    ]),
    createSkillsSection("stripedClassicJava", "证书奖励", [
      skillItem("s1", "证书奖励：英语四级证书、荣获 20XX 年度“杰出贡献”奖。"),
    ]),
    createSkillsSection("stripedClassicJava", "自我评价", [
      skillItem("e1", "1、Java 基础功底扎实，精通 Java EE、SOA 等相关技术，熟悉 Spring MVC、Hibernate 等主流框架。"),
      skillItem("e2", "2、熟练掌握 MySQL、MongoDB、Redis、Memcached，熟悉并能维护 Linux 操作系统，熟悉常用版本控制工具。"),
      skillItem("e3", "3、本人逻辑思维强，注重学习和自我提升，热衷前沿技术，有良好的编程习惯，工作敬业。"),
    ]),
  ];
}

function buildTemplate39Sections(): ResumeSection[] {
  return [
    createPersonalSection("blueBorderJava", {
      name: "稻小亮",
      targetRole: "Java 开发",
      yearsOfExperience: "1 年",
      birthDate: "19xx01",
      education: "本科",
      ethnicity: "汉族",
      location: "湖北武汉",
      phone: "13800000001",
      email: "kingsoft@docer.cn",
      avatar: MALE_AVATAR,
    }),
    createEducationSection("blueBorderJava", "教育背景", [
      educationItem("edu-1", "毕业院校：武汉XX大学", "专业：软件工程", "20xx.09", "20xx.06", "主修课程：高级语言程序设计，面向对象程序设计，数据库系统原理，软件工程、软件系统分析与设计，大数据技术、云计算与虚拟化、人工智能等。"),
    ]),
    createExperienceSection("blueBorderJava", "工作经历", [
      experienceItem("exp-1", "武汉XX科技有限公司", "岗位：Java工程师", "20xx.10", "20xx.08", "1、负责公司 SaaS 软件系统的日常开发工作，解决开发中的技术问题，以及开发框架的搭建、改进；\n2、参与现有系统的接口维护、功能优化、保障系统稳定；\n3、负责接口文档的撰写，完成所负责开发模块的单元测试工作。"),
      experienceItem("exp-2", "武汉XX科技有限公司", "岗位：Java开发", "20xx.07", "20xx.09", "1、负责公司智能出行服务的软件平台产品的后台设计和开发；\n2、负责项目需求文档和设计文档的编写，配合团队完成系统联调、对接、测试及部署等工作。"),
    ]),
    createSkillsSection("blueBorderJava", "证书技能", [
      skillItem("s1", "证书荣誉：英语四级证书、获20xx年“优秀团队”奖，获20xx年大学一等奖学金。"),
      skillItem("s2", "个人技能：精通 Java 编程，熟练掌握 Spring、Hibernate、springBoot、Mybatis、SpringMVC 等开源框架，熟悉 JSP、Servlet、JDBC、XML 等 WEB 开发技术，熟悉 Oracle、MySQL 数据库开发。"),
    ]),
    createSkillsSection("blueBorderJava", "自我评价", [
      skillItem("e1", "本人 Java 基础知识扎实，有良好的数据结构和算法基础，善于学习前沿技术，性格幽默，待人友好，工作敬业，考虑细致。"),
      skillItem("e2", "有全局观，责任感强，尽心尽力，能够快速的熟悉业务并上手产出，具有良好的分析能力、自学能力、良好的沟通协调能力以及团队精神。"),
    ]),
  ];
}

function buildTemplate40Sections(): ResumeSection[] {
  return [
    createPersonalSection("seniorOpsMinimal", {
      name: "小李",
      targetRole: "高级运维工程师",
      gender: "男",
      birthDate: "1993.12",
      wechat: "qiufengblue",
      website: "https://qiufeng.blue",
      github: "https://github.com/hua1995116",
    }),
    createExperienceSection("seniorOpsMinimal", "工作经历", [
      experienceItem("exp-1", "XXX有限公司", "高级分布式数据库运维工程师", "2019年 04 月", "至今", "负责搭建运维oracle,mysql数据库，监控，zabbix 数据库健康状态，半用shell自动化脚本通过 oracle 的man,exp,expdpi 进行物理与逻辑备份并上传到备份服务器；\n负责维护CRM系统、办公网络环境、电话交换机系统、oracle和mysql数据库运维，确保公司服务器与2000左右客户机包括虚拟机系统的正常运行；\n负责数据库运维工作，实现传输安全无误，确保安全可靠性，定期记录运行状况；\n负责部分数据库的信息安全，根据项目规定撰写、修订数据库的相关文档；\n负责为开发团队提供数据库相关的技术支持服务，包括SQL编写和优化。"),
      experienceItem("exp-2", "XXX有限公司", "高级分布式数据库运维工程师", "2017年6月", "2019年4月", "负责日常提取数据并输出为excel,回复邮件，根据开发给的sql文件导入数据库中；\n负责分析和展示运营商省份公司每天的运营数据，向运营商相关部门人员提供运营监控、决策分析的数据源；\n负责维护oracle数据库的正常运行，写SQL脚本，增删改查数据库，及时解决各种钉钉的申请问题；\n为客户采集数据并作分析，根据要求负责数据库以及业务监控，及时处理故障；\n负责数据库的日常管理和维护，监控和调优性能，根据运行情况提供优化建议。"),
    ]),
    createProjectsSection("seniorOpsMinimal", "项目经历", "ops-project", [
      projectItem("proj-1", "住房公积金驻场项目", "项目主要负责人", "2019年3月", "2019年6月", "负责数据库11g环境搭建，协助同事进行压力测试；\n负责备份、恢复、补丁升级以及扫描漏洞等工作；\n负责项目后期维护和管理工作，协助业务测试。"),
    ]),
    createEducationSection("seniorOpsMinimal", "教育经历", [
      educationItem("edu-1", "北京邮电大学", "计算机科学与技术", "2013.09", "2017.07", ""),
    ]),
    createSkillsSection("seniorOpsMinimal", "技能", [
      skillItem("s1", "熟练掌握ORACLE数据库的安装；"),
      skillItem("s2", "了解ORACLE数据库闪回和还原、数据库实例恢复的基本原理，熟练使用数据泵和RMAN等工具；"),
      skillItem("s3", "具备在Linux、UNIX环境下进行ORACLE数据库规划、安装、升级、迁移能力；"),
      skillItem("s4", "了解PL/SQL编程，具备编写简单的ORACLE存储过程、触发器和函数；"),
    ]),
  ];
}

function buildTemplate41Sections(): ResumeSection[] {
  return [
    createPersonalSection("darkHeaderFrontend", {
      name: "李明",
      targetRole: "前端工程师",
      gender: "男",
      birthDate: "xxxx.xx",
      location: "杭州",
      graduateSchool: "某某大学",
      education: "本科",
      politicalStatus: "群众",
      website: "https://qiufeng.blue",
      github: "https://github.com/hua1995116",
      email: "qiufenghyf@163.com",
      wechat: "qiufengblue",
    }),
    createSkillsSection("darkHeaderFrontend", "个人简介", [
      skillItem("i1", "5年前端开发经验，热爱技术，Geek精神，对前端工程化、性能优化有深入理解。"),
      skillItem("i2", "具备从0到1搭建前端基础设施的能力，擅长前端架构设计、工具链开发及性能优化。"),
      skillItem("i3", "拥有多个大型前端项目的架构经验，主导过千万级PV的Web应用架构设计与性能优化。"),
    ]),
    createExperienceSection("darkHeaderFrontend", "工作经历", [
      experienceItem(
        "exp-1",
        "杭州xx网络有限公司",
        "工程化 / 基建搭建 / 前端架构组",
        "2018.3",
        "2018.7",
        `主导公司前端工程化工具链（CLI工具、脚手架）建设，服务项目 pv:3000w
开发 web 端 js-sdk 用于前端监控与性能数据采集，压缩后仅 2kb
基于 Node 搭建前端异常监控平台，实现错误实时告警
负责公司核心业务前端架构设计与重构，提升代码可维护性
搭建基于 ECharts 的数据可视化平台，支撑业务决策
负责内部组件库（React）建设，服务项目 pv:1000w
开发 web 端 js-sdk 用于跨项目组件共享，推动前端标准化建设
基于 Node + Elasticsearch 构建日志检索与分析平台
利用 Elasticsearch 与 Node 搭建数据查询中间层，提升后端接口响应速度
使用 Redis 实现前端页面缓存策略，优化页面加载性能
主导前端发布平台（Node服务）的架构设计与开发
基于 Puppeteer 实现自动化截图与页面巡检服务
基于 cluster 模块实现 Node 服务多进程架构，利用 8 核机器提升 QPS 约 7 倍，支撑日均 300 万请求
负责团队代码规范制定与 Code Review，推动前端代码质量提升
开发 webpack 插件 (webpack-plugin-inner-script) 用于构建优化
主导前端性能优化专项，首屏加载时间下降 40%
推动前端监控体系建设，覆盖错误监控、性能监控、业务监控
基于 TypeScript+ES6/7+React 进行日常业务开发
持续集成与部署流程优化，将前端发布效率提升 50%`
      ),
    ]),
  ];
}

function buildTemplate42Sections(): ResumeSection[] {
  return [
    createPersonalSection("placeholderCampusResume", {
      name: "姓名",
      phone: "178-xxx-2228",
      email: "qiufenghyf@163.com",
      website: "xxx",
      avatar: FEMALE_AVATAR,
    }),
    createEducationSection("placeholderCampusResume", "教育背景", [
      educationItem(
        "edu-1",
        "某某大学",
        "学士/本科 · 某某专业",
        "2014",
        "2018",
        `GPA: xx/4.0（xx%，按需填写GPA）
排    名：xx
主修课程：列举与岗位相关的课程名称及分数，也可标注分数较高的课程如：高等数学 85/100、统计学 95/100`,
        "某某市"
      ),
    ]),
    createExperienceSection("placeholderCampusResume", "实习经历", [
      experienceItem(
        "exp-1",
        "实习公司1",
        "岗位名称，地点",
        "xxxx.xx",
        "xxxx.xx",
        `在此填写工作内容描述，使用动词开头，量化成果
如：主导 xx 活动，覆盖 10+ 所高校，参与人数超过 2000 人，活动满意度达 xx%
又如：协助 xxx 部门完成 xx 项目，通过 xx 方法将 xx 指标提升 xx%`
      ),
      experienceItem(
        "exp-2",
        "实习公司2",
        "岗位名称，地点",
        "xxxx.xx",
        "xxxx.xx",
        `在此填写工作内容描述，使用动词开头，量化成果
如：负责 xx 产品的运营推广，通过 xx 渠道获取新用户
又如：使用 xx 工具完成 xx 数据分析，输出 xx 份报告，推动 xx 决策落地`
      ),
    ]),
    createProjectsSection("placeholderCampusResume", "项目经历", "campus-project-placeholder", [
      projectItem(
        "proj-1",
        "项目名称",
        "项目角色",
        "xxxx.xx",
        "xxxx.xx",
        `简要描述项目背景、目标及你在其中的贡献
如：参与 xx 课题研究，负责 xx 模块的数据收集与分析
又如：独立开发 xx 应用，实现 xx 功能，获得 xx 奖项`
      ),
    ]),
    createProjectsSection("placeholderCampusResume", "校园活动", "campus-activity-placeholder", [
      projectItem(
        "proj-2",
        "活动名称",
        "担任角色",
        "xxxx.xx",
        "xxxx.xx",
        `描述你参与或组织的校园活动
如：策划并执行 xx 活动，协调 xx 部门资源，活动覆盖 xx 人
又如：担任 xx 社团 xx 职位，负责 xx 工作，主导完成 xx 项目`
      ),
      projectItem(
        "proj-3",
        "组织/社团名称",
        "担任角色",
        "xxxx.xx",
        "xxxx.xx",
        `描述你在社团或组织中的经历
如：担任 xx 社团 xx 职位，负责 xx 工作，主导完成 xx 项目
又如：组织 xx 公益活动，联合 xx 个高校，募集善款 xx 元`
      ),
    ]),
    createSkillsSection("placeholderCampusResume", "技能/证书", [
      skillItem("s1", "语言能力：英语 xx/120（四级）/ xx/9（雅思），CET-4/6 xx/710（分数），普通话 xx 级"),
      skillItem("s2", "软件技能：熟练使用 Office 系列办公软件，掌握 xx/Excel/Python 等数据分析工具"),
      skillItem("s3", "专业证书：如 CPA/CFA/教师资格证/计算机二级/其他行业证书"),
      skillItem("s4", "兴趣爱好：列出 1-2 个与岗位相关的兴趣爱好，也可以列出 3 个能体现个人特质的爱好，如：篮球（校队主力，随队获得 10 余次奖项）"),
    ]),
  ];
}

function buildTemplate43Sections(): ResumeSection[] {
  return [
    createPersonalSection("algorithmEngineerResearch", {
      name: "小及",
      targetRole: "算法工程师",
      location: "浙江",
      gender: "男",
      birthDate: "2000.09",
      graduateSchool: "北京大学",
      education: "2020级硕士在读",
      website: "https://qiufeng.blue",
      wechat: "qiufengblue",
    }),
    createSkillsSection("algorithmEngineerResearch", "IT技能", [
      skillItem("skill-1", "熟练掌握 C/C++、Python、TensorFlow、Office、xxx。"),
      skillItem("skill-2", "熟悉 Linux、MATLAB、Caffe、xxx。"),
      skillItem("skill-3", "熟悉深度学习模型训练、视觉任务评估、实验记录与模型迭代流程。"),
    ]),
    createEducationSection("algorithmEngineerResearch", "教育背景", [
      educationItem(
        "edu-1",
        "研究生学校",
        "xx专业硕士（平均成绩：95.00/100.00）",
        "2020.09",
        "至今",
        ""
      ),
      educationItem(
        "edu-2",
        "本科学校",
        "xx专业学士（平均成绩：92.00/100.00）",
        "2016.09",
        "2020.07",
        ""
      ),
    ]),
    createExperienceSection("algorithmEngineerResearch", "工作", [
      experienceItem(
        "exp-1",
        "木及网络有限公司",
        "图像研究组",
        "2021.7",
        "2021.9",
        `xxx项目，优化速度达到 xxx FPS，准确度得到 xx.xx%，相对提高 xx.xx%。
  - 图像采集，利用 xxx 设备完成数据采集与清洗。
  - 数据增广，利用 xxx 方法扩充数据集并提升泛化效果。
  - 深度估计/目标检测/图像分割，采用 xxx 算法并改进 xxx 模块。
xxx项目，负责模型训练、指标评估与实验记录。
  - xxxxxxxxxxxxx
  - xxxxxxxxxxxxx
  - xxxxxxxxxxxxx
  - xxxxxxxxxxxxx`
      ),
    ]),
    createProjectsSection("algorithmEngineerResearch", "项目", "algorithm-project", [
      projectItem(
        "proj-1",
        "图形智能识别（毕业设计）",
        "`OpenCV` `OPENGL` `TensorFlow`",
        "",
        "",
        `负责算法训练搭建与优化，获得优秀「毕业论文」称号。
经历过3次重构，xxxx，性能提高50%。
修改 xxx，提高准确率 xxx。`,
        "https://github.com/hua1995116/webchat"
      ),
    ]),
    createSkillsSection("algorithmEngineerResearch", "竞赛/获奖/论文情况", [
      skillItem("award-1", "xxx智能大赛一等奖。"),
      skillItem("award-2", "xxx阿里云大赛二等奖。"),
      skillItem("award-3", "国际数据建模xxx一等奖。"),
    ]),
  ];
}

function buildTemplate44Sections(): ResumeSection[] {
  return [
    createPersonalSection("javaBackendEngineer", {
      name: "小木",
      targetRole: "后端工程师 - Java",
      gender: "男",
      birthDate: "1995.12",
      wechat: "qiufengblue",
      website: "https://qiufeng.blue",
      github: "https://github.com/hua1995116",
    }),
    createEducationSection("javaBackendEngineer", "教育背景", [
      educationItem(
        "edu-1",
        "北京邮电大学",
        "计算机科学与技术",
        "2019.09",
        "2022.07",
        `成绩优异，GPA 3.8/4.0。获得 x、xxxx 竞赛奖项 xx 项，包含 xxxxxxx 多媒体竞赛一等奖 1 项。
主持参与省、国家级项目 xx 项；发表论文 xxx 篇，其中 x 篇 EI 索引。`
      ),
      educationItem(
        "edu-2",
        "新乡学院",
        "计算机科学与技术",
        "2015.09",
        "2019.07",
        `成绩优异，GPA 3.9/4.0。获得两次国家奖学金，多次被评为“三好学生”。`
      ),
    ]),
    createExperienceSection("javaBackendEngineer", "实习经验", [
      experienceItem(
        "exp-1",
        "木及科技有限公司 - 技术工程平台群",
        "Java开发实习工程师",
        "2021.06",
        "2021.12",
        `负责木及 xx 业务相关服务的开发、重构及维护，负责线上产品端服务的同步。
日常 xxx 业务的分析和方案的设计。
负责木及内部 SSO 单点登录系统后端的架构与开发。`
      ),
    ]),
    createProjectsSection("javaBackendEngineer", "项目", "java-project", [
      projectItem(
        "proj-1",
        "电商购物系统",
        "`SSM` `MySQL` `Redis` `Nginx` `Mycat`",
        "",
        "",
        `**项目描述**：
是一个完整的电商购物系统。主要功能是 xxxx，在其中负责服务器架构、后端开发。
**工作内容**：
  - 查询商品详情页采用 Redis 缓存，提高大量并发访问，网页响应速度提高 50%。
  - 通过 Redis 提升用户请求秒杀商品列表的速度，将 QPS 从 180 提升到 1200。
  - 基于 Maven 开发，并利用继承特性管理共有 jar 包依赖，利用聚合特性拆分后台管理系统，实现分层工程开发。
  - 采用 RabbitMQ 解决不同系统之间的通信问题，并解决应用 HttpClient 带来的系统紧耦合问题。
  - 采用 Nginx 做反向代理，并搭建 Tomcat 服务器集群，解决前台网页高并发问题。`
      ),
    ]),
    createSkillsSection("javaBackendEngineer", "技能", [
      skillItem("skill-1", "**Java基础**：熟悉 Java 基础知识，熟悉多线程并发，熟悉 JVM 原理。"),
      skillItem("skill-2", "**数据库**：熟练使用 MySQL、Redis 及常见的优化手段。"),
      skillItem("skill-3", "**框架**：熟悉 Spring Boot、MyBatis 等主流开发框架，熟悉消息队列 Kafka、Zookeeper 的使用和原理。"),
      skillItem("skill-4", "**分布式**：了解分布式系统的设计与应用，了解常见的 CAP、Paxos 算法。"),
      skillItem("skill-5", "**工具**：熟悉 Git、Maven 等项目管理及构建工具。"),
    ]),
  ];
}

const templateSectionBuilders: Record<WordTemplateKey, () => ResumeSection[]> = {
  bilingualResearchBlue: buildTemplate1Sections,
  overseasBusinessAnalyst: buildTemplate2Sections,
  productManagerBlue: buildTemplate3Sections,
  hrRecruitmentTable: buildTemplate4Sections,
  campusOperationsDense: buildTemplate5Sections,
  personalResumeGold: buildTemplate6Sections,
  slateMarketingCampus: buildTemplate7Sections,
  roundedJobResume: buildTemplate8Sections,
  personalResumeBlue: buildTemplate9Sections,
  grayIconCampus: buildTemplate10Sections,
  cleanBusinessFormal: buildTemplate11Sections,
  iconTargetNavy: buildTemplate12Sections,
  timelineMarketingBlue: buildTemplate13Sections,
  simpleStarCampus: buildTemplate14Sections,
  mintDesignerClean: buildTemplate15Sections,
  darkSidebarManager: buildTemplate16Sections,
  blueSidebarSales: buildTemplate17Sections,
  grayMarketingBars: buildTemplate18Sections,
  tealTimelineDesigner: buildTemplate19Sections,
  tealTeacherFlow: buildTemplate20Sections,
  darkDualColumnIntern: buildTemplate21Sections,
  floralMarketingSoft: buildTemplate22Sections,
  sageTeacherSidebar: buildTemplate23Sections,
  cyanHeaderDesigner: buildTemplate24Sections,
  blueCampusAwards: buildTemplate25Sections,
  darkTopSales: buildTemplate26Sections,
  grayFinanceLight: buildTemplate27Sections,
  blueNurseResume: buildTemplate28Sections,
  minimalFrontendPlain: buildTemplate29Sections,
  minimalOpsAvatar: buildTemplate30Sections,
  campusJavaResume: buildTemplate31Sections,
  blueBlocksJavaResume: buildTemplate32Sections,
  beigeSidebarGuide: buildTemplate33Sections,
  purpleGuideResume: buildTemplate34Sections,
  greenDataRiskResume: buildTemplate35Sections,
  javaBilingualIcons: buildTemplate36Sections,
  slantedGrayJava: buildTemplate37Sections,
  stripedClassicJava: buildTemplate38Sections,
  blueBorderJava: buildTemplate39Sections,
  seniorOpsMinimal: buildTemplate40Sections,
  darkHeaderFrontend: buildTemplate41Sections,
  placeholderCampusResume: buildTemplate42Sections,
  algorithmEngineerResearch: buildTemplate43Sections,
  javaBackendEngineer: buildTemplate44Sections,
};

export function isWordTemplateKey(value: string): value is WordTemplateKey {
  return value in wordTemplateMetas;
}

export function getWordTemplateSections(template: WordTemplateKey): ResumeSection[] {
  return templateSectionBuilders[template]();
}

export function renderWordTemplateMarkdown(
  template: WordTemplateKey,
  sections: ResumeSection[],
  settings?: WordRenderSettings
) {
  currentWordRenderSettings = settings ?? {};
  const personal = getPersonalSection(sections);
  if (!personal) {
    return "";
  }
  currentWordPersonalExtraFields = getVisiblePersonalExtraFields(personal);
  const renderableSections = withPersonalSummarySection(sections, personal);

  const contactLines = [
    personal.phone ? `电话：${personal.phone}` : "",
    personal.email ? `邮箱：${personal.email}` : "",
    personal.wechat ? `微信：${personal.wechat}` : "",
  ].filter(Boolean);

  const contactLine = contactLines.join(" | ");
  const content = renderableSections
    .filter((section) => section.isVisible && section.type !== "personal")
    .map((section) => renderTemplateSection(template, section) || renderWordFallbackSection(section))
    .join("");

  switch (template) {
    case "javaBackendEngineer":
      return renderJavaBackendEngineer(renderableSections, personal);
    case "algorithmEngineerResearch":
      return renderAlgorithmEngineerResearch(renderableSections, personal);
    case "bilingualResearchBlue":
      return plainResumeShell(`
        ${photoHeader({
          name: personal.name || "林知夏",
          contactLines,
          personalInfo: personal,
          avatarUrl: getAvatar(personal, FEMALE_AVATAR),
          avatarSide: "left",
          topGap: 18,
          photoSize: { width: 96, height: 112 },
        })}
        ${content}
      `);
    case "overseasBusinessAnalyst":
      return plainResumeShell(cornerFrame(`
        ${centeredHeader({
          name: personal.name || "陈思远",
          contactLine,
          personalInfo: personal,
          avatarUrl: getAvatar(personal, FEMALE_AVATAR),
          photoSize: { width: 105, height: 120 },
        })}
        ${content}
      `));
    case "productManagerBlue":
      return plainResumeShell(`
        ${photoHeader({
          name: personal.name || "张明远",
          subtitle: personal.targetRole ? `求职意向：${personal.targetRole}` : undefined,
          contactLines: [contactLine],
          personalInfo: personal,
          avatarUrl: getAvatar(personal, MALE_AVATAR),
          avatarSide: "right",
          photoSize: { width: 96, height: 108 },
        })}
        ${content}
      `);
    case "hrRecruitmentTable":
      return plainResumeShell(cornerFrame(`
        ${centeredHeader({
          name: personal.name || "赵思涵",
          contactLine,
          personalInfo: personal,
          avatarUrl: getAvatar(personal, FEMALE_AVATAR),
          photoSize: { width: 98, height: 116 },
        })}
        ${content}
      `));
    case "campusOperationsDense":
      return plainResumeShell(cornerFrame(`
        ${centeredHeader({
          name: personal.name || "黄浩然",
          contactLine,
          personalInfo: personal,
          avatarUrl: getAvatar(personal, FEMALE_AVATAR),
          photoSize: { width: 96, height: 110 },
        })}
        ${content}
      `));
    case "personalResumeGold":
      return plainResumeShell(`
        ${topBannerHeader({
          titleColor: "#5d7f90",
          accentLeft: "#5d7f90",
          accentRight: "#c6a15d",
          title: "个人简历",
          englishTitle: "Personal resume",
          subtitle: "细心从每一个小细节开始。",
          icons: ["🎓", "💼", "📱"],
          iconsBg: "#c6a15d",
        })}
        ${infoPairsBlock(
          [
            ["姓 名：", personal.name || ""],
            ["民 族：", personal.ethnicity || ""],
            ["电 话：", personal.phone || ""],
            ["邮 箱：", personal.email || ""],
            ["住 址：", personal.location || ""],
          ],
          [
            ["出生年月：", personal.birthDate || ""],
            ["身 高：", personal.height || ""],
            ["政治面貌：", personal.politicalStatus || ""],
            ["毕业院校：", personal.graduateSchool || ""],
            ["学 历：", personal.education || ""],
          ],
          getAvatar(personal, FEMALE_AVATAR),
          { lineColor: "#8da9c6" }
        )}
        ${content}
      `);
    case "slateMarketingCampus":
      return plainResumeShell(`
        ${topStrip("#5f718d")}
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:24px;margin-bottom:14px;">
          <div style="flex:1;">
            <div style="font-size:42px;font-weight:700;color:#5f718d;line-height:1;">${escapeHtml(
              personal.name || "胡小豆"
            )}</div>
            <div style="margin-top:10px;font-size:15px;color:#111827;border-bottom:2px solid #7f8da5;padding-bottom:5px;">求职意向：${escapeHtml(
              personal.targetRole || ""
            )}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;column-gap:18px;row-gap:8px;margin-top:8px;font-size:12.5px;color:#111827;">
              <div>📅&nbsp;生日：${escapeHtml(personal.birthDate || "")}</div>
              <div>📍&nbsp;现居：${escapeHtml(personal.currentCity || personal.location || "")}</div>
              <div>📞&nbsp;电话：${escapeHtml(personal.phone || "")}</div>
              <div>✉️&nbsp;邮箱：${escapeHtml(personal.email || "")}</div>
            </div>
          </div>
          <img src="${getAvatar(personal, MALE_AVATAR)}" alt="resume avatar" style="width:118px;height:160px;object-fit:cover;border:1px solid #d8dee7;background:#f8fafc;" />
        </div>
        ${content}
      `);
    case "roundedJobResume":
      return plainResumeShell(`
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:14px;">
          <div style="background:#6987b0;border-radius:0 42px 42px 0;padding:28px 28px 20px 32px;min-width:430px;color:#fff;">
            <div style="display:flex;align-items:flex-start;gap:16px;">
              <div style="font-size:44px;font-weight:700;line-height:1;">求职简历</div>
              <div style="padding-left:14px;border-left:2px solid rgba(255,255,255,0.75);margin-top:4px;">
                <div style="font-size:12px;font-weight:700;">PERSONAL RESUME</div>
                <div style="font-size:12px;margin-top:10px;">我一直在努力！</div>
              </div>
            </div>
          </div>
          <div style="flex:1;"></div>
        </div>
        ${capsuleSectionHeader("基本信息", "#6d87af")}
        ${infoPairsBlock(
          [
            ["姓 名：", personal.name || ""],
            ["年 龄：", personal.age || ""],
            ["学 历：", personal.education || ""],
            ["求职意向：", personal.targetRole || ""],
          ],
          [
            ["手机：", personal.phone || ""],
            ["邮箱：", personal.email || ""],
            ["微信：", personal.wechat || ""],
            ["地址：", personal.location || ""],
          ],
          getAvatar(personal, FEMALE_AVATAR),
          { lineColor: "#d2d7df", photoWidth: 110, photoHeight: 140 }
        )}
        ${
          personal.summary
            ? renderListSection(
                capsuleSectionHeader("自我评价", "#6d87af"),
                [personal.summary],
                "text"
              )
            : ""
        }
        ${content}
      `);
    case "personalResumeBlue":
      return plainResumeShell(`
        ${topBannerHeader({
          titleColor: "#5b91db",
          accentLeft: "#5b91db",
          accentRight: "#c7c7c7",
          title: "个人简历",
          englishTitle: "Personal resume",
          subtitle: "细心从每一个小细节开始。",
          icons: ["🎓", "💼", "📱"],
          iconsBg: "#5b91db",
        })}
        ${infoPairsBlock(
          [
            ["姓 名：", personal.name || ""],
            ["民 族：", personal.ethnicity || ""],
            ["电 话：", personal.phone || ""],
            ["邮 箱：", personal.email || ""],
            ["住 址：", personal.location || ""],
          ],
          [
            ["出生年月：", personal.birthDate || ""],
            ["身 高：", personal.height || ""],
            ["政治面貌：", personal.politicalStatus || ""],
            ["毕业院校：", personal.graduateSchool || ""],
            ["学 历：", personal.education || ""],
          ],
          getAvatar(personal, FEMALE_AVATAR),
          { lineColor: "#9dc0f1" }
        )}
        ${content}
      `);
    case "grayIconCampus":
      return plainResumeShell(`
        <div style="font-size:50px;font-weight:700;color:#6e6666;line-height:1;margin-bottom:18px;">个人简历</div>
        <div style="height:20px;background:#7c7573;margin:-4px -18px 16px -18px;"></div>
        ${infoPairsBlock(
          [
            ["姓 名：", personal.name || ""],
            ["民 族：", personal.ethnicity || ""],
            ["电 话：", personal.phone || ""],
            ["邮 箱：", personal.email || ""],
            ["住 址：", personal.location || ""],
          ],
          [
            ["出生年月：", personal.birthDate || ""],
            ["身 高：", personal.height || ""],
            ["政治面貌：", personal.politicalStatus || ""],
            ["毕业院校：", personal.graduateSchool || ""],
            ["学 历：", personal.education || ""],
          ],
          getAvatar(personal, MALE_AVATAR),
          { lineColor: "#bdb7b4" }
        )}
        ${content}
      `);
    case "cleanBusinessFormal":
      return plainResumeShell(`
        ${topStrip("#3f3f42")}
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:24px;margin-bottom:18px;">
          <div style="flex:1;">
            <div style="font-size:46px;font-weight:700;color:#111827;line-height:1;">个人简历</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;column-gap:28px;row-gap:6px;margin-top:14px;font-size:12.5px;line-height:1.8;">
              <div>
                ${labelValue("姓 名：", personal.name || "")}
                ${labelValue("政治面貌：", personal.politicalStatus || "")}
                ${labelValue("电 话：", personal.phone || "")}
                ${labelValue("邮 箱：", personal.email || "")}
                ${labelValue("住 址：", personal.location || "")}
              </div>
              <div>
                ${labelValue("出生年月：", personal.birthDate || "")}
                ${labelValue("民 族：", personal.ethnicity || "")}
                ${labelValue("毕业院校：", personal.graduateSchool || "")}
                ${labelValue("学 历：", personal.education || "")}
              </div>
            </div>
          </div>
          <img src="${getAvatar(personal, MALE_AVATAR)}" alt="resume avatar" style="width:138px;height:172px;object-fit:cover;border:2px solid #111827;background:#f8fafc;" />
        </div>
        ${content}
      `);
    case "iconTargetNavy":
      return plainResumeShell(`
        ${topStrip("#314560")}
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:18px;margin-bottom:12px;">
          <div style="flex:1;">
            <div style="font-size:34px;font-weight:700;color:#14263f;">${escapeHtml(personal.name || "小豆")}</div>
            <div style="margin-top:10px;font-size:13px;font-weight:700;color:#14263f;">应聘岗位：${escapeHtml(
              personal.targetRole || ""
            )}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;column-gap:20px;row-gap:10px;margin-top:12px;font-size:13px;">
              <div>📍&nbsp;${escapeHtml(personal.location || "")}</div>
              <div>📞&nbsp;${escapeHtml(personal.phone || "")}</div>
              <div>✉️&nbsp;${escapeHtml(personal.email || "")}</div>
            </div>
          </div>
          <img src="${getAvatar(personal, FEMALE_AVATAR)}" alt="resume avatar" style="width:112px;height:144px;object-fit:cover;border:1px solid #d4dbe5;background:#f8fafc;" />
        </div>
        ${content}
      `);
    case "timelineMarketingBlue":
      return plainResumeShell(`
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:16px;">
          <div style="flex:1;">
            <div style="font-size:44px;font-weight:700;color:#12365d;line-height:1;">${escapeHtml(
              personal.name || "胡小豆"
            )}</div>
            <div style="margin-top:10px;font-size:13px;color:#12365d;">求职意向：${escapeHtml(
              personal.targetRole || ""
            )}</div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);column-gap:18px;row-gap:8px;margin-top:12px;font-size:12.5px;line-height:1.7;">
              <div>年龄：${escapeHtml(personal.age || "")}</div>
              <div>地址：${escapeHtml(personal.location || "")}</div>
              <div>电话：${escapeHtml(personal.phone || "")}</div>
              <div>邮箱：${escapeHtml(personal.email || "")}</div>
            </div>
          </div>
          <img src="${getAvatar(personal, FEMALE_AVATAR)}" alt="resume avatar" style="width:116px;height:148px;object-fit:cover;border:3px solid #385b84;background:#f8fafc;" />
        </div>
        ${content}
      `);
    case "simpleStarCampus":
      return plainResumeShell(`
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:14px;">
          <div style="flex:1;">
            <div style="font-size:46px;font-weight:700;color:#111827;line-height:1;">${escapeHtml(
              personal.name || "胡小豆"
            )}</div>
            <div style="margin-top:10px;font-size:14px;color:#111827;">求职意向：${escapeHtml(
              personal.targetRole || ""
            )}</div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);column-gap:18px;row-gap:8px;margin-top:12px;font-size:12.5px;line-height:1.7;">
              <div>生日：${escapeHtml(personal.birthDate || "")}</div>
              <div>性别：${escapeHtml(personal.gender || "")}</div>
              <div>邮箱：${escapeHtml(personal.email || "")}</div>
              <div>民族：${escapeHtml(personal.ethnicity || "")}</div>
              <div>电话：${escapeHtml(personal.phone || "")}</div>
              <div>地址：${escapeHtml(personal.location || "")}</div>
            </div>
          </div>
          <img src="${getAvatar(personal, MALE_AVATAR)}" alt="resume avatar" style="width:124px;height:158px;object-fit:cover;border:1px solid #d5dbe3;background:#f8fafc;" />
        </div>
        ${content}
      `);
    case "mintDesignerClean":
      return renderMintDesignerClean(renderableSections, personal);
    case "darkSidebarManager":
      return renderDarkSidebarManager(renderableSections, personal);
    case "blueSidebarSales":
      return renderBlueSidebarSales(renderableSections, personal);
    case "grayMarketingBars":
      return renderGrayMarketingBars(renderableSections, personal);
    case "tealTimelineDesigner":
      return renderTealTimelineDesigner(renderableSections, personal);
    case "tealTeacherFlow":
      return renderTealTeacherFlow(renderableSections, personal);
    case "darkDualColumnIntern":
      return renderDarkDualColumnIntern(renderableSections, personal);
    case "floralMarketingSoft":
      return renderFloralMarketingSoft(renderableSections, personal);
    case "sageTeacherSidebar":
      return renderSageTeacherSidebar(renderableSections, personal);
    case "cyanHeaderDesigner":
      return renderCyanHeaderDesigner(renderableSections, personal);
    case "blueCampusAwards":
      return renderBlueCampusAwards(renderableSections, personal);
    case "darkTopSales":
      return renderDarkTopSales(renderableSections, personal);
    case "grayFinanceLight":
      return renderGrayFinanceLight(renderableSections, personal);
    case "blueNurseResume":
      return renderBlueNurseResume(renderableSections, personal);
    case "minimalFrontendPlain":
      return renderMinimalFrontendPlain(renderableSections, personal);
    case "minimalOpsAvatar":
      return renderMinimalOpsAvatar(renderableSections, personal);
    case "campusJavaResume":
      return renderCampusJavaResume(renderableSections, personal);
    case "blueBlocksJavaResume":
      return renderBlueBlocksJavaResume(renderableSections, personal);
    case "beigeSidebarGuide":
      return renderBeigeSidebarGuide(renderableSections, personal);
    case "purpleGuideResume":
      return renderPurpleGuideResume(renderableSections, personal);
    case "greenDataRiskResume":
      return renderGreenDataRiskResume(renderableSections, personal);
    case "javaBilingualIcons":
      return renderJavaBilingualIcons(renderableSections, personal);
    case "slantedGrayJava":
      return renderSlantedGrayJava(renderableSections, personal);
    case "stripedClassicJava":
      return renderStripedClassicJava(renderableSections, personal);
    case "blueBorderJava":
      return renderBlueBorderJava(renderableSections, personal);
    case "seniorOpsMinimal":
      return renderSeniorOpsMinimal(renderableSections, personal);
    case "darkHeaderFrontend":
      return renderDarkHeaderFrontend(renderableSections, personal);
    case "placeholderCampusResume":
      return renderPlaceholderCampusResume(renderableSections, personal);
    default:
      return "";
  }
}

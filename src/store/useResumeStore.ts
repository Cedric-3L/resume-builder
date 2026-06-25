import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import {
  getTemplateSections,
  resumeTemplates,
  sanitizeTemplateKey,
  TemplateKey,
} from "./demoData";
import { isWordTemplateKey, renderWordTemplateMarkdown } from "./wordTemplates";
import { sanitizeThemeKey, ThemeKey } from "@/styles/themes";
import { normalizePersonalInfoForTemplate } from "@/lib/template-personal-info-config";
import {
  CustomSectionContent,
  EducationItem,
  ExperienceItem,
  GalleryItem,
  LinkItem,
  PersonalExtraField,
  PersonalInfo,
  ProjectItem,
  ResumeMeta,
  ResumeSection,
  SkillItem,
} from "@/types/resume";

export interface ResumeSettings {
  themeColor: string;
  headingColor: string;
  fontSize: number;
  lineHeight: number;
  margins: number;
  fontFamily: string;
  headerLayout: ResumeHeaderLayout;
  personalInfoDisplay: PersonalInfoDisplayMode;
  pageTopMargin: number;
  pageLeftMargin: number;
  pageRightMargin: number;
  sectionSpacing: number;
  headingTopSpacing: number;
  headingBottomSpacing: number;
}

export interface ResumeSnapshot {
  template: TemplateKey;
  theme: ThemeKey;
  settings: ResumeSettings;
  sections: ResumeSection[];
}

export type ResumeHeaderLayout = "left" | "center" | "right" | "spread";
export type PersonalInfoDisplayMode = "text" | "icon" | "plain";

export interface ResumePersistedDocument {
  name: string;
  updatedAt: string;
  snapshot: ResumeSnapshot;
}

type ResumeDraftMeta = ResumeMeta & {
  snapshot?: ResumeSnapshot;
};

interface ResumeState {
  ownerUserId: string | null;
  markdown: string;
  template: TemplateKey;
  theme: ThemeKey;
  settings: ResumeSettings;
  sections: ResumeSection[];
  resumes: ResumeDraftMeta[];
  activeResumeId: string;
  ensureOwner: (userId: string) => void;
  setActiveResume: (resumeId: string) => void;
  setMarkdown: (markdown: string) => void;
  setTheme: (theme: ThemeKey) => void;
  setTemplate: (template: TemplateKey) => void;
  updateSettings: (settings: Partial<ResumeSettings>) => void;
  loadTemplate: (template?: TemplateKey, theme?: ThemeKey, resetContent?: boolean) => void;
  importSnapshot: (snapshot: ResumeSnapshot) => void;
  applyPersistedResumeDocument: (document: ResumePersistedDocument) => void;
  renameActiveResume: (name: string) => void;
  renameResume: (resumeId: string, name: string) => void;
  deleteResume: (resumeId: string) => void;
  createResume: (template?: TemplateKey, theme?: ThemeKey) => void;
  addSection: (type: ResumeSection["type"]) => void;
  removeSection: (id: string) => void;
  updateSection: (id: string, content: ResumeSection["content"]) => void;
  updateSectionTitle: (id: string, title: string) => void;
  reorderSections: (sections: ResumeSection[]) => void;
  syncServerResumes: (serverResumes: ResumeDraftMeta[]) => void;
  generateMarkdown: () => void;
}

const defaultSettings: ResumeSettings = {
  themeColor: "#2563eb",
  headingColor: "#2563eb",
  fontSize: 14,
  lineHeight: 1.65,
  margins: 18,
  fontFamily:
    '"PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif',
  headerLayout: "spread",
  personalInfoDisplay: "icon",
  pageTopMargin: 16,
  pageLeftMargin: 18,
  pageRightMargin: 18,
  sectionSpacing: 24,
  headingTopSpacing: 22,
  headingBottomSpacing: 12,
};

let settingsMarkdownUpdateTimer: ReturnType<typeof setTimeout> | null = null;

function normalizeSettings(settings?: Partial<ResumeSettings> | null): ResumeSettings {
  const legacyMargins = settings?.margins ?? defaultSettings.margins;

  return {
    ...defaultSettings,
    ...settings,
    headingColor: settings?.headingColor ?? settings?.themeColor ?? defaultSettings.headingColor,
    pageTopMargin: settings?.pageTopMargin ?? legacyMargins,
    pageLeftMargin: settings?.pageLeftMargin ?? legacyMargins,
    pageRightMargin: settings?.pageRightMargin ?? legacyMargins,
  };
}

function scheduleMarkdownUpdate(
  getState: () => ResumeState,
  setState: (state: Pick<ResumeState, "markdown">) => void,
  delay = 80
) {
  if (settingsMarkdownUpdateTimer) {
    clearTimeout(settingsMarkdownUpdateTimer);
  }

  settingsMarkdownUpdateTimer = setTimeout(() => {
    const state = getState();
    setState({
      markdown: generateMarkdownFromSections(
        state.sections,
        state.template,
        state.settings
      ),
    });
    settingsMarkdownUpdateTimer = null;
  }, delay);
}

function hasLegacyWordTemplateSection(sections: ResumeSection[] | undefined) {
  return Boolean(sections?.some((section) => section.id === "word-template"));
}

function normalizeSnapshot(
  snapshot?: Partial<ResumeSnapshot> | null,
  fallback?: Partial<ResumeSnapshot>
): ResumeSnapshot {
  const template = sanitizeTemplateKey(
    (snapshot?.template ?? fallback?.template ?? "bilingualResearchBlue") as TemplateKey
  );
  const theme = sanitizeThemeKey(
    (snapshot?.theme ?? fallback?.theme ?? resumeTemplates[template].defaultTheme) as ThemeKey
  );
  const settings = normalizeSettings(snapshot?.settings ?? fallback?.settings);
  let sections =
    Array.isArray(snapshot?.sections) && snapshot.sections.length > 0
      ? snapshot.sections
      : Array.isArray(fallback?.sections) && fallback.sections.length > 0
        ? fallback.sections
        : getTemplateSections(template);

  if (isWordTemplateKey(template) && hasLegacyWordTemplateSection(sections)) {
    sections = getTemplateSections(template);
  }

  return { template, theme, settings, sections };
}

function createSnapshot(
  template: TemplateKey,
  theme: ThemeKey,
  settings: ResumeSettings,
  sections: ResumeSection[]
): ResumeSnapshot {
  return {
    template: sanitizeTemplateKey(template),
    theme: sanitizeThemeKey(theme),
    settings: normalizeSettings(settings),
    sections,
  };
}

function getDefaultResumeName(template: TemplateKey) {
  return `${resumeTemplates[template].name}简历`;
}

function isGeneratedTemplateName(name?: string | null) {
  const trimmedName = name?.trim();
  if (!trimmedName) {
    return true;
  }

  return Object.values(resumeTemplates).some(
    (template) => trimmedName === `${template.name}简历`
  );
}

function resolveResumeNameForTemplate(name: string | undefined, template: TemplateKey) {
  const trimmedName = name?.trim();
  if (!trimmedName || isGeneratedTemplateName(trimmedName)) {
    return getDefaultResumeName(template);
  }

  return trimmedName;
}

function getResumeSnapshot(
  resume: ResumeDraftMeta,
  fallbackSettings: ResumeSettings
): ResumeSnapshot {
  return normalizeSnapshot(resume.snapshot, {
    template: sanitizeTemplateKey(resume.template as TemplateKey),
    theme: sanitizeThemeKey(resume.theme as ThemeKey),
    settings: fallbackSettings,
  });
}

function updateActiveResumeSnapshot(
  state: ResumeState,
  snapshot: ResumeSnapshot,
  updatedAt = new Date().toISOString(),
  extra?: Partial<ResumeDraftMeta>
) {
  return state.resumes.map((resume) =>
    resume.id === state.activeResumeId
      ? {
          ...resume,
          ...extra,
          template: snapshot.template,
          theme: snapshot.theme,
          updatedAt,
          snapshot,
        }
      : resume
  );
}

function createResumeMeta(
  template: TemplateKey,
  theme: ThemeKey,
  name?: string,
  snapshot?: ResumeSnapshot
): ResumeDraftMeta {
  return {
    id: uuidv4(),
    name: resolveResumeNameForTemplate(name, template),
    template,
    theme,
    updatedAt: new Date().toISOString(),
    snapshot,
  };
}

function createDefaultSection(
  type: ResumeSection["type"]
): Pick<ResumeSection, "type" | "title" | "isVisible" | "content"> {
  switch (type) {
    case "personal":
      return {
        type,
        title: "个人信息",
        isVisible: true,
        content: {
          name: "",
          title: "",
          email: "",
          phone: "",
          location: "",
          website: "",
          summary: "",
          status: "",
          targetRole: "",
          targetLocation: "",
          expectedSalary: "",
          education: "",
          wechat: "",
          currentCity: "",
          github: "",
          age: "",
          yearsOfExperience: "",
          gender: "",
          height: "",
          weight: "",
          hukou: "",
          ethnicity: "",
          politicalStatus: "",
          maritalStatus: "",
          avatarAlign: true,
          showAvatar: true,
          extraFields: [],
        } satisfies PersonalInfo,
      };
    case "experience":
      return {
        type,
        title: "工作经历",
        isVisible: true,
        content: [] satisfies ExperienceItem[],
      };
    case "education":
      return {
        type,
        title: "教育经历",
        isVisible: true,
        content: [] satisfies EducationItem[],
      };
    case "skills":
      return {
        type,
        title: "核心技能",
        isVisible: true,
        content: [] satisfies SkillItem[],
      };
    case "custom-links":
      return {
        type,
        title: "链接信息",
        isVisible: true,
        content: [] satisfies LinkItem[],
      };
    case "gallery":
      return {
        type,
        title: "作品与证书",
        isVisible: true,
        content: [] satisfies GalleryItem[],
      };
    case "projects":
      return {
        type,
        title: "项目经历",
        isVisible: true,
        content: [] satisfies ProjectItem[],
      };
    case "custom":
    default:
      return {
        type: "custom",
        title: "自定义模块",
        isVisible: true,
        content: { markdown: "" } satisfies CustomSectionContent,
      };
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatRichText(value: string) {
  return escapeHtml(value).replaceAll("\n", "<br />");
}

type PersonalInfoItem = {
  label: string;
  value: string;
  icon: string;
  href?: string;
};

function getVisiblePersonalExtraFields(content: Pick<PersonalInfo, "extraFields">): PersonalExtraField[] {
  return (Array.isArray(content.extraFields) ? content.extraFields : []).filter(
    (field) => field.visible !== false && field.label.trim() && field.value.trim()
  );
}

function renderPersonalInfoItem(
  item: PersonalInfoItem,
  mode: PersonalInfoDisplayMode
) {
  const content = item.href
    ? `<a href="${escapeHtml(item.href)}" style="color:inherit;text-decoration:none;">${escapeHtml(
        item.value
      )}</a>`
    : escapeHtml(item.value);

  if (mode === "plain") {
    return `<span>${content}</span>`;
  }

  if (mode === "icon") {
    return `<span style="display:inline-flex;align-items:center;gap:6px;"><span style="color:var(--heading-color);font-weight:700;">${item.icon}</span>${content}</span>`;
  }

  return `<span><span style="color:#64748b;">${escapeHtml(item.label)}：</span>${content}</span>`;
}

function renderInfoLine(
  items: PersonalInfoItem[],
  mode: PersonalInfoDisplayMode,
  color: string,
  justifyContent: string
) {
  if (!items.length) {
    return "";
  }

  return `<div style="display:flex;flex-wrap:wrap;justify-content:${justifyContent};gap:8px 14px;color:${color};font-size:12px;line-height:1.7;">${items
    .map((item) => renderPersonalInfoItem(item, mode))
    .join("")}</div>`;
}

function formatStyledPersonalSection(content: PersonalInfo, settings: ResumeSettings): string {
  const safeName = (content.name || "未命名简历").trim();
  const safeTitle = (content.targetRole || content.title || "").trim();
  const safeSummary = content.summary?.trim() ?? "";
  const avatarUrl = content.avatar?.trim() ?? "";
  const hasAvatar = Boolean(avatarUrl) && content.showAvatar !== false;
  const headerLayout = settings.headerLayout;
  const justifyContent =
    headerLayout === "center" ? "center" : headerLayout === "right" ? "flex-end" : "flex-start";
  const textAlign = headerLayout === "center" ? "center" : headerLayout === "right" ? "right" : "left";
  const shouldSpread = hasAvatar && headerLayout === "spread";

  const contactItems: PersonalInfoItem[] = [
    content.phone?.trim()
      ? { label: "电话", value: content.phone.trim(), icon: "☎" }
      : null,
    content.email?.trim()
      ? { label: "邮箱", value: content.email.trim(), icon: "✉" }
      : null,
    (content.currentCity || content.location)?.trim()
      ? {
          label: "城市",
          value: (content.currentCity || content.location).trim(),
          icon: "⌂",
        }
      : null,
    content.website?.trim()
      ? {
          label: "主页",
          value: "个人主页",
          icon: "↗",
          href: content.website.trim(),
        }
      : null,
    content.github?.trim()
      ? {
          label: "GitHub",
          value: "GitHub",
          icon: "◎",
          href: content.github.trim(),
        }
      : null,
  ].filter(Boolean) as PersonalInfoItem[];

  if (content.links?.length) {
    contactItems.push(
      ...content.links
        .filter((link) => link.label.trim() && link.url.trim())
        .map((link) => ({
          label: link.label.trim(),
          value: link.label.trim(),
          icon: "↗",
          href: link.url.trim(),
        }))
    );
  }

  const metaItems: PersonalInfoItem[] = [
    content.status?.trim()
      ? { label: "状态", value: content.status.trim(), icon: "◈" }
      : null,
    content.education?.trim()
      ? { label: "学历", value: content.education.trim(), icon: "▣" }
      : null,
    content.targetLocation?.trim()
      ? { label: "期望地点", value: content.targetLocation.trim(), icon: "⌘" }
      : null,
    content.expectedSalary?.trim()
      ? { label: "期望薪资", value: content.expectedSalary.trim(), icon: "¥" }
      : null,
    content.wechat?.trim()
      ? { label: "微信", value: content.wechat.trim(), icon: "☻" }
      : null,
    content.age?.trim() ? { label: "年龄", value: content.age.trim(), icon: "◌" } : null,
    content.yearsOfExperience?.trim()
      ? { label: "经验", value: content.yearsOfExperience.trim(), icon: "◍" }
      : null,
    content.gender?.trim() ? { label: "性别", value: content.gender.trim(), icon: "◐" } : null,
    content.birthDate?.trim()
      ? { label: "出生年月", value: content.birthDate.trim(), icon: "•" }
      : null,
    content.graduateSchool?.trim()
      ? { label: "毕业院校", value: content.graduateSchool.trim(), icon: "•" }
      : null,
    content.height?.trim() ? { label: "身高", value: content.height.trim(), icon: "•" } : null,
    content.weight?.trim() ? { label: "体重", value: content.weight.trim(), icon: "•" } : null,
    content.hukou?.trim()
      ? { label: "籍贯/户口", value: content.hukou.trim(), icon: "•" }
      : null,
    content.ethnicity?.trim()
      ? { label: "民族", value: content.ethnicity.trim(), icon: "•" }
      : null,
    content.politicalStatus?.trim()
      ? { label: "政治面貌", value: content.politicalStatus.trim(), icon: "•" }
      : null,
    content.maritalStatus?.trim()
      ? { label: "婚姻状况", value: content.maritalStatus.trim(), icon: "•" }
      : null,
    ...getVisiblePersonalExtraFields(content).map((field) => ({
      label: field.label.trim(),
      value: field.value.trim(),
      icon: "•",
    })),
  ].filter(Boolean) as PersonalInfoItem[];

  const textBlock = [
    `<div style="min-width:0;flex:${shouldSpread ? "1" : "initial"};text-align:${textAlign};">`,
    `<h1 style="margin:0;font-size:30px;line-height:1.15;font-weight:700;color:#0f172a;">${escapeHtml(
      safeName
    )}</h1>`,
    safeTitle
      ? `<p style="margin:8px 0 0;font-size:15px;font-weight:600;color:var(--heading-color);">${escapeHtml(
          safeTitle
        )}</p>`
      : "",
    contactItems.length
      ? `<div style="margin-top:10px;">${renderInfoLine(
          contactItems,
          settings.personalInfoDisplay,
          "#475569",
          justifyContent
        )}</div>`
      : "",
    metaItems.length
      ? `<div style="margin-top:6px;">${renderInfoLine(
          metaItems,
          settings.personalInfoDisplay,
          "#64748b",
          justifyContent
        )}</div>`
      : "",
    "</div>",
  ]
    .filter(Boolean)
    .join("");

  const avatarMarkup = hasAvatar
    ? `<img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(
        `${safeName}头像`
      )}" style="width:92px;height:124px;object-fit:cover;border:1px solid #dbe5f4;box-shadow:0 12px 28px rgba(15,23,42,0.08);background:#f8fafc;flex-shrink:0;border-radius:8px;" />`
    : "";

  const headerDirection = headerLayout === "center" ? "column" : "row";
  const headerJustify =
    headerLayout === "spread"
      ? "space-between"
      : headerLayout === "center"
        ? "center"
        : headerLayout === "right"
          ? "flex-end"
          : "flex-start";
  const headerAlignItems =
    headerLayout === "center" ? "center" : headerLayout === "right" ? "flex-end" : "flex-start";
  const orderedHeaderContent =
    hasAvatar && headerLayout === "center"
      ? `${avatarMarkup}${textBlock}`
      : hasAvatar && content.avatarAlign === false
        ? `${avatarMarkup}${textBlock}`
        : `${textBlock}${avatarMarkup}`;

  const headerMarkup = `<div style="display:flex;flex-direction:${headerDirection};align-items:${headerAlignItems};justify-content:${headerJustify};gap:${
    headerLayout === "center" ? "14px" : "18px"
  };margin-bottom:${safeSummary ? "16px" : "0"};">${orderedHeaderContent}</div>`;

  const summaryMarkup = safeSummary
    ? `<p style="margin:0;color:#475569;line-height:1.75;text-align:${textAlign};">${formatRichText(
        safeSummary
      )}</p>`
    : "";

  return [headerMarkup, summaryMarkup].filter(Boolean).join("\n\n");
}

function formatExperienceSection(title: string, items: ExperienceItem[]): string {
  const body = items
    .filter((item) => item.company || item.role || item.description)
    .map((item) => {
      const period = [item.startDate, item.current ? "至今" : item.endDate]
        .filter(Boolean)
        .join(" - ");

      return [
        `### ${item.role || "职位"} · ${item.company || "公司名称"}`,
        period ? `_${period}_` : "",
        item.description?.trim() ?? "",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

  return `## ${title}\n\n${body}`.trim();
}

function formatEducationSection(title: string, items: EducationItem[]): string {
  const body = items
    .filter((item) => item.school || item.degree || item.description)
    .map((item) => {
      const period = [item.startDate, item.endDate].filter(Boolean).join(" - ");
      const meta = [item.degree, item.location, period ? `_${period}_` : ""]
        .filter(Boolean)
        .join(" | ");

      return [
        `### ${item.school || "学校名称"}`,
        meta,
        item.description?.trim() ?? "",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

  return `## ${title}\n\n${body}`.trim();
}

function formatSkillsSection(title: string, items: SkillItem[]): string {
  const body = items
    .filter((item) => item.name.trim())
    .map((item) => `- ${item.name.trim()}${item.level ? ` (${item.level})` : ""}`)
    .join("\n");

  return `## ${title}\n\n${body}`.trim();
}

function formatLinksSection(title: string, items: LinkItem[]): string {
  const body = items
    .filter((item) => item.label.trim() && item.url.trim())
    .map((item) => `- [${item.label.trim()}](${item.url.trim()})`)
    .join("\n");

  return `## ${title}\n\n${body}`.trim();
}

function formatGallerySection(title: string, items: GalleryItem[]): string {
  const body = items
    .filter((item) => item.title.trim() || item.imageUrl.trim())
    .map((item) => {
      const lines = [];

      if (item.imageUrl.trim()) {
        lines.push(`![${item.title || "作品图"}](${item.imageUrl.trim()})`);
      }

      if (item.title.trim()) {
        lines.push(`**${item.title.trim()}**`);
      }

      if (item.description?.trim()) {
        lines.push(item.description.trim());
      }

      return lines.join("\n");
    })
    .join("\n\n");

  return `## ${title}\n\n${body}`.trim();
}

function formatProjectsSection(title: string, items: ProjectItem[]): string {
  const body = items
    .filter((item) => item.name.trim() || item.description.trim() || item.link?.trim())
    .map((item) => {
      const period = [item.startDate, item.endDate].filter(Boolean).join(" - ");
      const meta = [item.role, period ? `_${period}_` : ""].filter(Boolean).join(" | ");
      const lines = [
        `### ${item.name.trim() || "项目名称"}`,
        meta,
        item.description.trim(),
        item.link?.trim() ? `[项目链接](${item.link.trim()})` : "",
      ].filter(Boolean);

      return lines.join("\n");
    })
    .join("\n\n");

  return `## ${title}\n\n${body}`.trim();
}

export function generateMarkdownFromSections(
  sections: ResumeSection[],
  template?: TemplateKey,
  settings: ResumeSettings = defaultSettings
): string {
  if (template && isWordTemplateKey(template)) {
    return renderWordTemplateMarkdown(template, sections, settings);
  }

  const renderedSections = sections
    .filter((section) => section.isVisible)
    .map((section) => {
      switch (section.type) {
        case "personal":
          return {
            content: formatStyledPersonalSection(section.content as PersonalInfo, settings),
            noDividerAfter: false,
          };
        case "experience":
          return {
            content: formatExperienceSection(section.title, section.content as ExperienceItem[]),
            noDividerAfter: false,
          };
        case "education":
          return {
            content: formatEducationSection(section.title, section.content as EducationItem[]),
            noDividerAfter: false,
          };
        case "skills":
          return { content: formatSkillsSection(section.title, section.content as SkillItem[]), noDividerAfter: false };
        case "custom-links":
          return { content: formatLinksSection(section.title, section.content as LinkItem[]), noDividerAfter: false };
        case "gallery":
          return { content: formatGallerySection(section.title, section.content as GalleryItem[]), noDividerAfter: false };
        case "projects":
          return {
            content: formatProjectsSection(section.title, section.content as ProjectItem[]),
            noDividerAfter: false,
          };
        case "custom":
        default:
          return {
            content: (
              (section.content as CustomSectionContent).noHeading
                ? (section.content as CustomSectionContent).markdown || ""
                : `## ${section.title}\n\n${(section.content as CustomSectionContent).markdown || ""}`
            ).trim(),
            noDividerAfter: Boolean((section.content as CustomSectionContent).noDividerAfter),
          };
      }
    })
    .filter((item) => item.content);

  return renderedSections
    .map((item, index) => {
      const isLast = index === renderedSections.length - 1;
      return `${item.content}${!isLast && !item.noDividerAfter ? "\n\n---\n\n" : ""}`;
    })
    .join("");
}

function createInitialState(
  template: TemplateKey = "bilingualResearchBlue",
  theme?: ThemeKey
) {
  const nextTemplate = sanitizeTemplateKey(template);
  const nextTheme = sanitizeThemeKey(theme ?? resumeTemplates[nextTemplate].defaultTheme);
  const sections = getTemplateSections(nextTemplate);

  return {
    ownerUserId: null,
    template: nextTemplate,
    theme: nextTheme,
    settings: defaultSettings,
    sections,
    markdown: generateMarkdownFromSections(sections, nextTemplate, defaultSettings),
    resumes: [],
    activeResumeId: "",
  };
}

export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      ...createInitialState(),

      ensureOwner: (userId) =>
        set((state) => {
          if (state.ownerUserId === userId) {
            return state;
          }

          if (!state.ownerUserId) {
            return { ownerUserId: userId };
          }

          return {
            ...createInitialState(),
            ownerUserId: userId,
          };
        }),

      setActiveResume: (resumeId) =>
        set((state) => {
          const nextResume = state.resumes.find((resume) => resume.id === resumeId);
          if (!nextResume) {
            return state;
          }

          const snapshot = getResumeSnapshot(nextResume, state.settings);

          return {
            activeResumeId: nextResume.id,
            template: snapshot.template,
            theme: snapshot.theme,
            settings: snapshot.settings,
            sections: snapshot.sections,
            markdown: generateMarkdownFromSections(
              snapshot.sections,
              snapshot.template,
              snapshot.settings
            ),
          };
        }),

      setMarkdown: (markdown) => set({ markdown }),

      setTheme: (theme) => set((state) => {
        const nextTheme = sanitizeThemeKey(theme);
        const snapshot = createSnapshot(
          state.template,
          nextTheme,
          state.settings,
          state.sections
        );

        return {
          theme: nextTheme,
          resumes: updateActiveResumeSnapshot(state, snapshot),
        };
      }),

      setTemplate: (template) => set((state) => {
        const nextTemplate = sanitizeTemplateKey(template);
        const snapshot = createSnapshot(
          nextTemplate,
          state.theme,
          state.settings,
          state.sections
        );

        return {
          template: nextTemplate,
          markdown: generateMarkdownFromSections(
            snapshot.sections,
            snapshot.template,
            snapshot.settings
          ),
          resumes: updateActiveResumeSnapshot(state, snapshot),
        };
      }),

      updateSettings: (newSettings) => {
        set((state) => {
          const settings = normalizeSettings({ ...state.settings, ...newSettings });
          const snapshot = createSnapshot(
            state.template,
            state.theme,
            settings,
            state.sections
          );
          return {
            settings,
            resumes: updateActiveResumeSnapshot(state, snapshot),
          };
        });

        scheduleMarkdownUpdate(get, set);
      },

      loadTemplate: (template, theme, resetContent = false) => {
        const nextTemplate = sanitizeTemplateKey(template ?? "bilingualResearchBlue");
        const nextTheme = sanitizeThemeKey(
          theme ?? resumeTemplates[nextTemplate].defaultTheme
        );

        set((state) => {
          const sections = resetContent
            ? getTemplateSections(nextTemplate)
            : state.sections;
          const activeResume = state.resumes.find(
            (resume) => resume.id === state.activeResumeId
          );
          const snapshot = createSnapshot(
            nextTemplate,
            nextTheme,
            state.settings,
            sections
          );

          return {
            template: nextTemplate,
            theme: nextTheme,
            sections,
            markdown: generateMarkdownFromSections(sections, nextTemplate, state.settings),
            resumes: updateActiveResumeSnapshot(
              state,
              snapshot,
              new Date().toISOString(),
              activeResume
                ? {
                    name: resolveResumeNameForTemplate(
                      activeResume.name,
                      nextTemplate
                    ),
                  }
                : undefined
            ),
          };
        });
      },

      importSnapshot: (snapshot) => {
        const template = sanitizeTemplateKey(snapshot.template);
        const theme = sanitizeThemeKey(snapshot.theme);
        const sections =
          snapshot.sections?.length && !(isWordTemplateKey(template) && hasLegacyWordTemplateSection(snapshot.sections))
            ? snapshot.sections
            : getTemplateSections(template);

        const settings = normalizeSettings(snapshot.settings);
        const nextSnapshot = createSnapshot(template, theme, settings, sections);

        set((state) => ({
          template,
          theme,
          settings,
          sections,
          markdown: generateMarkdownFromSections(sections, template, settings),
          resumes: updateActiveResumeSnapshot(state, nextSnapshot),
        }));
      },

      applyPersistedResumeDocument: (document) => {
        const template = sanitizeTemplateKey(document.snapshot.template);
        const theme = sanitizeThemeKey(document.snapshot.theme);
        const settings = normalizeSettings(document.snapshot.settings);
        const sections =
          document.snapshot.sections?.length &&
          !(isWordTemplateKey(template) && hasLegacyWordTemplateSection(document.snapshot.sections))
            ? document.snapshot.sections
            : getTemplateSections(template);
        const snapshot = createSnapshot(template, theme, settings, sections);

        set((state) => ({
          template,
          theme,
          settings,
          sections,
          markdown: generateMarkdownFromSections(sections, template, settings),
          resumes: updateActiveResumeSnapshot(
            state,
            snapshot,
            document.updatedAt || new Date().toISOString(),
            { name: resolveResumeNameForTemplate(document.name, template) }
          ),
        }));
      },

      renameActiveResume: (name) =>
        set((state) => ({
          resumes: state.resumes.map((resume) =>
            resume.id === state.activeResumeId
              ? {
                  ...resume,
                  name: name.trim() || resume.name,
                  updatedAt: new Date().toISOString(),
                }
              : resume
          ),
        })),

      renameResume: (resumeId, name) =>
        set((state) => ({
          resumes: state.resumes.map((resume) =>
            resume.id === resumeId
              ? {
                  ...resume,
                  name: name.trim() || resume.name,
                  updatedAt: new Date().toISOString(),
                }
              : resume
          ),
        })),

      deleteResume: (resumeId) =>
        set((state) => {
          const remainingResumes = state.resumes.filter((resume) => resume.id !== resumeId);

          if (!remainingResumes.length) {
            return {
              resumes: [],
              activeResumeId: "",
            };
          }

          if (state.activeResumeId !== resumeId) {
            return { resumes: remainingResumes };
          }

          const nextResume = remainingResumes[0];
          const snapshot = getResumeSnapshot(nextResume, state.settings);

          return {
            resumes: remainingResumes,
            activeResumeId: nextResume.id,
            template: snapshot.template,
            theme: snapshot.theme,
            settings: snapshot.settings,
            sections: snapshot.sections,
            markdown: generateMarkdownFromSections(
              snapshot.sections,
              snapshot.template,
              snapshot.settings
            ),
          };
        }),

      createResume: (template, theme) => {
        const nextTemplate = sanitizeTemplateKey(template ?? "bilingualResearchBlue");
        const nextTheme = sanitizeThemeKey(
          theme ?? resumeTemplates[nextTemplate].defaultTheme
        );
        const sections = getTemplateSections(nextTemplate);
        const settings = get().settings;
        const snapshot = createSnapshot(nextTemplate, nextTheme, settings, sections);
        const newResume = createResumeMeta(
          nextTemplate,
          nextTheme,
          undefined,
          snapshot
        );

        set((state) => ({
          template: nextTemplate,
          theme: nextTheme,
          sections,
          markdown: generateMarkdownFromSections(sections, nextTemplate, settings),
          resumes: [newResume, ...state.resumes],
          activeResumeId: newResume.id,
        }));
      },

      addSection: (type) => {
        const section = createDefaultSection(type);
        const newSection: ResumeSection = {
          id: uuidv4(),
          ...section,
        };

        set((state) => {
          const sections = [...state.sections, newSection];
          const snapshot = createSnapshot(
            state.template,
            state.theme,
            state.settings,
            sections
          );
          return {
            sections,
            resumes: updateActiveResumeSnapshot(state, snapshot),
          };
        });
        scheduleMarkdownUpdate(get, set);
      },

      removeSection: (id) => {
        set((state) => {
          const sections = state.sections.filter((section) => section.id !== id);
          const snapshot = createSnapshot(
            state.template,
            state.theme,
            state.settings,
            sections
          );
          return {
            sections,
            resumes: updateActiveResumeSnapshot(state, snapshot),
          };
        });
        scheduleMarkdownUpdate(get, set);
      },

      updateSection: (id, content) => {
        set((state) => {
          const sections = state.sections.map((section) =>
            section.id === id
              ? {
                  ...section,
                  content:
                    section.type === "personal"
                      ? normalizePersonalInfoForTemplate(
                          state.template,
                          content as PersonalInfo
                        )
                      : content,
                }
              : section
          );
          const snapshot = createSnapshot(
            state.template,
            state.theme,
            state.settings,
            sections
          );
          return {
            sections,
            resumes: updateActiveResumeSnapshot(state, snapshot),
          };
        });
        scheduleMarkdownUpdate(get, set);
      },

      updateSectionTitle: (id, title) => {
        set((state) => {
          const sections = state.sections.map((section) =>
            section.id === id ? { ...section, title } : section
          );
          const snapshot = createSnapshot(
            state.template,
            state.theme,
            state.settings,
            sections
          );
          return {
            sections,
            resumes: updateActiveResumeSnapshot(state, snapshot),
          };
        });
        scheduleMarkdownUpdate(get, set);
      },

      reorderSections: (sections) => {
        set((state) => {
          const snapshot = createSnapshot(
            state.template,
            state.theme,
            state.settings,
            sections
          );

          return {
            sections,
            resumes: updateActiveResumeSnapshot(state, snapshot),
          };
        });
        scheduleMarkdownUpdate(get, set);
      },

      syncServerResumes: (serverResumes) =>
        set((state) => {
          const localMap = new Map(state.resumes.map((r) => [r.id, r]));
          const serverMap = new Map(serverResumes.map((r) => [r.id, r]));

          const merged: ResumeDraftMeta[] = [
            ...serverResumes.map((serverResume) => {
              const localResume = localMap.get(serverResume.id);
              const localTime = localResume
                ? new Date(localResume.updatedAt).getTime()
                : 0;
              const serverTime = new Date(serverResume.updatedAt).getTime();
              const shouldKeepLocalSnapshot =
                Boolean(localResume?.snapshot) &&
                (!serverResume.snapshot || localTime > serverTime);

              if (shouldKeepLocalSnapshot && localResume?.snapshot) {
                const snapshot = normalizeSnapshot(localResume.snapshot, {
                  template: localResume.template as TemplateKey,
                  theme: localResume.theme as ThemeKey,
                  settings: state.settings,
                });
                return {
                  ...serverResume,
                  name: resolveResumeNameForTemplate(
                    localTime > serverTime
                      ? localResume.name
                      : serverResume.name,
                    snapshot.template
                  ),
                  template: snapshot.template,
                  theme: snapshot.theme,
                  updatedAt:
                    localTime > serverTime
                      ? localResume.updatedAt
                      : serverResume.updatedAt,
                  snapshot,
                };
              }

              if (serverResume.snapshot) {
                const snapshot = normalizeSnapshot(serverResume.snapshot, {
                  template: serverResume.template as TemplateKey,
                  theme: serverResume.theme as ThemeKey,
                  settings: localResume?.snapshot?.settings ?? state.settings,
                });

                return {
                  ...serverResume,
                  name: resolveResumeNameForTemplate(
                    serverResume.name,
                    snapshot.template
                  ),
                  template: snapshot.template,
                  theme: snapshot.theme,
                  snapshot,
                };
              }

              if (localResume?.snapshot) {
                const snapshot = normalizeSnapshot(localResume.snapshot, {
                  template: localResume.template as TemplateKey,
                  theme: localResume.theme as ThemeKey,
                  settings: state.settings,
                });
                return {
                  ...serverResume,
                  name: resolveResumeNameForTemplate(
                    serverResume.name,
                    snapshot.template
                  ),
                  template: snapshot.template,
                  theme: snapshot.theme,
                  snapshot,
                };
              }

              return serverResume;
            }),
            ...state.resumes.filter((r) => !serverMap.has(r.id)),
          ];

          const hasActive = merged.some((r) => r.id === state.activeResumeId);
          const nextActiveResumeId = hasActive
            ? state.activeResumeId
            : merged[0]?.id ?? "";
          const nextActiveResume = merged.find((r) => r.id === nextActiveResumeId);

          if (!nextActiveResume || nextActiveResumeId === state.activeResumeId) {
            return {
              resumes: merged,
              activeResumeId: nextActiveResumeId,
            };
          }

          const snapshot = getResumeSnapshot(nextActiveResume, state.settings);

          return {
            resumes: merged,
            activeResumeId: nextActiveResumeId,
            template: snapshot.template,
            theme: snapshot.theme,
            settings: snapshot.settings,
            sections: snapshot.sections,
            markdown: generateMarkdownFromSections(
              snapshot.sections,
              snapshot.template,
              snapshot.settings
            ),
          };
        }),

      generateMarkdown: () =>
        set((state) => ({
          markdown: generateMarkdownFromSections(state.sections, state.template, state.settings),
        })),
    }),
    {
      name: "resume-storage",
      partialize: (state) => ({
        ownerUserId: state.ownerUserId,
        template: state.template,
        theme: state.theme,
        settings: state.settings,
        sections: state.sections,
        resumes: state.resumes,
        activeResumeId: state.activeResumeId,
      }),
      merge: (persistedState, currentState) => {
        const incoming = persistedState as Partial<ResumeState>;
        const template = sanitizeTemplateKey(
          (incoming.template as TemplateKey) ?? currentState.template
        );
        const theme = sanitizeThemeKey(
          (incoming.theme as ThemeKey) ?? resumeTemplates[template].defaultTheme
        );
        let sections = Array.isArray(incoming.sections) && incoming.sections.length > 0
          ? incoming.sections
          : getTemplateSections(template);

        if (isWordTemplateKey(template) && hasLegacyWordTemplateSection(sections)) {
          sections = getTemplateSections(template);
        }

        const settings = normalizeSettings(incoming.settings);
        const rawResumes = Array.isArray(incoming.resumes)
          ? (incoming.resumes as ResumeDraftMeta[])
          : [];
        const activeResumeId =
          incoming.activeResumeId && rawResumes.some((r) => r.id === incoming.activeResumeId)
            ? incoming.activeResumeId
            : rawResumes[0]?.id ?? "";
        const activeSnapshot = createSnapshot(template, theme, settings, sections);
        const resumes = rawResumes.map((resume) => {
          if (resume.snapshot) {
            const snapshot = normalizeSnapshot(resume.snapshot, {
              template: resume.template as TemplateKey,
              theme: resume.theme as ThemeKey,
              settings,
            });

            return {
              ...resume,
              name: resolveResumeNameForTemplate(resume.name, snapshot.template),
              template: snapshot.template,
              theme: snapshot.theme,
              snapshot,
            };
          }

          if (resume.id === activeResumeId) {
            return {
              ...resume,
              name: resolveResumeNameForTemplate(resume.name, activeSnapshot.template),
              template: activeSnapshot.template,
              theme: activeSnapshot.theme,
              snapshot: activeSnapshot,
            };
          }

          return resume;
        });
        const resolvedActiveSnapshot =
          resumes.find((resume) => resume.id === activeResumeId)?.snapshot ??
          activeSnapshot;

        return {
          ...currentState,
          ownerUserId: incoming.ownerUserId ?? null,
          template: resolvedActiveSnapshot.template,
          theme: resolvedActiveSnapshot.theme,
          settings: resolvedActiveSnapshot.settings,
          sections: resolvedActiveSnapshot.sections,
          resumes,
          activeResumeId,
          markdown: generateMarkdownFromSections(
            resolvedActiveSnapshot.sections,
            resolvedActiveSnapshot.template,
            resolvedActiveSnapshot.settings
          ),
        };
      },
    }
  )
);

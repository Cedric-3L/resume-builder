import { TemplateKey } from "@/store/demoData";
import { PersonalInfo } from "@/types/resume";

export type PersonalInfoField = Exclude<keyof PersonalInfo, "extraFields">;

export type PersonalInfoFieldMeta = {
  field: PersonalInfoField;
  label: string;
  placeholder?: string;
  type?: "text" | "tel" | "email" | "url";
};

export type PersonalInfoEditorSection = {
  key: string;
  title: string;
  description?: string;
  columns: 2 | 3;
  fields: PersonalInfoField[];
};

export type TemplatePersonalInfoEditorConfig = {
  sections: PersonalInfoEditorSection[];
  extraFields: PersonalInfoField[];
  autoEnabledFields?: PersonalInfoField[];
  summaryLabel?: string;
  summaryPlaceholder?: string;
};

export const PERSONAL_INFO_FIELD_META: Record<PersonalInfoField, PersonalInfoFieldMeta> = {
  name: { field: "name", label: "姓名", placeholder: "例如：胡小豆" },
  title: { field: "title", label: "职位标题", placeholder: "例如：产品经理" },
  email: {
    field: "email",
    label: "邮箱",
    type: "email",
    placeholder: "例如：hello@example.com",
  },
  phone: {
    field: "phone",
    label: "电话",
    type: "tel",
    placeholder: "例如：138 0000 0000",
  },
  location: { field: "location", label: "地址 / 所在地", placeholder: "例如：上海市浦东新区" },
  avatar: { field: "avatar", label: "头像地址", type: "url", placeholder: "请输入头像 URL" },
  website: {
    field: "website",
    label: "个人网站",
    type: "url",
    placeholder: "例如：https://yourname.com",
  },
  summary: {
    field: "summary",
    label: "个人简介",
    placeholder: "用 2-3 句话概括你的优势、经验和求职方向。",
  },
  links: { field: "links", label: "链接", placeholder: "" },
  status: { field: "status", label: "当前状态", placeholder: "例如：在职，看看机会" },
  targetRole: { field: "targetRole", label: "求职岗位", placeholder: "例如：算法工程师" },
  targetLocation: {
    field: "targetLocation",
    label: "期望工作地",
    placeholder: "例如：上海 / 杭州",
  },
  expectedSalary: {
    field: "expectedSalary",
    label: "期望薪资",
    placeholder: "例如：20-30K",
  },
  education: { field: "education", label: "最高学历", placeholder: "例如：2020级硕士在读" },
  wechat: { field: "wechat", label: "微信号", placeholder: "例如：qifengblue" },
  currentCity: { field: "currentCity", label: "现居城市", placeholder: "例如：上海" },
  birthDate: { field: "birthDate", label: "出生年月", placeholder: "例如：2000.09" },
  github: {
    field: "github",
    label: "GitHub",
    type: "url",
    placeholder: "例如：github.com/yourname",
  },
  graduateSchool: { field: "graduateSchool", label: "毕业院校", placeholder: "例如：北京大学" },
  age: { field: "age", label: "年龄", placeholder: "例如：24岁" },
  yearsOfExperience: {
    field: "yearsOfExperience",
    label: "工作年限",
    placeholder: "例如：5年",
  },
  gender: { field: "gender", label: "性别", placeholder: "例如：女" },
  height: { field: "height", label: "身高", placeholder: "例如：167cm" },
  weight: { field: "weight", label: "体重", placeholder: "例如：50kg" },
  hukou: { field: "hukou", label: "籍贯 / 户口", placeholder: "例如：浙江杭州" },
  ethnicity: { field: "ethnicity", label: "民族", placeholder: "例如：汉族" },
  politicalStatus: {
    field: "politicalStatus",
    label: "政治面貌",
    placeholder: "例如：中共党员",
  },
  maritalStatus: { field: "maritalStatus", label: "婚姻状况", placeholder: "例如：未婚" },
  avatarAlign: { field: "avatarAlign", label: "头像右对齐", placeholder: "" },
  showAvatar: { field: "showAvatar", label: "显示证件照", placeholder: "" },
};

const COMMON_EXTRA_FIELDS: PersonalInfoField[] = [
  "wechat",
  "github",
  "location",
  "age",
  "yearsOfExperience",
  "gender",
  "birthDate",
  "height",
  "weight",
  "hukou",
  "ethnicity",
  "politicalStatus",
  "maritalStatus",
];

const DEFAULT_CONFIG: TemplatePersonalInfoEditorConfig = {
  sections: [
    {
      key: "basic",
      title: "基本信息",
      description: "姓名、电话、邮箱是大部分模板都会优先展示的信息。",
      columns: 3,
      fields: ["name", "phone", "email"],
    },
    {
      key: "job",
      title: "求职信息",
      description: "用于匹配岗位、城市和薪资诉求。",
      columns: 3,
      fields: ["status", "targetRole", "targetLocation", "expectedSalary"],
    },
    {
      key: "profile",
      title: "教育与展示",
      description: "学校、学历、城市和个人主页会进入不同模板的顶部信息区。",
      columns: 2,
      fields: ["currentCity", "education", "graduateSchool", "website"],
    },
  ],
  extraFields: COMMON_EXTRA_FIELDS,
  autoEnabledFields: ["wechat", "github"],
  summaryLabel: "个人简介",
  summaryPlaceholder:
    "例如：5 年互联网产品经验，擅长从 0 到 1 的产品搭建与增长，具备敏锐的用户洞察与结构化思考能力。",
};

const CAMPUS_CONFIG: TemplatePersonalInfoEditorConfig = {
  sections: [
    {
      key: "basic",
      title: "基本信息",
      columns: 3,
      fields: ["name", "phone", "email"],
    },
    {
      key: "job",
      title: "求职信息",
      columns: 3,
      fields: ["targetRole", "targetLocation", "expectedSalary", "status"],
    },
    {
      key: "profile",
      title: "校园信息",
      columns: 2,
      fields: ["education", "graduateSchool", "currentCity", "birthDate"],
    },
  ],
  extraFields: [
    "wechat",
    "github",
    "location",
    "age",
    "gender",
    "politicalStatus",
    "yearsOfExperience",
    "height",
    "weight",
    "hukou",
    "ethnicity",
    "maritalStatus",
    "website",
  ],
  autoEnabledFields: ["wechat", "age", "gender"],
  summaryLabel: "个人简介",
  summaryPlaceholder: "例如：应届毕业生，具备扎实的专业基础和项目经历，学习能力强，执行稳定。",
};

const CREATIVE_CONFIG: TemplatePersonalInfoEditorConfig = {
  sections: [
    {
      key: "basic",
      title: "基本信息",
      columns: 3,
      fields: ["name", "phone", "email"],
    },
    {
      key: "job",
      title: "职业信息",
      columns: 3,
      fields: ["targetRole", "currentCity", "targetLocation", "status"],
    },
    {
      key: "profile",
      title: "作品展示信息",
      columns: 2,
      fields: ["website", "github", "education", "graduateSchool"],
    },
  ],
  extraFields: [
    "wechat",
    "location",
    "expectedSalary",
    "age",
    "yearsOfExperience",
    "gender",
    "birthDate",
    "hukou",
    "ethnicity",
    "politicalStatus",
    "maritalStatus",
    "height",
    "weight",
  ],
  autoEnabledFields: ["website", "github", "wechat"],
  summaryLabel: "个人简介",
  summaryPlaceholder: "例如：擅长视觉表达、用户洞察和创意落地，重视审美与业务目标之间的平衡。",
};

const BUSINESS_CONFIG: TemplatePersonalInfoEditorConfig = {
  sections: [
    {
      key: "basic",
      title: "基本信息",
      columns: 3,
      fields: ["name", "phone", "email"],
    },
    {
      key: "job",
      title: "求职信息",
      columns: 3,
      fields: ["targetRole", "status", "currentCity", "expectedSalary"],
    },
    {
      key: "profile",
      title: "背景信息",
      columns: 2,
      fields: ["education", "graduateSchool", "yearsOfExperience", "website"],
    },
  ],
  extraFields: [
    "wechat",
    "github",
    "location",
    "targetLocation",
    "age",
    "gender",
    "birthDate",
    "height",
    "weight",
    "hukou",
    "ethnicity",
    "politicalStatus",
    "maritalStatus",
  ],
  autoEnabledFields: ["wechat", "yearsOfExperience"],
  summaryLabel: "个人简介",
  summaryPlaceholder: "例如：具备商业分析、项目推进和跨团队协作经验，能够快速理解业务并推动结果落地。",
};

const INFO_HEAVY_CONFIG: TemplatePersonalInfoEditorConfig = {
  sections: [
    {
      key: "basic",
      title: "基本信息",
      columns: 3,
      fields: ["name", "phone", "email"],
    },
    {
      key: "job",
      title: "核心信息",
      columns: 3,
      fields: ["targetRole", "currentCity", "education", "graduateSchool"],
    },
    {
      key: "profile",
      title: "补充信息",
      columns: 2,
      fields: ["age", "gender", "yearsOfExperience", "website"],
    },
  ],
  extraFields: [
    "wechat",
    "github",
    "location",
    "targetLocation",
    "expectedSalary",
    "birthDate",
    "height",
    "weight",
    "hukou",
    "ethnicity",
    "politicalStatus",
    "maritalStatus",
    "status",
  ],
  autoEnabledFields: ["wechat", "age", "gender", "yearsOfExperience"],
  summaryLabel: "个人简介",
  summaryPlaceholder: "例如：信息完整、表达清晰，适合信息密度较高的岗位与模板展示方式。",
};

const CAMPUS_TEMPLATES: TemplateKey[] = [
  "bilingualResearchBlue",
  "overseasBusinessAnalyst",
  "hrRecruitmentTable",
  "campusOperationsDense",
  "personalResumeGold",
  "slateMarketingCampus",
  "roundedJobResume",
  "personalResumeBlue",
  "grayIconCampus",
  "timelineMarketingBlue",
  "simpleStarCampus",
  "blueCampusAwards",
  "campusJavaResume",
  "placeholderCampusResume",
];

const CREATIVE_TEMPLATES: TemplateKey[] = [
  "mintDesignerClean",
  "grayMarketingBars",
  "tealTimelineDesigner",
  "tealTeacherFlow",
  "floralMarketingSoft",
  "sageTeacherSidebar",
  "cyanHeaderDesigner",
  "slantedGrayJava",
  "darkHeaderFrontend",
];

const BUSINESS_TEMPLATES: TemplateKey[] = [
  "cleanBusinessFormal",
  "darkSidebarManager",
  "grayFinanceLight",
  "greenDataRiskResume",
  "seniorOpsMinimal",
];

const INFO_HEAVY_TEMPLATES: TemplateKey[] = [
  "productManagerBlue",
  "iconTargetNavy",
  "blueSidebarSales",
  "darkDualColumnIntern",
  "darkTopSales",
  "blueNurseResume",
  "minimalOpsAvatar",
  "blueBlocksJavaResume",
  "beigeSidebarGuide",
  "purpleGuideResume",
  "javaBilingualIcons",
  "stripedClassicJava",
  "blueBorderJava",
];

export function getPersonalInfoFieldMeta(field: PersonalInfoField) {
  return PERSONAL_INFO_FIELD_META[field];
}

export function getTemplatePersonalInfoEditorConfig(
  template: TemplateKey
): TemplatePersonalInfoEditorConfig {
  if (CAMPUS_TEMPLATES.includes(template)) {
    return CAMPUS_CONFIG;
  }

  if (CREATIVE_TEMPLATES.includes(template)) {
    return CREATIVE_CONFIG;
  }

  if (BUSINESS_TEMPLATES.includes(template)) {
    return BUSINESS_CONFIG;
  }

  if (INFO_HEAVY_TEMPLATES.includes(template)) {
    return INFO_HEAVY_CONFIG;
  }

  return DEFAULT_CONFIG;
}

export function normalizePersonalInfoForTemplate(
  template: TemplateKey,
  nextData: PersonalInfo,
  changedField?: PersonalInfoField
) {
  void template;
  const normalized = { ...nextData };

  if (normalized.targetRole?.trim()) {
    normalized.title = normalized.targetRole.trim();
  }

  if (changedField === "targetLocation" && normalized.targetLocation?.trim() && !normalized.location?.trim()) {
    normalized.location = normalized.targetLocation.trim();
  }

  if (changedField === "currentCity" && normalized.currentCity?.trim() && !normalized.location?.trim()) {
    normalized.location = normalized.currentCity.trim();
  }

  if (changedField === "location" && normalized.location?.trim() && !normalized.currentCity?.trim()) {
    normalized.currentCity = normalized.location.trim();
  }

  if (changedField === "website" && normalized.website) {
    normalized.website = normalized.website.trim();
  }

  if (changedField === "github" && normalized.github) {
    normalized.github = normalized.github.trim();
  }

  return normalized;
}

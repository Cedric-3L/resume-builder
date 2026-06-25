export type SectionType =
  | "personal"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "custom"
  | "custom-links"
  | "gallery";

export interface ResumeSection {
  id: string;
  type: SectionType;
  title: string;
  isVisible: boolean;
  content:
    | PersonalInfo
    | ExperienceItem[]
    | EducationItem[]
    | SkillItem[]
    | ProjectItem[]
    | LinkItem[]
    | GalleryItem[]
    | CustomSectionContent;
}

export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  avatar?: string;
  website?: string;
  summary?: string;
  links?: { label: string; url: string }[];
  status?: string;
  targetRole?: string;
  targetLocation?: string;
  expectedSalary?: string;
  education?: string;
  wechat?: string;
  currentCity?: string;
  birthDate?: string;
  github?: string;
  graduateSchool?: string;
  age?: string;
  yearsOfExperience?: string;
  gender?: string;
  height?: string;
  weight?: string;
  hukou?: string;
  ethnicity?: string;
  politicalStatus?: string;
  maritalStatus?: string;
  avatarAlign?: boolean;
  showAvatar?: boolean;
  extraFields?: PersonalExtraField[];
}

export interface PersonalExtraField {
  id: string;
  label: string;
  value: string;
  group?: "basic" | "contact" | "additional";
  visible?: boolean;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
  location?: string;
  description: string;
}

export interface SkillItem {
  id: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

export interface ProjectItem {
  id: string;
  name: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  description: string;
  link?: string;
}

export interface LinkItem {
  id: string;
  label: string;
  url: string;
  icon?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  description?: string;
}

export interface CustomSectionContent {
  markdown: string;
  noHeading?: boolean;
  noDividerAfter?: boolean;
}

export interface ResumeMeta {
  id: string;
  name: string;
  template: string;
  theme: string;
  updatedAt: string;
}

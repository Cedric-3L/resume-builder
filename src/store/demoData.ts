import { ThemeKey } from "@/styles/themes";
import { ResumeSection } from "@/types/resume";
import {
  getWordTemplateSections,
  wordTemplateMetas,
} from "./wordTemplates";

export interface ResumeTemplateMeta {
  name: string;
  description: string;
  defaultTheme: ThemeKey;
  tags: {
    industry: string[];
    style: string;
    scenario: string[];
  };
}

export const resumeTemplates = {
  ...wordTemplateMetas,
} satisfies Record<string, ResumeTemplateMeta>;

export type TemplateKey = keyof typeof resumeTemplates;

export const templateKeys = Object.keys(wordTemplateMetas) as TemplateKey[];

export function isTemplateKey(value: string): value is TemplateKey {
  return templateKeys.includes(value as TemplateKey);
}

export function sanitizeTemplateKey(value: string | undefined | null): TemplateKey {
  if (value && isTemplateKey(value)) {
    return value;
  }

  return "bilingualResearchBlue";
}

export function getTemplateSections(template?: TemplateKey): ResumeSection[] {
  return getWordTemplateSections(sanitizeTemplateKey(template));
}

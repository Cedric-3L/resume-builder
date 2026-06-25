import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from "@react-pdf/renderer";
import type { ResumeSettings } from "@/store/useResumeStore";
import type {
  ResumeSection,
  PersonalInfo,
  ExperienceItem,
  EducationItem,
  SkillItem,
  ProjectItem,
  LinkItem,
  GalleryItem,
  CustomSectionContent,
} from "@/types/resume";

const MM_TO_PT = 2.8346;
const CJK_CHAR_PATTERN = /([㐀-䶿一-鿿豈-﫿])/g;
const INLINE_BREAK_PATTERN = /([/@._|·-])/g;

function pdfText(value: string) {
  return value
    .replace(CJK_CHAR_PATTERN, "$1​")
    .replace(INLINE_BREAK_PATTERN, "$1​");
}

interface ResumePDFDocumentProps {
  sections: ResumeSection[];
  settings: ResumeSettings;
  title?: string;
}

function PersonalSection({ content, styles }: { content: PersonalInfo; styles: ReturnType<typeof makeStyles> }) {
  const name = (content.name || "未命名简历").trim();
  const role = (content.targetRole || content.title || "").trim();
  const contactItems = [
    content.phone?.trim(),
    content.email?.trim(),
    (content.currentCity || content.location)?.trim(),
  ].filter(Boolean);

  return (
    <View style={styles.personalSection}>
      <Text style={styles.name}>{pdfText(name)}</Text>
      {role ? <Text style={styles.role}>{pdfText(role)}</Text> : null}
      {contactItems.length ? (
        <Text style={styles.contactLine}>{pdfText(contactItems.join("  |  "))}</Text>
      ) : null}
      {content.summary?.trim() ? (
        <Text style={styles.summary}>{pdfText(content.summary.trim())}</Text>
      ) : null}
    </View>
  );
}

function ExperienceSection({ title, items, styles }: { title: string; items: ExperienceItem[]; styles: ReturnType<typeof makeStyles> }) {
  const filtered = items.filter((i) => i.company || i.role || i.description);
  if (!filtered.length) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {filtered.map((item, index) => {
        const period = [item.startDate, item.current ? "至今" : item.endDate].filter(Boolean).join(" - ");
        return (
          <View key={index} style={styles.entry}>
            <View style={styles.entryHeader}>
              <Text style={styles.entryTitle}>{pdfText(`${item.role || "职位"} · ${item.company || "公司"}`)}</Text>
              {period ? <Text style={styles.entryDate}>{pdfText(period)}</Text> : null}
            </View>
            {item.description?.trim() ? (
              <Text style={styles.entryDesc}>{pdfText(item.description.trim())}</Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function EducationSection({ title, items, styles }: { title: string; items: EducationItem[]; styles: ReturnType<typeof makeStyles> }) {
  const filtered = items.filter((i) => i.school || i.degree || i.description);
  if (!filtered.length) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {filtered.map((item, index) => {
        const meta = [item.degree, item.location, [item.startDate, item.endDate].filter(Boolean).join(" - ")]
          .filter(Boolean)
          .join("  |  ");
        return (
          <View key={index} style={styles.entry}>
            <View style={styles.entryHeader}>
              <Text style={styles.entryTitle}>{pdfText(item.school || "学校名称")}</Text>
              {meta ? <Text style={styles.entryDate}>{pdfText(meta)}</Text> : null}
            </View>
            {item.description?.trim() ? (
              <Text style={styles.entryDesc}>{pdfText(item.description.trim())}</Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function SkillsSection({ title, items, styles }: { title: string; items: SkillItem[]; styles: ReturnType<typeof makeStyles> }) {
  const filtered = items.filter((i) => i.name.trim());
  if (!filtered.length) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.entryDesc}>
        {pdfText(filtered.map((s) => s.level ? `${s.name} (${s.level})` : s.name).join("  ·  "))}
      </Text>
    </View>
  );
}

function ProjectsSection({ title, items, styles }: { title: string; items: ProjectItem[]; styles: ReturnType<typeof makeStyles> }) {
  const filtered = items.filter((i) => i.name.trim() || i.description.trim());
  if (!filtered.length) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {filtered.map((item, index) => {
        const period = [item.startDate, item.endDate].filter(Boolean).join(" - ");
        const meta = [item.role, period].filter(Boolean).join(" | ");
        return (
          <View key={index} style={styles.entry}>
            <View style={styles.entryHeader}>
              <Text style={styles.entryTitle}>{pdfText(item.name.trim() || "项目名称")}</Text>
              {meta ? <Text style={styles.entryDate}>{pdfText(meta)}</Text> : null}
            </View>
            {item.description?.trim() ? (
              <Text style={styles.entryDesc}>{pdfText(item.description.trim())}</Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function LinksSection({ title, items, styles }: { title: string; items: LinkItem[]; styles: ReturnType<typeof makeStyles> }) {
  const filtered = items.filter((i) => i.label.trim() && i.url.trim());
  if (!filtered.length) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.linkList}>
        {filtered.map((item, index) => (
          <Link key={index} src={item.url.trim()} style={styles.linkItem}>
            {pdfText(item.label.trim())}
          </Link>
        ))}
      </View>
    </View>
  );
}

function GallerySection({ title, items, styles }: { title: string; items: GalleryItem[]; styles: ReturnType<typeof makeStyles> }) {
  const filtered = items.filter((i) => i.title.trim() || i.imageUrl.trim());
  if (!filtered.length) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {filtered.map((item, index) => (
        <View key={index} style={styles.entry}>
          <Text style={styles.entryTitle}>{pdfText(item.title.trim() || "作品")}</Text>
          {item.description?.trim() ? (
            <Text style={styles.entryDesc}>{pdfText(item.description.trim())}</Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function CustomSection({ title, content, styles }: { title: string; content: CustomSectionContent; styles: ReturnType<typeof makeStyles> }) {
  const markdown = content.markdown?.trim();
  if (!markdown) return null;

  const cleaned = markdown
    .replace(/[#*_~>`\[\]()!]/g, "")
    .replace(/<[^>]*>/g, "")
    .trim();
  if (!cleaned) return null;

  return (
    <View style={styles.section}>
      {!content.noHeading ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      <Text style={styles.entryDesc}>{pdfText(cleaned)}</Text>
    </View>
  );
}

const ACTIVE_COLOR = "#2563eb";

function makeStyles(settings: ResumeSettings) {
  const fontFamily = "Noto Sans SC";
  const fontSize = settings.fontSize;
  const headingColor = settings.headingColor || ACTIVE_COLOR;

  return StyleSheet.create({
    page: {
      paddingTop: settings.pageTopMargin * MM_TO_PT,
      paddingBottom: settings.pageTopMargin * MM_TO_PT,
      paddingLeft: settings.pageLeftMargin * MM_TO_PT,
      paddingRight: settings.pageRightMargin * MM_TO_PT,
      fontFamily,
      fontSize,
      lineHeight: settings.lineHeight,
      color: "#1e293b",
    },
    personalSection: {
      marginBottom: settings.sectionSpacing + 12,
    },
    name: {
      fontSize: 30,
      lineHeight: 1.12,
      fontWeight: 700,
      color: "#0f172a",
      marginBottom: 8,
    },
    role: {
      fontSize: fontSize + 1,
      lineHeight: 1.35,
      fontWeight: 600,
      color: headingColor,
      marginBottom: 10,
    },
    contactLine: {
      fontSize: fontSize - 2,
      lineHeight: 1.45,
      color: "#475569",
      marginBottom: 4,
    },
    summary: {
      fontSize,
      color: "#475569",
      lineHeight: 1.75,
      marginTop: 6,
    },
    section: {
      marginTop: settings.headingTopSpacing,
      marginBottom: settings.sectionSpacing,
    },
    sectionTitle: {
      fontSize: fontSize + 2,
      lineHeight: 1.35,
      fontWeight: 700,
      color: headingColor,
      borderBottom: `1pt solid ${headingColor}33`,
      paddingBottom: settings.headingBottomSpacing / 3,
      marginBottom: settings.headingBottomSpacing,
    },
    entry: {
      marginBottom: settings.sectionSpacing / 2,
    },
    entryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 4,
    },
    entryTitle: {
      fontSize,
      lineHeight: 1.35,
      fontWeight: 700,
      color: "#334155",
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
      paddingRight: 12,
    },
    entryDate: {
      fontSize: fontSize - 2,
      lineHeight: 1.35,
      color: "#94a3b8",
      flexShrink: 0,
      maxWidth: "45%",
    },
    entryDesc: {
      fontSize,
      color: "#475569",
      lineHeight: 1.6,
      marginTop: 2,
    },
    linkList: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    linkItem: {
      fontSize,
      color: headingColor,
      textDecoration: "none",
    },
  });
}

export function ResumePDFDocument({ sections, settings, title }: ResumePDFDocumentProps) {
  const styles = makeStyles(settings);
  const visible = sections.filter((s) => s.isVisible);

  return (
    <Document title={title || "极刻简历"} creator="极刻简历">
      <Page size="A4" style={styles.page} wrap>
        {visible.map((section) => {
          switch (section.type) {
            case "personal":
              return <PersonalSection key={section.id} content={section.content as PersonalInfo} styles={styles} />;
            case "experience":
              return <ExperienceSection key={section.id} title={section.title} items={section.content as ExperienceItem[]} styles={styles} />;
            case "education":
              return <EducationSection key={section.id} title={section.title} items={section.content as EducationItem[]} styles={styles} />;
            case "skills":
              return <SkillsSection key={section.id} title={section.title} items={section.content as SkillItem[]} styles={styles} />;
            case "projects":
              return <ProjectsSection key={section.id} title={section.title} items={section.content as ProjectItem[]} styles={styles} />;
            case "custom-links":
              return <LinksSection key={section.id} title={section.title} items={section.content as LinkItem[]} styles={styles} />;
            case "gallery":
              return <GallerySection key={section.id} title={section.title} items={section.content as GalleryItem[]} styles={styles} />;
            case "custom":
              return <CustomSection key={section.id} title={section.title} content={section.content as CustomSectionContent} styles={styles} />;
            default:
              return null;
          }
        })}
      </Page>
    </Document>
  );
}

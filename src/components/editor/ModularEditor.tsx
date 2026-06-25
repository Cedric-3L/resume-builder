import React from "react";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Image as ImageIcon,
  Link as LinkIcon,
  Plus,
  Trash2,
} from "lucide-react";
import { QUICK_ADD_TYPES, SECTION_LABELS } from "@/lib/editor-sections";
import { useResumeStore } from "@/store/useResumeStore";
import { TemplateKey } from "@/store/demoData";
import { ResumeSection } from "@/types/resume";
import { EducationListEditor } from "./modules/EducationListEditor";
import { ExperienceListEditor } from "./modules/ExperienceListEditor";
import { GalleryEditor } from "./modules/GalleryEditor";
import { LinkListEditor } from "./modules/LinkListEditor";
import { PersonalInfoEditor } from "./modules/PersonalInfoEditor";
import { ProjectListEditor } from "./modules/ProjectListEditor";
import { SkillsEditor } from "./modules/SkillsEditor";
import { StandardSectionEditor } from "./modules/StandardSectionEditor";

function SortableItem({
  section,
  template,
  onRemove,
  onUpdate,
  onUpdateTitle,
}: {
  section: ResumeSection;
  template: TemplateKey;
  onRemove: (id: string) => void;
  onUpdate: (id: string, content: ResumeSection["content"]) => void;
  onUpdateTitle: (id: string, title: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: section.id,
  });
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditingTitle) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditingTitle]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const renderEditor = () => {
    switch (section.type) {
      case "personal":
        return (
          <PersonalInfoEditor
            data={section.content as never}
            template={template}
            sectionId={section.id}
            onChange={(value) => onUpdate(section.id, value)}
          />
        );
      case "experience":
        return (
          <ExperienceListEditor
            items={section.content as never}
            onChange={(value) => onUpdate(section.id, value)}
          />
        );
      case "education":
        return (
          <EducationListEditor
            items={section.content as never}
            onChange={(value) => onUpdate(section.id, value)}
          />
        );
      case "skills":
        return (
          <SkillsEditor
            items={section.content as never}
            sectionTitle={section.title}
            onChange={(value) => onUpdate(section.id, value)}
          />
        );
      case "custom-links":
        return (
          <LinkListEditor
            items={section.content as never}
            onChange={(value) => onUpdate(section.id, value)}
          />
        );
      case "gallery":
        return (
          <GalleryEditor
            items={section.content as never}
            onChange={(value) => onUpdate(section.id, value)}
          />
        );
      case "projects":
        return (
          <ProjectListEditor
            items={section.content as never}
            onChange={(value) => onUpdate(section.id, value)}
          />
        );
      case "custom":
      default:
        return (
          <StandardSectionEditor
            content={section.content as never}
            onChange={(value) => onUpdate(section.id, value)}
            isTemplateContent={
              section.id === "word-template" ||
              Boolean(
                (section.content as { noHeading?: boolean; noDividerAfter?: boolean })?.noHeading &&
                  (section.content as { noHeading?: boolean; noDividerAfter?: boolean })
                    ?.noDividerAfter
              )
            }
          />
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-editor-section-id={section.id}
      className="editor-section-card overflow-hidden rounded-[18px] border border-[#e0d8cc] bg-[#fffdf8] shadow-[0_12px_34px_rgba(77,63,44,0.05)] transition-shadow hover:shadow-[0_18px_42px_rgba(77,63,44,0.075)]"
    >
      <div className="flex items-center justify-between gap-2.5 border-b border-[#e4dcd1] bg-[#fbf8f2]/92 px-3 py-2">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <button
            {...attributes}
            {...listeners}
            className="rounded-lg border border-[#e0d8cc] bg-[#fffdf8] p-1.5 text-[#92887b] transition-colors hover:border-[#c9bdad] hover:text-[#3b352d]"
            title="拖拽排序"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>

          {isEditingTitle ? (
            <input
              ref={inputRef}
              type="text"
              value={section.title}
              onChange={(event) => onUpdateTitle(section.id, event.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  setIsEditingTitle(false);
                }
              }}
              className="w-full rounded-lg border border-blue-200 bg-blue-50/70 px-2.5 py-1 text-[11px] font-medium text-slate-900 outline-none focus:border-blue-500"
            />
          ) : (
            <div className="min-w-0 flex-1">
              <button
                onClick={() => setIsEditingTitle(true)}
                className="truncate text-left text-[12px] font-semibold text-[#211f1c] transition-colors hover:text-blue-600"
              >
                {section.title}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="rounded-lg border border-transparent p-1.5 text-[#92887b] transition-colors hover:border-[#ded5c7] hover:bg-white hover:text-[#3b352d]"
          >
            {isExpanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
          {section.type !== "personal" && (
            <button
              onClick={() => onRemove(section.id)}
              className="rounded-lg border border-transparent p-1.5 text-[#92887b] transition-colors hover:border-red-100 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {isExpanded && <div className="p-2.5 sm:p-3">{renderEditor()}</div>}
    </div>
  );
}

const ACTION_ICONS: Partial<Record<ResumeSection["type"], React.ReactNode>> = {
  "custom-links": <LinkIcon className="h-4 w-4" />,
  gallery: <ImageIcon className="h-4 w-4" />,
};

export function ModularEditor() {
  const sections = useResumeStore((s) => s.sections);
  const template = useResumeStore((s) => s.template);
  const reorderSections = useResumeStore((s) => s.reorderSections);
  const removeSection = useResumeStore((s) => s.removeSection);
  const updateSection = useResumeStore((s) => s.updateSection);
  const updateSectionTitle = useResumeStore((s) => s.updateSectionTitle);
  const addSection = useResumeStore((s) => s.addSection);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = sections.findIndex((section) => section.id === active.id);
    const newIndex = sections.findIndex((section) => section.id === over.id);

    reorderSections(arrayMove(sections, oldIndex, newIndex));
  };

  return (
    <div className="h-full space-y-3 p-1">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={sections.map((section) => section.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {sections.map((section) => (
              <SortableItem
                key={section.id}
                section={section}
                template={template}
                onRemove={removeSection}
                onUpdate={updateSection}
                onUpdateTitle={updateSectionTitle}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="rounded-[18px] border border-dashed border-[#ded6cb] bg-[#fffdf8]/82 px-3 py-3 shadow-[0_10px_30px_rgba(77,63,44,0.045)] sm:px-3.5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Quick Add
            </div>
            <div className="mt-1 text-[13px] font-semibold text-slate-950">继续补充模块</div>
          </div>
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-3">
          {QUICK_ADD_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => addSection(type)}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-[#e0d8cc] bg-[#fffdf8] px-2.5 py-1.5 text-[11px] font-medium text-[#5f584e] transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              {ACTION_ICONS[type] ?? <Plus className="h-3.5 w-3.5" />}
              {SECTION_LABELS[type]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

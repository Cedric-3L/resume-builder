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
  Github,
  Globe,
  GripVertical,
  Linkedin,
  Link as LinkIcon,
  Plus,
  Trash2,
  Twitter,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { LinkItem } from "@/types/resume";

interface LinkListEditorProps {
  items: LinkItem[];
  onChange: (items: LinkItem[]) => void;
}

function SortableLinkItem({
  item,
  onRemove,
  onUpdate,
}: {
  item: LinkItem;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof LinkItem, value: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id,
  });

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case "github":
        return <Github className="h-4 w-4" />;
      case "linkedin":
        return <Linkedin className="h-4 w-4" />;
      case "twitter":
        return <Twitter className="h-4 w-4" />;
      case "globe":
        return <Globe className="h-4 w-4" />;
      default:
        return <LinkIcon className="h-4 w-4" />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="mb-2 grid gap-2 rounded-[18px] border border-slate-200 bg-slate-50 p-2 md:grid-cols-[auto_1fr_1fr_1.2fr_auto]"
    >
      <button
        {...attributes}
        {...listeners}
        className="flex items-center justify-center rounded-xl bg-white px-2.5 text-slate-400 transition-colors hover:text-slate-700"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="relative">
        <select
          value={item.icon || "link"}
          onChange={(event) => onUpdate(item.id, "icon", event.target.value)}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 pl-9 text-[11px] outline-none transition-colors focus:border-blue-500"
        >
          <option value="link">普通链接</option>
          <option value="github">GitHub</option>
          <option value="linkedin">LinkedIn</option>
          <option value="twitter">Twitter / X</option>
          <option value="globe">个人站点</option>
        </select>
        <span className="pointer-events-none absolute left-3 top-2.5 text-slate-400">
          {getIcon(item.icon)}
        </span>
      </div>

      <input
        type="text"
        value={item.label}
        onChange={(event) => onUpdate(item.id, "label", event.target.value)}
        placeholder="标题，如 GitHub"
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none transition-colors focus:border-blue-500"
      />

      <input
        type="url"
        value={item.url}
        onChange={(event) => onUpdate(item.id, "url", event.target.value)}
        placeholder="https://..."
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none transition-colors focus:border-blue-500"
      />

      <button
        onClick={() => onRemove(item.id)}
        className="flex items-center justify-center rounded-xl bg-white px-2.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function LinkListEditor({ items = [], onChange }: LinkListEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    onChange(arrayMove(items, oldIndex, newIndex));
  };

  const addItem = () => {
    onChange([
      ...items,
      {
        id: uuidv4(),
        label: "",
        url: "",
        icon: "link",
      },
    ]);
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof LinkItem, value: string) => {
    onChange(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item) => (
            <SortableLinkItem
              key={item.id}
              item={item}
              onRemove={removeItem}
              onUpdate={updateItem}
            />
          ))}
        </SortableContext>
      </DndContext>

      <button
        onClick={addItem}
        className="flex w-full items-center justify-center gap-1.5 rounded-[18px] border-2 border-dashed border-slate-300 px-3 py-2 text-[11px] font-medium text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
      >
        <Plus className="h-3.5 w-3.5" />
        添加链接
      </button>
    </div>
  );
}

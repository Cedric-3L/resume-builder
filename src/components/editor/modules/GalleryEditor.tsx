/* eslint-disable @next/next/no-img-element */
import React, { useRef, useState } from "react";
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
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Image as ImageIcon,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { GalleryItem } from "@/types/resume";
import { compressImage } from "@/utils/image";
import { toast } from "@/store/useToastStore";

interface GalleryEditorProps {
  items: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
}

function SortableGalleryItem({
  item,
  onRemove,
  onUpdate,
}: {
  item: GalleryItem;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof GalleryItem, value: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_6px_18px_rgba(15,23,42,0.05)]"
    >
      <div className="relative border-b border-slate-200 bg-slate-50">
        <div className="absolute right-2 top-2 z-10 flex items-center gap-1.5">
          <button
            {...attributes}
            {...listeners}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white/95 text-slate-400 shadow-sm transition-colors hover:text-slate-700"
            title="Drag"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onRemove(item.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white/95 text-slate-400 shadow-sm transition-colors hover:border-red-100 hover:bg-red-50 hover:text-red-600"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="aspect-[4/3] overflow-hidden">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title || "gallery item"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
              <ImageIcon className="h-8 w-8" />
              <span className="text-[11px] font-medium text-slate-500">Upload preview image</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2.5 p-3">
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Title
          </div>
          <input
            type="text"
            value={item.title}
            onChange={(event) => onUpdate(item.id, "title", event.target.value)}
            placeholder="e.g. UI case study / Certificate / Screenshot"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none transition-colors focus:border-blue-500"
          />
        </div>

        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Description
          </div>
          <textarea
            value={item.description || ""}
            onChange={(event) => onUpdate(item.id, "description", event.target.value)}
            placeholder="Add a short note about this work, certificate, achievement, or link context."
            className="h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none transition-colors focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

export function GalleryEditor({ items = [], onChange }: GalleryEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) {
      return;
    }

    setIsUploading(true);

    try {
      const newItems: GalleryItem[] = [];

      for (const file of Array.from(files)) {
        const imageUrl = await compressImage(file, 1200, 0.75);
        newItems.push({
          id: uuidv4(),
          title: file.name.replace(/\.[^.]+$/, ""),
          imageUrl,
          description: "",
        });
      }

      onChange([...items, ...newItems]);
    } catch (error) {
      console.error("Image upload failed:", error);
      toast("图片处理失败，请尝试其他文件。", "error");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof GalleryItem, value: string) => {
    onChange(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map((item) => item.id)} strategy={rectSortingStrategy}>
          <div className="grid gap-3 md:grid-cols-2">
            {items.map((item) => (
              <SortableGalleryItem
                key={item.id}
                item={item}
                onRemove={removeItem}
                onUpdate={updateItem}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="mt-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex w-full items-center justify-center gap-1.5 rounded-[18px] border-2 border-dashed border-slate-300 px-3 py-3 text-[11px] font-medium text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Processing images...
            </>
          ) : (
            <>
              <Upload className="h-3.5 w-3.5" />
              Add works / certificates
            </>
          )}
        </button>
        <p className="mt-1.5 text-center text-[10px] text-slate-500">
          Supports multiple images. Best for certificates, posters, screenshots, and portfolio samples.
        </p>
      </div>
    </div>
  );
}

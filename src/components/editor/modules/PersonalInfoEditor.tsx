import React, { useCallback, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Eye, EyeOff, Plus, Trash2, Upload, X } from "lucide-react";
import { TemplateKey } from "@/store/demoData";
import { PersonalExtraField, PersonalInfo } from "@/types/resume";
import {
  PersonalInfoField,
  getPersonalInfoFieldMeta,
  getTemplatePersonalInfoEditorConfig,
  normalizePersonalInfoForTemplate,
} from "@/lib/template-personal-info-config";

interface PersonalInfoEditorProps {
  data: PersonalInfo;
  template: TemplateKey;
  sectionId: string;
  onChange: (data: PersonalInfo) => void;
}

const PANEL_CLASSNAME = "rounded-[20px] border border-slate-200 bg-slate-50 p-2.5";
const SECTION_TITLE_CLASSNAME = "text-[12px] font-semibold text-slate-900";
const LABEL_CLASSNAME = "text-[9px] font-medium text-slate-500";
const INPUT_CLASSNAME =
  "w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-[9px] text-slate-900 outline-none transition-colors focus:border-blue-500";

function FieldInput({
  field,
  value,
  onChange,
  hideLabel = false,
}: {
  field: PersonalInfoField;
  value: string;
  onChange: (value: string) => void;
  hideLabel?: boolean;
}) {
  const config = getPersonalInfoFieldMeta(field);

  return (
    <label className="block space-y-1">
      {!hideLabel && <span className={LABEL_CLASSNAME}>{config.label}</span>}
      <input
        type={config.type || "text"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={config.placeholder}
        className={INPUT_CLASSNAME}
      />
    </label>
  );
}

export function PersonalInfoEditor({ data, template, sectionId: _sectionId, onChange }: PersonalInfoEditorProps) {
  void _sectionId;
  const editorConfig = useMemo(
    () => getTemplatePersonalInfoEditorConfig(template),
    [template]
  );
  const [manuallyEnabledExtraFields, setManuallyEnabledExtraFields] = useState<PersonalInfoField[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const enabledExtraFields = useMemo(
    () => Array.from(new Set([...(editorConfig.autoEnabledFields || []), ...manuallyEnabledExtraFields])),
    [editorConfig.autoEnabledFields, manuallyEnabledExtraFields]
  );

  const sectionFields = useMemo(
    () => new Set(editorConfig.sections.flatMap((section) => section.fields)),
    [editorConfig.sections]
  );

  const visibleExtraFields = useMemo(
    () =>
      editorConfig.extraFields.filter(
        (field) => enabledExtraFields.includes(field) || Boolean(data[field])
      ),
    [data, editorConfig.extraFields, enabledExtraFields]
  );

  const availableExtraFields = useMemo(
    () =>
      editorConfig.extraFields.filter(
        (field) => !sectionFields.has(field) && !visibleExtraFields.includes(field)
      ),
    [editorConfig.extraFields, sectionFields, visibleExtraFields]
  );

  const customFields = useMemo(
    () => (Array.isArray(data.extraFields) ? data.extraFields : []),
    [data.extraFields]
  );

  const commitPersonalInfo = useCallback(
    (nextData: PersonalInfo, changedField?: PersonalInfoField) => {
      onChange(normalizePersonalInfoForTemplate(template, nextData, changedField));
    },
    [onChange, template]
  );

  const handleChange = useCallback(
    (field: PersonalInfoField, value: string | boolean) => {
      commitPersonalInfo({ ...data, [field]: value }, field);
    },
    [commitPersonalInfo, data]
  );

  const handleCustomFieldsChange = useCallback(
    (fields: PersonalExtraField[]) => {
      commitPersonalInfo({ ...data, extraFields: fields });
    },
    [commitPersonalInfo, data]
  );

  const handleAddCustomField = () => {
    handleCustomFieldsChange([
      ...customFields,
      {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `field-${Date.now()}`,
        label: "自定义字段",
        value: "",
        group: "additional",
        visible: true,
      },
    ]);
  };

  const handleUpdateCustomField = (id: string, patch: Partial<PersonalExtraField>) => {
    handleCustomFieldsChange(
      customFields.map((field) => (field.id === id ? { ...field, ...patch } : field))
    );
  };

  const handleRemoveCustomField = (id: string) => {
    handleCustomFieldsChange(customFields.filter((field) => field.id !== id));
  };

  const handleMoveCustomField = (id: string, direction: -1 | 1) => {
    const index = customFields.findIndex((field) => field.id === id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= customFields.length) {
      return;
    }

    const nextFields = [...customFields];
    const [moved] = nextFields.splice(index, 1);
    nextFields.splice(nextIndex, 0, moved);
    handleCustomFieldsChange(nextFields);
  };

  const handleEnableExtraField = (field: PersonalInfoField) => {
    setManuallyEnabledExtraFields((prev) => (prev.includes(field) ? prev : [...prev, field]));
  };

  const handleRemoveExtraField = (field: PersonalInfoField) => {
    setManuallyEnabledExtraFields((prev) => prev.filter((item) => item !== field));
    handleChange(field, "");
  };

  const handleAvatarUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploadError(null);

      if (file.size > 6 * 1024 * 1024) {
        setUploadError("照片大小不能超过 6MB");
        event.target.value = "";
        return;
      }

      if (!["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(file.type)) {
        setUploadError("仅支持 JPG、PNG、WebP 格式");
        event.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const MAX_W = 900;
          const MAX_H = 1200;
          let { width, height } = img;
          if (width > MAX_W || height > MAX_H) {
            const ratio = Math.min(MAX_W / width, MAX_H / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            handleChange("avatar", reader.result as string);
            return;
          }
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);
          const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
          handleChange("avatar", canvas.toDataURL(outputType, 0.96));
        };
        img.onerror = () => setUploadError("照片读取失败，请换一张图片再试");
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);

      event.target.value = "";
    },
    [handleChange]
  );

  return (
    <div className={PANEL_CLASSNAME}>
      <div className="space-y-4.5">
        {editorConfig.sections.map((section) => (
          <section key={section.key} className="space-y-2.5">
            <div className={SECTION_TITLE_CLASSNAME}>{section.title}</div>
            <div className={`grid gap-1.5 ${section.columns === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
              {section.fields.map((field) => (
                <FieldInput
                  key={field}
                  field={field}
                  value={String(data[field] || "")}
                  onChange={(value) => handleChange(field, value)}
                />
              ))}
            </div>
          </section>
        ))}

        {editorConfig.extraFields.length > 0 && (
          <section className="space-y-2.5">
            <div className={SECTION_TITLE_CLASSNAME}>更多信息</div>
            {availableExtraFields.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {availableExtraFields.map((field) => {
                  const meta = getPersonalInfoFieldMeta(field);
                  return (
                    <button
                      key={field}
                      onClick={() => handleEnableExtraField(field)}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                    >
                      + {meta.label}
                    </button>
                  );
                })}
              </div>
            )}

            {visibleExtraFields.length > 0 && (
              <div className="grid gap-1.5 md:grid-cols-3">
                {visibleExtraFields.map((field) => {
                  const meta = getPersonalInfoFieldMeta(field);
                  return (
                    <div key={field} className="rounded-[16px] border border-slate-200 bg-white p-2">
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-medium text-slate-600">{meta.label}</span>
                        <button
                          onClick={() => handleRemoveExtraField(field)}
                          className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      <FieldInput
                        field={field}
                        value={String(data[field] || "")}
                        onChange={(value) => handleChange(field, value)}
                        hideLabel
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        <section className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className={SECTION_TITLE_CLASSNAME}>自定义字段</div>
              <p className="mt-0.5 text-[10px] leading-4 text-slate-500">
                年龄、籍贯、政治面貌之外的补充信息也可以加在这里，所有模板都会兜底显示。
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddCustomField}
              className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-100"
            >
              <Plus className="h-3 w-3" />
              添加字段
            </button>
          </div>

          {customFields.length > 0 ? (
            <div className="grid gap-1.5">
              {customFields.map((field, index) => {
                const isVisible = field.visible !== false;
                return (
                  <div
                    key={field.id}
                    className={`grid gap-1.5 rounded-[16px] border p-2 md:grid-cols-[1fr_1.2fr_auto] ${
                      isVisible
                        ? "border-slate-200 bg-white"
                        : "border-dashed border-slate-200 bg-white/55"
                    }`}
                  >
                    <label className="block space-y-1">
                      <span className={LABEL_CLASSNAME}>字段名</span>
                      <input
                        value={field.label}
                        onChange={(event) =>
                          handleUpdateCustomField(field.id, { label: event.target.value })
                        }
                        placeholder="例如：籍贯"
                        className={INPUT_CLASSNAME}
                      />
                    </label>
                    <label className="block space-y-1">
                      <span className={LABEL_CLASSNAME}>字段值</span>
                      <input
                        value={field.value}
                        onChange={(event) =>
                          handleUpdateCustomField(field.id, { value: event.target.value })
                        }
                        placeholder="例如：浙江杭州"
                        className={INPUT_CLASSNAME}
                      />
                    </label>
                    <div className="flex items-end justify-end gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateCustomField(field.id, { visible: !isVisible })
                        }
                        className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-400 transition-colors hover:text-blue-600"
                        title={isVisible ? "隐藏字段" : "显示字段"}
                      >
                        {isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveCustomField(field.id, -1)}
                        disabled={index === 0}
                        className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-400 transition-colors hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-35"
                        title="上移"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveCustomField(field.id, 1)}
                        disabled={index === customFields.length - 1}
                        className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-400 transition-colors hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-35"
                        title="下移"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomField(field.id)}
                        className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-400 transition-colors hover:border-red-100 hover:bg-red-50 hover:text-red-600"
                        title="删除"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAddCustomField}
              className="flex w-full items-center justify-center gap-1.5 rounded-[16px] border border-dashed border-slate-300 bg-white/70 px-3 py-3 text-[11px] font-medium text-slate-500 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              <Plus className="h-3.5 w-3.5" />
              添加年龄、籍贯、证书编号等页面没有的字段
            </button>
          )}
        </section>

        <label className="flex cursor-pointer items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleChange("showAvatar", data.showAvatar === false);
            }}
            style={{
              width: 32,
              height: 18,
              borderRadius: 9,
              background: data.showAvatar !== false ? "#2563eb" : "#cbd5e1",
              position: "relative",
              transition: "background 0.2s",
              cursor: "pointer",
              border: "none",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 1,
                left: data.showAvatar !== false ? 15 : 1,
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "white",
                transition: "left 0.2s",
                boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
              }}
            />
          </button>
          <span className="text-[10px] font-medium text-slate-600">显示证件照区域</span>
        </label>

        {data.showAvatar !== false && (
          <section className="space-y-2.5">
            <div className={SECTION_TITLE_CLASSNAME}>上传证件照</div>
            <div className="flex items-start gap-3">
              {data.avatar ? (
                <div className="relative shrink-0">
                  <img
                    src={data.avatar}
                    alt="证件照预览"
                    className="h-28 w-21 rounded-xl border border-slate-200 object-cover shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleChange("avatar", "")}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-28 w-21 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 bg-white text-slate-400 transition-colors hover:border-blue-400 hover:text-blue-500"
                >
                  <Upload className="h-5 w-5" />
                  <span className="text-[9px] font-medium">点击上传</span>
                </button>
              )}
              <div className="min-w-0 text-[10px] text-slate-400">
                <p className="leading-relaxed">
                  请上传标准证件照，支持 JPG、PNG、WebP 格式，大小不超过 6MB。
                </p>
                <p className="mt-1 leading-relaxed">
                  已提高保存分辨率，预览和导出时会更清晰。
                </p>
                {uploadError && <p className="mt-1 text-red-500">{uploadError}</p>}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
          </section>
        )}

        <section className="space-y-2.5">
          <div className={SECTION_TITLE_CLASSNAME}>
            {editorConfig.summaryLabel || "个人简介"}
          </div>
          <label className="block space-y-1">
            <textarea
              placeholder={
                editorConfig.summaryPlaceholder ||
                "例如：5 年工作经验，擅长复杂业务系统设计、用户分析与跨团队协作。"
              }
              value={data.summary || ""}
              onChange={(event) => handleChange("summary", event.target.value)}
              className="h-18 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[10px] text-slate-900 outline-none transition-colors focus:border-blue-500"
            />
          </label>
        </section>
      </div>
    </div>
  );
}

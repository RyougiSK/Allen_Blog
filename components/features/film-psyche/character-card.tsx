"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Copy, Trash2 } from "lucide-react";
import type { CharacterData } from "@/lib/types/film-psyche";
import { ARCHETYPE_OPTIONS, FA_OPTIONS } from "@/lib/types/film-psyche";

interface Props {
  data: CharacterData;
  index: number;
  defaultCollapsed?: boolean;
  onChange: (data: CharacterData) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}

export function CharacterCard({
  data,
  index,
  defaultCollapsed = false,
  onChange,
  onDuplicate,
  onRemove,
}: Props) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  function setField(field: keyof CharacterData, value: string) {
    onChange({ ...data, [field]: value });
  }

  return (
    <div className="rounded-lg border border-border bg-surface/20">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-text-quaternary hover:text-text-secondary"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        <span className="text-xs text-text-quaternary font-mono">
          #{index + 1}
        </span>

        <input
          type="text"
          value={data.name}
          onChange={(e) => setField("name", e.target.value)}
          placeholder="角色名称"
          className="flex-1 bg-transparent text-sm font-medium text-text-primary placeholder:text-text-quaternary focus:outline-none"
        />

        <button
          onClick={onDuplicate}
          className="rounded p-1.5 text-text-quaternary hover:bg-surface hover:text-text-secondary transition-colors"
          title="复制"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onRemove}
          className="rounded p-1.5 text-text-quaternary hover:bg-danger/10 hover:text-danger transition-colors"
          title="删除"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {!collapsed && (
        <div className="px-4 py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="角色身份"
              value={data.role_in_story}
              onChange={(v) => setField("role_in_story", v)}
              placeholder="例：主角的导师，绝地武士"
            />
            <Field
              label="与主角关系"
              value={data.relationship_to_protagonist}
              onChange={(v) => setField("relationship_to_protagonist", v)}
              placeholder="例：精神父亲，引路人"
            />
          </div>

          <Field
            label="角色反复做什么"
            value={data.repeated_actions}
            onChange={(v) => setField("repeated_actions", v)}
            placeholder="例：在关键时刻引导 Luke 相信自己的内在力量"
            multiline
          />
          <Field
            label="角色反复说什么"
            value={data.repeated_lines}
            onChange={(v) => setField("repeated_lines", v)}
            placeholder="例：Use the Force, Luke / Trust your feelings"
            multiline
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="角色如何做决定"
              value={data.decision_style}
              onChange={(v) => setField("decision_style", v)}
              placeholder="例：基于更大的命运图景和责任"
            />
            <Field
              label="角色如何面对压力"
              value={data.stress_response}
              onChange={(v) => setField("stress_response", v)}
              placeholder="例：保持平静，接受结果"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="角色如何处理关系"
              value={data.relationship_style}
              onChange={(v) => setField("relationship_style", v)}
              placeholder="例：承担保护者与传承者角色"
            />
            <Field
              label="角色代表的心理力量"
              value={data.psychological_force}
              onChange={(v) => setField("psychological_force", v)}
              placeholder="例：智慧、秩序、更高的使命感"
            />
          </div>

          <div className="border-t border-border/50 pt-4 mt-4">
            <p className="text-xs font-medium text-text-tertiary mb-3">
              判断（先观察，再判断）
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-text-tertiary mb-1">
                  暂定原型位置
                </label>
                <select
                  value={data.archetype_guess}
                  onChange={(e) => setField("archetype_guess", e.target.value)}
                  className="w-full rounded-md border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary focus:border-accent-warm focus:outline-none"
                >
                  <option value="">未选择</option>
                  {ARCHETYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-text-tertiary mb-1">
                  暂定 Function-Attitude
                </label>
                <select
                  value={data.function_attitude_guess}
                  onChange={(e) =>
                    setField("function_attitude_guess", e.target.value)
                  }
                  className="w-full rounded-md border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary focus:border-accent-warm focus:outline-none"
                >
                  <option value="">未选择</option>
                  {FA_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <Field
                label="证据"
                value={data.evidence}
                onChange={(v) => setField("evidence", v)}
                placeholder="列出支持你判断的具体行为、台词、场景"
                multiline
              />
              <Field
                label="不确定点"
                value={data.uncertainty}
                onChange={(v) => setField("uncertainty", v)}
                placeholder="哪些判断你不太确定？为什么？"
                multiline
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  const cls =
    "w-full rounded-md border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-quaternary focus:border-accent-warm focus:outline-none resize-none";

  return (
    <div>
      <label className="block text-xs text-text-tertiary mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          placeholder={placeholder}
          className={cls}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </div>
  );
}

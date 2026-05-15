"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Star, Trash2 } from "lucide-react";
import type { SceneData } from "@/lib/types/film-psyche";

interface Props {
  data: SceneData;
  index: number;
  onChange: (data: SceneData) => void;
  onRemove: () => void;
}

export function SceneCard({ data, index, onChange, onRemove }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  function setField(field: keyof SceneData, value: string | boolean) {
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
          value={data.scene_name}
          onChange={(e) => setField("scene_name", e.target.value)}
          placeholder="场景名称"
          className="flex-1 bg-transparent text-sm font-medium text-text-primary placeholder:text-text-quaternary focus:outline-none"
        />

        <input
          type="text"
          value={data.time_marker}
          onChange={(e) => setField("time_marker", e.target.value)}
          placeholder="时间点"
          className="w-20 bg-transparent text-xs text-text-tertiary placeholder:text-text-quaternary text-right focus:outline-none"
        />

        <button
          onClick={() => setField("is_key_scene", !data.is_key_scene)}
          className={`rounded p-1.5 transition-colors ${
            data.is_key_scene
              ? "text-warning"
              : "text-text-quaternary hover:text-text-secondary"
          }`}
          title="标记为关键场景"
        >
          <Star
            className="h-4 w-4"
            fill={data.is_key_scene ? "currentColor" : "none"}
          />
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
          <Field
            label="场景发生了什么"
            value={data.scene_summary}
            onChange={(v) => setField("scene_summary", v)}
            placeholder="简要描述这个场景的核心事件"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="参与角色"
              value={data.characters_involved}
              onChange={(v) => setField("characters_involved", v)}
              placeholder="例：Luke, Obi-Wan, R2-D2"
            />
            <Field
              label="关键台词"
              value={data.key_lines}
              onChange={(v) => setField("key_lines", v)}
              placeholder="例：Use the Force, Luke."
            />
          </div>

          <Field
            label="关键行为"
            value={data.key_actions}
            onChange={(v) => setField("key_actions", v)}
            placeholder="例：关闭瞄准电脑，凭内在感知完成攻击"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="主角想要什么"
              value={data.protagonist_desire}
              onChange={(v) => setField("protagonist_desire", v)}
              placeholder="例：完成任务，摧毁 Death Star"
            />
            <Field
              label="主角害怕什么"
              value={data.protagonist_fear}
              onChange={(v) => setField("protagonist_fear", v)}
              placeholder="例：失败、死亡、辜负导师"
            />
          </div>

          <Field
            label="这个场景改变了什么"
            value={data.what_changed}
            onChange={(v) => setField("what_changed", v)}
            placeholder="例：Luke 从依赖外部技术转向信任内在力量"
          />

          <div className="border-t border-border/50 pt-4">
            <p className="text-xs font-medium text-text-tertiary mb-3">
              初步解读
            </p>
            <div className="space-y-4">
              <Field
                label="可能的原型意义"
                value={data.archetypal_meaning}
                onChange={(v) => setField("archetypal_meaning", v)}
                placeholder="例：英雄第一次与 Self / Force 建立连接"
              />
              <Field
                label="可能的 Function-Attitude 证据"
                value={data.function_attitude_evidence}
                onChange={(v) => setField("function_attitude_evidence", v)}
                placeholder="例：可能呈现 Ni，依靠不可见的内在图像与方向感"
              />
              <Field
                label="我的初步解释"
                value={data.user_interpretation}
                onChange={(v) => setField("user_interpretation", v)}
                placeholder="你对这个场景的心理学意义的整体理解"
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-xs text-text-tertiary mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        placeholder={placeholder}
        className="w-full rounded-md border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-quaternary focus:border-accent-warm focus:outline-none resize-none"
      />
    </div>
  );
}

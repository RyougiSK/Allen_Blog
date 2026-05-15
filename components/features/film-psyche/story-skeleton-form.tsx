"use client";

import { useReducer, useEffect, useRef, useCallback } from "react";
import { upsertStoryStructure } from "@/lib/actions/film-psyche";
import { useToast } from "@/lib/hooks/use-toast";
import type { StoryStructure, StoryStructureData } from "@/lib/types/film-psyche";

type Action =
  | { type: "SET_FIELD"; field: keyof StoryStructureData; value: string }
  | { type: "RESET"; data: StoryStructureData };

function reducer(state: StoryStructureData, action: Action): StoryStructureData {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET":
      return action.data;
  }
}

const EMPTY: StoryStructureData = {
  opening_state: "",
  protagonist_surface_desire: "",
  protagonist_deep_lack: "",
  protagonist_fear: "",
  protagonist_escape: "",
  protagonist_called_by: "",
  protagonist_loss: "",
  protagonist_integration: "",
  protagonist_transformation: "",
  call_to_adventure: "",
  point_of_no_return: "",
  final_achievement: "",
  ending_change: "",
};

function toFormData(story: StoryStructure | null): StoryStructureData {
  if (!story) return EMPTY;
  const { id, project_id, ...rest } = story;
  return rest;
}

interface Props {
  projectId: string;
  story: StoryStructure | null;
}

interface FieldDef {
  key: keyof StoryStructureData;
  label: string;
  placeholder: string;
}

const STORY_FIELDS: FieldDef[] = [
  {
    key: "opening_state",
    label: "故事开始时，主角在哪里？",
    placeholder: "例：主角在 Tatooine 的农场生活",
  },
  {
    key: "protagonist_surface_desire",
    label: "主角一开始想要什么？",
    placeholder: "例：他想离开农场，进入更大的世界",
  },
  {
    key: "protagonist_deep_lack",
    label: "主角被什么困住？",
    placeholder: "例：被家庭责任、边缘身份和未知身世困住",
  },
  {
    key: "call_to_adventure",
    label: "什么事件打破了日常生活？",
    placeholder: "例：Leia 的求救信息打破了日常",
  },
  {
    key: "point_of_no_return",
    label: "主角什么时候无法回头？",
    placeholder: "例：叔叔婶婶死亡后，他无法回头",
  },
  {
    key: "final_achievement",
    label: "主角最后完成了什么？",
    placeholder: "例：最终他摧毁了 Death Star",
  },
  {
    key: "ending_change",
    label: "结局时主角发生了什么变化？",
    placeholder: "例：从普通少年变成了被集体承认的英雄",
  },
];

const JOURNEY_FIELDS: FieldDef[] = [
  {
    key: "protagonist_fear",
    label: "主角恐惧什么？",
    placeholder: "例：永远被困在平凡生活里",
  },
  {
    key: "protagonist_escape",
    label: "主角逃避什么？",
    placeholder: "例：面对自己的真实身份与力量",
  },
  {
    key: "protagonist_called_by",
    label: "主角被什么召唤？",
    placeholder: "例：Leia 的求救影像",
  },
  {
    key: "protagonist_loss",
    label: "主角失去了什么？",
    placeholder: "例：旧家庭结构",
  },
  {
    key: "protagonist_integration",
    label: "主角整合了什么？",
    placeholder: "例：对 Force 的信任",
  },
  {
    key: "protagonist_transformation",
    label: "主角最终变化？",
    placeholder: "例：从外部渴望转向内在信任",
  },
];

export function StorySkeletonForm({ projectId, story }: Props) {
  const { addToast } = useToast();
  const [state, dispatch] = useReducer(reducer, toFormData(story));
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const autoSave = useCallback(async () => {
    const result = await upsertStoryStructure(projectId, state);
    if (!result.success) {
      addToast({ variant: "error", message: "自动保存失败" });
    }
  }, [projectId, state, addToast]);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(autoSave, 2000);
    return () => clearTimeout(timerRef.current);
  }, [state, autoSave]);

  function setField(field: keyof StoryStructureData, value: string) {
    dispatch({ type: "SET_FIELD", field, value });
  }

  function renderField(f: FieldDef) {
    return (
      <div key={f.key}>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          {f.label}
        </label>
        <textarea
          value={state[f.key]}
          onChange={(e) => setField(f.key, e.target.value)}
          rows={2}
          placeholder={f.placeholder}
          className="w-full rounded-md border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-quaternary focus:border-accent-warm focus:outline-none resize-none"
        />
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-2xl">
      <section>
        <h2 className="text-base font-medium text-text-primary mb-1">
          故事骨架
        </h2>
        <p className="text-xs text-text-quaternary mb-4">
          先不分析，只记录事实。按时间顺序描述关键转折。
        </p>
        <div className="space-y-4">{STORY_FIELDS.map(renderField)}</div>
      </section>

      <section>
        <h2 className="text-base font-medium text-text-primary mb-1">
          主角心理旅程
        </h2>
        <p className="text-xs text-text-quaternary mb-4">
          这是整部分析的核心。描述主角的内在状态与变化。
        </p>
        <div className="space-y-4">{JOURNEY_FIELDS.map(renderField)}</div>
      </section>

      <p className="text-xs text-text-quaternary">修改将自动保存</p>
    </div>
  );
}

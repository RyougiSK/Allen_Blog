"use client";

import { useReducer, useEffect, useRef, useCallback } from "react";
import { Plus } from "lucide-react";
import { saveScenes } from "@/lib/actions/film-psyche";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/use-toast";
import { SceneCard } from "./scene-card";
import type { FilmScene, SceneData } from "@/lib/types/film-psyche";
import { SCENE_TYPE_SUGGESTIONS } from "@/lib/types/film-psyche";

type Action =
  | { type: "SET"; index: number; data: SceneData }
  | { type: "ADD"; name?: string }
  | { type: "REMOVE"; index: number }
  | { type: "RESET"; data: SceneData[] };

const EMPTY_SCENE: SceneData = {
  scene_name: "",
  time_marker: "",
  scene_summary: "",
  characters_involved: "",
  key_lines: "",
  key_actions: "",
  protagonist_desire: "",
  protagonist_fear: "",
  what_changed: "",
  archetypal_meaning: "",
  function_attitude_evidence: "",
  user_interpretation: "",
  is_key_scene: false,
  sort_order: 0,
};

function reducer(state: SceneData[], action: Action): SceneData[] {
  switch (action.type) {
    case "SET":
      return state.map((s, i) => (i === action.index ? action.data : s));
    case "ADD":
      return [
        ...state,
        {
          ...EMPTY_SCENE,
          scene_name: action.name ?? "",
          sort_order: state.length,
        },
      ];
    case "REMOVE":
      return state.filter((_, i) => i !== action.index);
    case "RESET":
      return action.data;
  }
}

function toSceneData(scenes: FilmScene[]): SceneData[] {
  return scenes.map(({ id, project_id, ...rest }) => rest);
}

interface Props {
  projectId: string;
  scenes: FilmScene[];
}

export function SceneCardsPage({ projectId, scenes }: Props) {
  const { addToast } = useToast();
  const [state, dispatch] = useReducer(reducer, toSceneData(scenes));
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const autoSave = useCallback(async () => {
    const result = await saveScenes(projectId, state);
    if (!result.success) {
      addToast({ variant: "error", message: "自动保存失败" });
    }
  }, [projectId, state, addToast]);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(autoSave, 2000);
    return () => clearTimeout(timerRef.current);
  }, [state, autoSave]);

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-quaternary">
          建议添加 5-8 个关键场景
        </p>
        <span className="text-xs text-text-tertiary">
          已添加 {state.length} 个场景
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {SCENE_TYPE_SUGGESTIONS.map((name) => (
          <button
            key={name}
            onClick={() => dispatch({ type: "ADD", name })}
            className="rounded-full border border-border/50 px-2.5 py-1 text-xs text-text-tertiary hover:text-text-secondary hover:border-border transition-colors"
          >
            + {name}
          </button>
        ))}
      </div>

      {state.length === 0 && (
        <div className="rounded-lg border border-dashed border-border py-12 text-center">
          <p className="text-sm text-text-tertiary">
            还没有场景。点击上方推荐场景类型快速添加，或点击下方按钮手动添加。
          </p>
        </div>
      )}

      {state.map((scene, i) => (
        <SceneCard
          key={i}
          data={scene}
          index={i}
          onChange={(data) => dispatch({ type: "SET", index: i, data })}
          onRemove={() => dispatch({ type: "REMOVE", index: i })}
        />
      ))}

      <Button
        variant="ghost"
        onClick={() => dispatch({ type: "ADD" })}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-1.5" />
        添加场景
      </Button>

      <p className="text-xs text-text-quaternary">修改将自动保存</p>
    </div>
  );
}

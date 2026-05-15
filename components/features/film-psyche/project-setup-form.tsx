"use client";

import { useReducer, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createProject, updateProject } from "@/lib/actions/film-psyche";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/use-toast";
import type { FilmProject, ProjectSetupData } from "@/lib/types/film-psyche";
import { WORK_TYPE_OPTIONS } from "@/lib/types/film-psyche";

type Action =
  | { type: "SET_FIELD"; field: keyof ProjectSetupData; value: string | number | null }
  | { type: "RESET"; data: ProjectSetupData };

function reducer(state: ProjectSetupData, action: Action): ProjectSetupData {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET":
      return action.data;
  }
}

function toFormData(project: FilmProject | null): ProjectSetupData {
  return {
    title: project?.title ?? "",
    original_title: project?.original_title ?? "",
    work_type: project?.work_type ?? "movie",
    year: project?.year ?? null,
    director_or_author: project?.director_or_author ?? "",
    analysis_goal: project?.analysis_goal ?? "",
  };
}

interface ProjectSetupFormProps {
  project: FilmProject | null;
}

export function ProjectSetupForm({ project }: ProjectSetupFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [state, dispatch] = useReducer(reducer, toFormData(project));
  const [saving, setSaving] = useReducer((_: boolean, v: boolean) => v, false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isNew = !project;

  const autoSave = useCallback(async () => {
    if (!project) return;
    const result = await updateProject(project.id, state);
    if (!result.success) {
      addToast({ variant: "error", message: "自动保存失败" });
    }
  }, [project, state, addToast]);

  useEffect(() => {
    if (isNew) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(autoSave, 2000);
    return () => clearTimeout(timerRef.current);
  }, [state, isNew, autoSave]);

  async function handleCreate() {
    if (!state.title.trim()) {
      addToast({ variant: "error", message: "请填写作品名称" });
      return;
    }
    setSaving(true);
    const result = await createProject(state);
    setSaving(false);

    if (result.success && result.projectId) {
      router.push(`/admin/film-psyche/${result.projectId}/story`);
    } else {
      addToast({ variant: "error", message: result.error ?? "创建失败" });
    }
  }

  function setField(field: keyof ProjectSetupData, value: string | number | null) {
    dispatch({ type: "SET_FIELD", field, value });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            作品名称 *
          </label>
          <input
            type="text"
            value={state.title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="例：星球大战：新希望"
            className="w-full rounded-md border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-quaternary focus:border-accent-warm focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            英文名称
          </label>
          <input
            type="text"
            value={state.original_title}
            onChange={(e) => setField("original_title", e.target.value)}
            placeholder="例：Star Wars: A New Hope"
            className="w-full rounded-md border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-quaternary focus:border-accent-warm focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              类型
            </label>
            <select
              value={state.work_type}
              onChange={(e) => setField("work_type", e.target.value)}
              className="w-full rounded-md border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary focus:border-accent-warm focus:outline-none"
            >
              {WORK_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              年份
            </label>
            <input
              type="number"
              value={state.year ?? ""}
              onChange={(e) =>
                setField("year", e.target.value ? Number(e.target.value) : null)
              }
              placeholder="例：1977"
              className="w-full rounded-md border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-quaternary focus:border-accent-warm focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            导演 / 作者
          </label>
          <input
            type="text"
            value={state.director_or_author}
            onChange={(e) => setField("director_or_author", e.target.value)}
            placeholder="例：George Lucas"
            className="w-full rounded-md border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-quaternary focus:border-accent-warm focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            分析目标
          </label>
          <textarea
            value={state.analysis_goal}
            onChange={(e) => setField("analysis_goal", e.target.value)}
            rows={3}
            placeholder="例：我想分析 Luke Skywalker 如何从普通少年进入英雄旅程，以及 Darth Vader 作为阴影父亲的象征意义。"
            className="w-full rounded-md border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-quaternary focus:border-accent-warm focus:outline-none resize-none"
          />
        </div>
      </div>

      {isNew && (
        <Button onClick={handleCreate} loading={saving}>
          创建项目并开始分析
        </Button>
      )}

      {!isNew && (
        <p className="text-xs text-text-quaternary">修改将自动保存</p>
      )}
    </div>
  );
}

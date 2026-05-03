"use client";

import { useReducer, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Copy, Eye, EyeOff, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useToast } from "@/lib/hooks/use-toast";
import { MarkdownPreview } from "@/components/features/markdown-preview";
import { generateAnalysisMarkdown } from "@/lib/utils/generate-analysis-markdown";
import {
  createAnalysis,
  updateAnalysis,
  autoSaveAnalysis,
} from "@/lib/actions/analysis";
import type {
  AnalysisEntryWithCharacters,
  WorkType,
  Archetype,
  MbtiFunction,
} from "@/lib/types";

const WORK_TYPES: { value: WorkType; label: string }[] = [
  { value: "movie", label: "电影" },
  { value: "series", label: "剧集" },
  { value: "book", label: "书籍" },
  { value: "anime", label: "动画" },
];

const ARCHETYPES: { value: Archetype; label: string }[] = [
  { value: "Hero", label: "英雄 Hero" },
  { value: "Parent", label: "父母 Parent" },
  { value: "Child", label: "孩童 Child" },
  { value: "Inferior", label: "劣势 Inferior" },
  { value: "Opposing", label: "对立 Opposing" },
  { value: "Senex", label: "智者 Senex" },
  { value: "Trickster", label: "骗师 Trickster" },
  { value: "Demon", label: "魔魅 Demon" },
];

const MBTI_FUNCTIONS: { value: MbtiFunction; label: string }[] = [
  { value: "", label: "—" },
  { value: "Ne", label: "Ne" },
  { value: "Ni", label: "Ni" },
  { value: "Fe", label: "Fe" },
  { value: "Fi", label: "Fi" },
  { value: "Te", label: "Te" },
  { value: "Ti", label: "Ti" },
  { value: "Se", label: "Se" },
  { value: "Si", label: "Si" },
];

interface CharacterRow {
  tempId: string;
  character_name: string;
  archetype: Archetype;
  mbti_function: MbtiFunction;
  notes: string;
  sort_order: number;
}

interface State {
  title: string;
  work_name: string;
  work_type: WorkType;
  author_director: string;
  cover_image_url: string;
  thesis: string;
  characters: CharacterRow[];
  conflict_internal: string;
  conflict_external: string;
  shadow: string;
  projection: string;
  development_start: string;
  development_crisis: string;
  development_end: string;
  reflection_scenario: string;
  reflection_insight: string;
  closing: string;
  saving: boolean;
  lastSaved: string | null;
  error: string | null;
  showPreview: boolean;
}

type Action =
  | { type: "SET_FIELD"; field: string; value: string }
  | { type: "ADD_CHARACTER" }
  | { type: "REMOVE_CHARACTER"; tempId: string }
  | {
      type: "UPDATE_CHARACTER";
      tempId: string;
      field: keyof CharacterRow;
      value: string;
    }
  | { type: "SET_SAVING"; saving: boolean }
  | { type: "SET_SAVED"; time: string }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "TOGGLE_PREVIEW" };

function createCharacterRow(): CharacterRow {
  return {
    tempId: crypto.randomUUID(),
    character_name: "",
    archetype: "Hero",
    mbti_function: "",
    notes: "",
    sort_order: 0,
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "ADD_CHARACTER":
      return {
        ...state,
        characters: [...state.characters, createCharacterRow()],
      };
    case "REMOVE_CHARACTER":
      return {
        ...state,
        characters: state.characters.filter((c) => c.tempId !== action.tempId),
      };
    case "UPDATE_CHARACTER":
      return {
        ...state,
        characters: state.characters.map((c) =>
          c.tempId === action.tempId ? { ...c, [action.field]: action.value } : c
        ),
      };
    case "SET_SAVING":
      return { ...state, saving: action.saving };
    case "SET_SAVED":
      return { ...state, saving: false, lastSaved: action.time, error: null };
    case "SET_ERROR":
      return { ...state, saving: false, error: action.error };
    case "TOGGLE_PREVIEW":
      return { ...state, showPreview: !state.showPreview };
    default:
      return state;
  }
}

function initState(analysis?: AnalysisEntryWithCharacters): State {
  if (analysis) {
    return {
      title: analysis.title,
      work_name: analysis.work_name,
      work_type: analysis.work_type,
      author_director: analysis.author_director,
      cover_image_url: analysis.cover_image_url,
      thesis: analysis.thesis,
      characters: analysis.characters.map((c) => ({
        tempId: crypto.randomUUID(),
        character_name: c.character_name,
        archetype: c.archetype,
        mbti_function: c.mbti_function,
        notes: c.notes,
        sort_order: c.sort_order,
      })),
      conflict_internal: analysis.conflict_internal,
      conflict_external: analysis.conflict_external,
      shadow: analysis.shadow,
      projection: analysis.projection,
      development_start: analysis.development_start,
      development_crisis: analysis.development_crisis,
      development_end: analysis.development_end,
      reflection_scenario: analysis.reflection_scenario,
      reflection_insight: analysis.reflection_insight,
      closing: analysis.closing,
      saving: false,
      lastSaved: null,
      error: null,
      showPreview: false,
    };
  }

  return {
    title: "",
    work_name: "",
    work_type: "movie",
    author_director: "",
    cover_image_url: "",
    thesis: "",
    characters: [createCharacterRow()],
    conflict_internal: "",
    conflict_external: "",
    shadow: "",
    projection: "",
    development_start: "",
    development_crisis: "",
    development_end: "",
    reflection_scenario: "",
    reflection_insight: "",
    closing: "",
    saving: false,
    lastSaved: null,
    error: null,
    showPreview: false,
  };
}

interface Props {
  analysis?: AnalysisEntryWithCharacters;
}

export function AnalysisForm({ analysis }: Props) {
  const router = useRouter();
  const { addToast } = useToast();
  const [state, dispatch] = useReducer(reducer, analysis, initState);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isEditing = !!analysis;
  const analysisId = analysis?.id;

  const formData = useMemo(
    () => ({
      title: state.title,
      work_name: state.work_name,
      work_type: state.work_type,
      author_director: state.author_director,
      cover_image_url: state.cover_image_url,
      thesis: state.thesis,
      conflict_internal: state.conflict_internal,
      conflict_external: state.conflict_external,
      shadow: state.shadow,
      projection: state.projection,
      development_start: state.development_start,
      development_crisis: state.development_crisis,
      development_end: state.development_end,
      reflection_scenario: state.reflection_scenario,
      reflection_insight: state.reflection_insight,
      closing: state.closing,
      characters: state.characters.map((c, i) => ({
        character_name: c.character_name,
        archetype: c.archetype,
        mbti_function: c.mbti_function,
        notes: c.notes,
        sort_order: i,
      })),
    }),
    [state]
  );

  const markdown = useMemo(() => generateAnalysisMarkdown(formData), [formData]);

  const triggerAutoSave = useCallback(() => {
    if (!isEditing || !analysisId) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      dispatch({ type: "SET_SAVING", saving: true });
      const result = await autoSaveAnalysis(analysisId, formData);
      if (result.success) {
        dispatch({
          type: "SET_SAVED",
          time: new Date().toLocaleTimeString(),
        });
      } else {
        dispatch({ type: "SET_ERROR", error: result.error ?? "保存失败" });
      }
    }, 2000);
  }, [isEditing, analysisId, formData]);

  useEffect(() => {
    triggerAutoSave();
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [formData, triggerAutoSave]);

  async function handleSave() {
    dispatch({ type: "SET_SAVING", saving: true });

    const result = isEditing
      ? await updateAnalysis(analysisId!, formData)
      : await createAnalysis(formData);

    if (result.success) {
      addToast({ message: "保存成功", variant: "success" });
      if (!isEditing && "analysisId" in result && result.analysisId) {
        router.push(`/admin/analysis/${result.analysisId}/edit`);
      } else {
        dispatch({
          type: "SET_SAVED",
          time: new Date().toLocaleTimeString(),
        });
      }
    } else {
      dispatch({ type: "SET_ERROR", error: result.error ?? "保存失败" });
      addToast({ message: result.error ?? "保存失败", variant: "error" });
    }
  }

  async function handleCopyMarkdown() {
    await navigator.clipboard.writeText(markdown);
    addToast({ message: "Markdown 已复制到剪贴板", variant: "success" });
  }

  function setField(field: string, value: string) {
    dispatch({ type: "SET_FIELD", field, value });
  }

  return (
    <div className="flex gap-6">
      <div className={`flex-1 space-y-8 ${state.showPreview ? "max-w-[50%]" : ""}`}>
        {/* Header bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {state.saving && (
              <span className="text-xs text-text-tertiary">保存中...</span>
            )}
            {state.lastSaved && !state.saving && (
              <span className="text-xs text-text-tertiary">
                已保存于 {state.lastSaved}
              </span>
            )}
            {state.error && (
              <span className="text-xs text-danger">{state.error}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch({ type: "TOGGLE_PREVIEW" })}
            >
              {state.showPreview ? (
                <EyeOff className="h-4 w-4 mr-1.5" />
              ) : (
                <Eye className="h-4 w-4 mr-1.5" />
              )}
              预览
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCopyMarkdown}>
              <Copy className="h-4 w-4 mr-1.5" />
              复制 MD
            </Button>
            <Button size="sm" onClick={handleSave} loading={state.saving}>
              <Save className="h-4 w-4 mr-1.5" />
              保存
            </Button>
          </div>
        </div>

        {/* Section 1: Basic Info */}
        <section className="space-y-4">
          <SectionHeader color="bg-blue-500" title="基本信息" />
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-text-secondary mb-1.5">
                标题
              </label>
              <Input
                value={state.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="分析标题"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                作品名称
              </label>
              <Input
                value={state.work_name}
                onChange={(e) => setField("work_name", e.target.value)}
                placeholder="电影、书籍或剧集名称"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                作品类型
              </label>
              <Select
                value={state.work_type}
                onChange={(e) => setField("work_type", e.target.value)}
              >
                {WORK_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                作者 / 导演
              </label>
              <Input
                value={state.author_director}
                onChange={(e) => setField("author_director", e.target.value)}
                placeholder="可选"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                封面图片 URL
              </label>
              <Input
                value={state.cover_image_url}
                onChange={(e) => setField("cover_image_url", e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
        </section>

        {/* Section 2: Psychological Thesis */}
        <section className="space-y-4">
          <SectionHeader color="bg-yellow-500" title="心理学论点" />
          <Textarea
            value={state.thesis}
            onChange={(e) => setField("thesis", e.target.value)}
            placeholder="用一句话概括这部作品的心理学核心论点..."
            rows={3}
          />
        </section>

        {/* Section 3: Character Mapping */}
        <section className="space-y-4">
          <SectionHeader color="bg-green-500" title="角色映射" />
          <div className="space-y-3">
            {state.characters.map((char) => (
              <div
                key={char.tempId}
                className="grid grid-cols-[1fr_140px_100px_1fr_36px] gap-2 items-start"
              >
                <Input
                  value={char.character_name}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_CHARACTER",
                      tempId: char.tempId,
                      field: "character_name",
                      value: e.target.value,
                    })
                  }
                  placeholder="角色名"
                />
                <Select
                  value={char.archetype}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_CHARACTER",
                      tempId: char.tempId,
                      field: "archetype",
                      value: e.target.value,
                    })
                  }
                >
                  {ARCHETYPES.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </Select>
                <Select
                  value={char.mbti_function}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_CHARACTER",
                      tempId: char.tempId,
                      field: "mbti_function",
                      value: e.target.value,
                    })
                  }
                >
                  {MBTI_FUNCTIONS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </Select>
                <Input
                  value={char.notes}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_CHARACTER",
                      tempId: char.tempId,
                      field: "notes",
                      value: e.target.value,
                    })
                  }
                  placeholder="备注"
                />
                <button
                  type="button"
                  onClick={() =>
                    dispatch({ type: "REMOVE_CHARACTER", tempId: char.tempId })
                  }
                  className="flex items-center justify-center h-9 w-9 rounded-[var(--radius-md)] text-text-tertiary hover:text-danger hover:bg-surface transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch({ type: "ADD_CHARACTER" })}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            添加角色
          </Button>
        </section>

        {/* Section 4: Core Conflict */}
        <section className="space-y-4">
          <SectionHeader color="bg-red-500" title="核心冲突" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                内在冲突
              </label>
              <Textarea
                value={state.conflict_internal}
                onChange={(e) => setField("conflict_internal", e.target.value)}
                placeholder="内心的心理张力..."
                rows={4}
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                外在冲突
              </label>
              <Textarea
                value={state.conflict_external}
                onChange={(e) => setField("conflict_external", e.target.value)}
                placeholder="叙事中的外部冲突..."
                rows={4}
              />
            </div>
          </div>
        </section>

        {/* Section 5: Shadow & Projection */}
        <section className="space-y-4">
          <SectionHeader color="bg-purple-500" title="阴影与投射" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                阴影表现
              </label>
              <Textarea
                value={state.shadow}
                onChange={(e) => setField("shadow", e.target.value)}
                placeholder="阴影如何显现..."
                rows={4}
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                投射描述
              </label>
              <Textarea
                value={state.projection}
                onChange={(e) => setField("projection", e.target.value)}
                placeholder="什么被投射到他人身上..."
                rows={4}
              />
            </div>
          </div>
        </section>

        {/* Section 6: Development Arc */}
        <section className="space-y-4">
          <SectionHeader color="bg-amber-700" title="发展弧线" />
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                起始状态
              </label>
              <Textarea
                value={state.development_start}
                onChange={(e) => setField("development_start", e.target.value)}
                placeholder="角色心理的起点..."
                rows={3}
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                危机 / 转折点
              </label>
              <Textarea
                value={state.development_crisis}
                onChange={(e) => setField("development_crisis", e.target.value)}
                placeholder="对峰的时刻..."
                rows={3}
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                最终整合
              </label>
              <Textarea
                value={state.development_end}
                onChange={(e) => setField("development_end", e.target.value)}
                placeholder="解决与心理整合..."
                rows={3}
              />
            </div>
          </div>
        </section>

        {/* Section 7: Real-life Reflection */}
        <section className="space-y-4">
          <SectionHeader color="bg-orange-500" title="现实映射" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                现实场景
              </label>
              <Textarea
                value={state.reflection_scenario}
                onChange={(e) =>
                  setField("reflection_scenario", e.target.value)
                }
                placeholder="一个可关联的现实情境..."
                rows={4}
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                洞察
              </label>
              <Textarea
                value={state.reflection_insight}
                onChange={(e) => setField("reflection_insight", e.target.value)}
                placeholder="心理学层面的启发..."
                rows={4}
              />
            </div>
          </div>
        </section>

        {/* Section 8: Closing Line */}
        <section className="space-y-4">
          <SectionHeader color="bg-neutral-600" title="结束语" />
          <Textarea
            value={state.closing}
            onChange={(e) => setField("closing", e.target.value)}
            placeholder="最后的思考或引用..."
            rows={3}
          />
        </section>
      </div>

      {/* Preview panel */}
      {state.showPreview && (
        <div className="flex-1 max-w-[50%] border border-border rounded-[var(--radius-lg)] bg-surface/30 p-6 overflow-y-auto max-h-[calc(100vh-8rem)] sticky top-8">
          <MarkdownPreview content={markdown} />
        </div>
      )}
    </div>
  );
}

function SectionHeader({ color, title }: { color: string; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <h3 className="text-sm font-medium text-text-primary">{title}</h3>
    </div>
  );
}

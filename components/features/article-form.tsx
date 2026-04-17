"use client";

import { useReducer, useCallback, useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Save, Send, Copy, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagPicker } from "@/components/features/tag-picker";
import { CategoryPicker } from "@/components/features/category-picker";
import { MediaPicker } from "@/components/features/media-picker";
import { TiptapEditor, type TiptapEditorHandle } from "@/components/features/tiptap-editor";
import {
  createArticle,
  updateArticle,
  autoSaveArticle,
  publishArticle,
  unpublishArticle,
} from "@/lib/actions/articles";
import { EMPTY_LANG } from "@/lib/types";
import type {
  ArticleWithTags,
  ArticleLang,
  ContentLocale,
  ArticleFormData,
  Tag,
  ArticleMeta,
} from "@/lib/types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

interface State {
  en: ArticleLang;
  zh: ArticleLang;
  activeLocale: ContentLocale;
  tagIds: string[];
  categoryId: string | null;
  coverImage: string;
  status: "draft" | "published" | "archived";
  saving: boolean;
  lastSaved: string | null;
  error: string | null;
  mediaPickerOpen: boolean;
}

type Action =
  | { type: "SET_LANG_FIELD"; locale: ContentLocale; field: keyof ArticleLang; value: unknown }
  | { type: "SET_META_FIELD"; locale: ContentLocale; field: keyof ArticleMeta; value: unknown }
  | { type: "SET_ACTIVE_LOCALE"; locale: ContentLocale }
  | { type: "SET_TAGS"; ids: string[] }
  | { type: "SET_CATEGORY"; id: string | null }
  | { type: "SET_COVER"; url: string }
  | { type: "SET_SLUG"; value: string }
  | { type: "DUPLICATE_EN_TO_ZH" }
  | { type: "SET_SAVING"; saving: boolean }
  | { type: "SET_SAVED"; time: string }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_CONTENT"; locale: ContentLocale; content: string }
  | { type: "SET_MEDIA_PICKER"; open: boolean };

function isCompleted(lang: ArticleLang, locale: ContentLocale): boolean {
  if (locale === "en") return !!(lang.title && lang.slug && lang.content && lang.excerpt);
  return !!(lang.title && lang.content && lang.excerpt);
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_LANG_FIELD": {
      const lang = { ...state[action.locale], [action.field]: action.value };
      lang.completed = isCompleted(lang, action.locale);
      return { ...state, [action.locale]: lang };
    }
    case "SET_META_FIELD": {
      const lang = {
        ...state[action.locale],
        meta: { ...state[action.locale].meta, [action.field]: action.value },
      };
      return { ...state, [action.locale]: lang };
    }
    case "SET_ACTIVE_LOCALE":
      return { ...state, activeLocale: action.locale };
    case "SET_TAGS":
      return { ...state, tagIds: action.ids };
    case "SET_CATEGORY":
      return { ...state, categoryId: action.id };
    case "SET_COVER":
      return { ...state, coverImage: action.url };
    case "SET_MEDIA_PICKER":
      return { ...state, mediaPickerOpen: action.open };
    case "SET_SLUG": {
      const en = { ...state.en, slug: action.value };
      const zh = { ...state.zh, slug: action.value };
      en.completed = isCompleted(en, "en");
      zh.completed = isCompleted(zh, "zh");
      return { ...state, en, zh };
    }
    case "DUPLICATE_EN_TO_ZH": {
      const zh: ArticleLang = {
        ...state.en,
        slug: state.en.slug,
        meta: { ...state.en.meta },
        completed: false,
      };
      zh.completed = isCompleted(zh, "zh");
      return { ...state, zh, activeLocale: "zh" };
    }
    case "SET_SAVING":
      return { ...state, saving: action.saving };
    case "SET_SAVED":
      return { ...state, saving: false, lastSaved: action.time };
    case "SET_ERROR":
      return { ...state, error: action.error, saving: false };
    case "SET_CONTENT": {
      const lang = { ...state[action.locale], content: action.content };
      lang.completed = isCompleted(lang, action.locale);
      return { ...state, [action.locale]: lang };
    }
    default:
      return state;
  }
}

interface ArticleFormProps {
  article?: ArticleWithTags;
  tags: Tag[];
}

export function ArticleForm({ article, tags }: ArticleFormProps) {
  const router = useRouter();
  const isEditing = !!article;
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slugEdited = useRef(false);
  const editorRef = useRef<TiptapEditorHandle>(null);
  const [editorMediaPickerOpen, setEditorMediaPickerOpen] = useState(false);

  const [state, dispatch] = useReducer(reducer, {
    en: article?.en ?? { ...EMPTY_LANG },
    zh: article?.zh ?? { ...EMPTY_LANG },
    activeLocale: "en",
    tagIds: article?.tags?.map((t) => t.id) ?? [],
    categoryId: article?.category_id ?? null,
    coverImage: article?.cover_image ?? "",
    status: article?.status ?? "draft",
    saving: false,
    lastSaved: null,
    error: null,
    mediaPickerOpen: false,
  });

  const activeLang = state[state.activeLocale];
  const canPublish = state.en.completed && state.zh.completed;

  useEffect(() => {
    if (!isEditing || !article) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

    autoSaveTimer.current = setTimeout(async () => {
      dispatch({ type: "SET_SAVING", saving: true });
      const result = await autoSaveArticle(article.id, {
        en: state.en,
        zh: state.zh,
        tag_ids: state.tagIds,
        category_id: state.categoryId,
        cover_image: state.coverImage || null,
        status: state.status,
      });
      if (result.success) {
        dispatch({ type: "SET_SAVED", time: new Date().toLocaleTimeString() });
      }
    }, 2000);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [state.en, state.zh, state.tagIds, state.categoryId, state.coverImage]);

  const handleTitleChange = useCallback(
    (value: string) => {
      dispatch({ type: "SET_LANG_FIELD", locale: state.activeLocale, field: "title", value });
      if (state.activeLocale === "en" && !slugEdited.current) {
        dispatch({ type: "SET_SLUG", value: slugify(value) });
      }
    },
    [state.activeLocale],
  );

  const handleContentChange = useCallback(
    (json: string) => {
      dispatch({ type: "SET_CONTENT", locale: state.activeLocale, content: json });
    },
    [state.activeLocale],
  );

  async function handleSaveDraft() {
    dispatch({ type: "SET_SAVING", saving: true });
    const data: ArticleFormData = {
      en: state.en,
      zh: state.zh,
      tag_ids: state.tagIds,
      category_id: state.categoryId,
      cover_image: state.coverImage || null,
      status: "draft",
    };

    if (isEditing) {
      const result = await updateArticle(article!.id, data);
      if (!result.success) dispatch({ type: "SET_ERROR", error: result.error ?? "Save failed" });
    } else {
      const result = await createArticle(data);
      if (!result.success) dispatch({ type: "SET_ERROR", error: result.error ?? "Create failed" });
    }
  }

  async function handlePublish() {
    if (!canPublish) return;
    dispatch({ type: "SET_SAVING", saving: true });

    if (isEditing) {
      const data: ArticleFormData = {
        en: state.en,
        zh: state.zh,
        tag_ids: state.tagIds,
        category_id: state.categoryId,
        cover_image: state.coverImage || null,
        status: "published",
      };
      const saveResult = await updateArticle(article!.id, data);
      if (!saveResult.success) {
        dispatch({ type: "SET_ERROR", error: saveResult.error ?? "Save failed" });
        return;
      }
    } else {
      const data: ArticleFormData = {
        en: state.en,
        zh: state.zh,
        tag_ids: state.tagIds,
        category_id: state.categoryId,
        cover_image: state.coverImage || null,
        status: "published",
      };
      const result = await createArticle(data);
      if (!result.success) {
        dispatch({ type: "SET_ERROR", error: result.error ?? "Create failed" });
      }
    }
  }

  async function handleUnpublish() {
    if (!isEditing) return;
    dispatch({ type: "SET_SAVING", saving: true });
    const result = await unpublishArticle(article!.id);
    if (result.success) {
      router.refresh();
    } else {
      dispatch({ type: "SET_ERROR", error: result.error ?? "Failed" });
    }
  }

  function completionDot(lang: ArticleLang) {
    if (lang.completed) return "bg-emerald-400";
    if (lang.title || lang.content) return "bg-amber-400";
    return "bg-text-quaternary";
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {isEditing ? "Edit Article" : "New Article"}
        </h1>
        <div className="flex items-center gap-2 text-xs text-text-tertiary">
          {state.saving && <span>Saving...</span>}
          {state.lastSaved && !state.saving && <span>Saved {state.lastSaved}</span>}
        </div>
      </div>

      {state.error && (
        <div className="mb-4 rounded-md bg-red-500/10 border border-red-500/30 px-4 py-2 text-sm text-red-400">
          {state.error}
        </div>
      )}

      {/* Language tabs */}
      <div className="flex items-center gap-1 mb-6">
        {(["en", "zh"] as ContentLocale[]).map((loc) => (
          <button
            key={loc}
            type="button"
            onClick={() => dispatch({ type: "SET_ACTIVE_LOCALE", locale: loc })}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-[var(--radius-md)] text-sm font-medium transition-colors border-b-2 ${
              state.activeLocale === loc
                ? "border-accent-warm text-text-primary bg-surface"
                : "border-transparent text-text-tertiary hover:text-text-primary"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${completionDot(state[loc])}`} />
            {loc === "en" ? "English" : "中文"}
          </button>
        ))}
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch({ type: "DUPLICATE_EN_TO_ZH" })}
          disabled={!state.en.title}
          title="Copy English content to Chinese for translation"
        >
          <Copy className="h-3.5 w-3.5 mr-1.5" />
          EN → 中文
        </Button>
      </div>

      {/* Per-language fields */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-text-tertiary mb-1.5">Title</label>
          <Input
            value={activeLang.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder={state.activeLocale === "en" ? "Article title" : "文章标题"}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-tertiary mb-1.5">Subtitle</label>
          <Input
            value={activeLang.subtitle}
            onChange={(e) =>
              dispatch({
                type: "SET_LANG_FIELD",
                locale: state.activeLocale,
                field: "subtitle",
                value: e.target.value,
              })
            }
            placeholder={state.activeLocale === "en" ? "Optional subtitle" : "可选副标题"}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-tertiary mb-1.5">URL Slug</label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-quaternary shrink-0">/{state.activeLocale}/</span>
            <Input
              value={state.en.slug}
              onChange={(e) => {
                slugEdited.current = true;
                dispatch({ type: "SET_SLUG", value: e.target.value });
              }}
              placeholder="url-friendly-slug"
              className="font-mono text-sm"
            />
          </div>
          <p className="text-xs text-text-quaternary mt-1">
            Auto-generated from English title. Same URL for both languages.
          </p>
        </div>
      </div>

      {/* TipTap Editor */}
      <div className="mb-6">
        <label className="block text-xs font-medium text-text-tertiary mb-1.5">Content</label>
        <TiptapEditor
          ref={editorRef}
          key={state.activeLocale}
          content={activeLang.content}
          onChange={handleContentChange}
          placeholder={
            state.activeLocale === "en" ? "Start writing..." : "开始写作..."
          }
          onImageRequest={() => setEditorMediaPickerOpen(true)}
        />
        <MediaPicker
          isOpen={editorMediaPickerOpen}
          onClose={() => setEditorMediaPickerOpen(false)}
          onSelect={(media) => {
            editorRef.current?.insertImage(media.url, media.alt_text);
          }}
        />
      </div>

      {/* Excerpt */}
      <div className="mb-6">
        <label className="block text-xs font-medium text-text-tertiary mb-1.5">Excerpt</label>
        <Textarea
          value={activeLang.excerpt}
          onChange={(e) =>
            dispatch({
              type: "SET_LANG_FIELD",
              locale: state.activeLocale,
              field: "excerpt",
              value: e.target.value,
            })
          }
          placeholder={
            state.activeLocale === "en"
              ? "Brief summary of the article..."
              : "文章简要概述..."
          }
          rows={3}
        />
      </div>

      {/* SEO Meta Section */}
      <details className="mb-6 border border-border rounded-[var(--radius-md)] overflow-hidden">
        <summary className="px-4 py-3 text-sm font-medium text-text-secondary cursor-pointer hover:bg-surface/50 transition-colors">
          SEO Metadata ({state.activeLocale === "en" ? "English" : "中文"})
        </summary>
        <div className="px-4 py-4 space-y-3 border-t border-border">
          <div>
            <label className="block text-xs font-medium text-text-tertiary mb-1">
              Meta Title
              <span className={`ml-2 ${
                (activeLang.meta.meta_title.length >= 50 && activeLang.meta.meta_title.length <= 70)
                  ? "text-emerald-400" : activeLang.meta.meta_title.length > 0 ? "text-amber-400" : ""
              }`}>
                {activeLang.meta.meta_title.length}/70
              </span>
            </label>
            <Input
              value={activeLang.meta.meta_title}
              onChange={(e) =>
                dispatch({
                  type: "SET_META_FIELD",
                  locale: state.activeLocale,
                  field: "meta_title",
                  value: e.target.value,
                })
              }
              placeholder="Custom title for search engines"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-tertiary mb-1">
              Meta Description
              <span className={`ml-2 ${
                (activeLang.meta.meta_description.length >= 120 && activeLang.meta.meta_description.length <= 160)
                  ? "text-emerald-400" : activeLang.meta.meta_description.length > 0 ? "text-amber-400" : ""
              }`}>
                {activeLang.meta.meta_description.length}/160
              </span>
            </label>
            <Textarea
              value={activeLang.meta.meta_description}
              onChange={(e) =>
                dispatch({
                  type: "SET_META_FIELD",
                  locale: state.activeLocale,
                  field: "meta_description",
                  value: e.target.value,
                })
              }
              placeholder="Description for search results"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-tertiary mb-1">
              Keywords (comma-separated)
            </label>
            <Input
              value={(activeLang.meta.keywords ?? []).join(", ")}
              onChange={(e) =>
                dispatch({
                  type: "SET_META_FIELD",
                  locale: state.activeLocale,
                  field: "keywords",
                  value: e.target.value
                    .split(",")
                    .map((k) => k.trim())
                    .filter(Boolean),
                })
              }
              placeholder="keyword1, keyword2"
            />
          </div>
        </div>
      </details>

      {/* Shared fields */}
      <div className="space-y-4 mb-6 border-t border-border pt-6">
        <div>
          <label className="block text-xs font-medium text-text-tertiary mb-1.5">Tags</label>
          <TagPicker
            allTags={tags}
            selectedIds={state.tagIds}
            onChange={(ids) => dispatch({ type: "SET_TAGS", ids })}
          />
        </div>

        <CategoryPicker
          value={state.categoryId}
          onChange={(id) => dispatch({ type: "SET_CATEGORY", id })}
        />

        <div>
          <label className="block text-xs font-medium text-text-tertiary mb-1.5">
            Cover Image
          </label>
          {state.coverImage ? (
            <div className="relative inline-block">
              <Image
                src={state.coverImage}
                alt="Cover preview"
                width={400}
                height={200}
                className="rounded-[var(--radius-md)] max-h-48 w-auto object-cover border border-border"
              />
              <button
                type="button"
                onClick={() => dispatch({ type: "SET_COVER", url: "" })}
                className="absolute -right-2 -top-2 rounded-full bg-bg-primary border border-border p-1 text-text-tertiary hover:text-text-primary transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => dispatch({ type: "SET_MEDIA_PICKER", open: true })}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              Choose image
            </Button>
          )}
          <MediaPicker
            isOpen={state.mediaPickerOpen}
            onClose={() => dispatch({ type: "SET_MEDIA_PICKER", open: false })}
            onSelect={(media) => dispatch({ type: "SET_COVER", url: media.url })}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 border-t border-border pt-6">
        <Button onClick={handleSaveDraft} disabled={state.saving} variant="outline">
          <Save className="h-4 w-4 mr-1.5" />
          Save Draft
        </Button>
        {isEditing && state.status === "published" && (
          <Button onClick={handleUnpublish} disabled={state.saving} variant="outline">
            Unpublish
          </Button>
        )}
        <div className="flex-1" />
        {!canPublish && (
          <span className="text-xs text-text-quaternary">
            Complete both EN and 中文 to publish
          </span>
        )}
        <Button onClick={handlePublish} disabled={!canPublish || state.saving}>
          <Send className="h-4 w-4 mr-1.5" />
          Publish
        </Button>
      </div>
    </div>
  );
}

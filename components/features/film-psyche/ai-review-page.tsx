"use client";

import { useState } from "react";
import { Loader2, ClipboardCopy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/use-toast";
import type { AiReview, ReviewType } from "@/lib/types/film-psyche";

interface Props {
  projectId: string;
  reviews: AiReview[];
  hasStory: boolean;
  characterCount: number;
  sceneCount: number;
}

const REVIEW_BUTTONS: {
  type: ReviewType;
  label: string;
  desc: string;
}[] = [
  {
    type: "evidence",
    label: "证据完整性审查",
    desc: "评估材料收集是否充分",
  },
  {
    type: "archetype",
    label: "原型判断审查",
    desc: "评估原型判断是否成熟",
  },
  {
    type: "function_attitude",
    label: "功能态度审查",
    desc: "评估 FA 判断证据强度",
  },
  {
    type: "blog_draft",
    label: "生成博客草稿",
    desc: "生成完整中文分析博客",
  },
];

export function AiReviewPage({
  projectId,
  reviews,
  hasStory,
  characterCount,
  sceneCount,
}: Props) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState<ReviewType | null>(null);
  const [streamContent, setStreamContent] = useState("");
  const [activeTab, setActiveTab] = useState<ReviewType | null>(null);
  const [copied, setCopied] = useState(false);

  const canGenerate = hasStory && characterCount >= 1 && sceneCount >= 1;

  async function generate(type: ReviewType) {
    if (!canGenerate) {
      addToast({
        variant: "error",
        message: "请先完成故事骨架、至少1个角色和1个场景",
      });
      return;
    }

    setLoading(type);
    setStreamContent("");
    setActiveTab(type);

    try {
      const res = await fetch(`/api/ai/film-psyche/${type.replace("_", "-")}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      if (!res.ok) {
        throw new Error("AI 生成失败");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("无法读取响应");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        setStreamContent(fullContent);
      }
    } catch (e) {
      addToast({
        variant: "error",
        message: e instanceof Error ? e.message : "生成失败",
      });
    } finally {
      setLoading(null);
    }
  }

  function copyContent() {
    const content =
      streamContent ||
      reviews.find((r) => r.review_type === activeTab)?.content ||
      "";
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const displayedReview = activeTab
    ? reviews.find((r) => r.review_type === activeTab)
    : null;
  const displayContent = streamContent || displayedReview?.content || "";

  return (
    <div className="space-y-6">
      {!canGenerate && (
        <div className="rounded-lg border border-warning/30 bg-warning/5 px-4 py-3">
          <p className="text-sm text-warning">
            请先完成：故事骨架、至少1个角色卡片、至少1个场景卡片
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {REVIEW_BUTTONS.map((btn) => (
          <button
            key={btn.type}
            onClick={() => generate(btn.type)}
            disabled={!canGenerate || loading !== null}
            className="flex flex-col items-start rounded-lg border border-border bg-surface/30 p-4 text-left transition-colors hover:border-accent-warm/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-sm font-medium text-text-primary">
              {btn.label}
            </span>
            <span className="text-xs text-text-tertiary mt-1">{btn.desc}</span>
            {loading === btn.type && (
              <Loader2 className="h-4 w-4 mt-2 animate-spin text-accent-warm" />
            )}
          </button>
        ))}
      </div>

      {reviews.length > 0 && (
        <div className="flex gap-1.5 border-b border-border pb-0">
          {reviews
            .reduce<AiReview[]>((acc, r) => {
              if (!acc.find((a) => a.review_type === r.review_type)) {
                acc.push(r);
              }
              return acc;
            }, [])
            .map((r) => (
              <button
                key={r.review_type}
                onClick={() => {
                  setActiveTab(r.review_type);
                  setStreamContent("");
                }}
                className={`rounded-t-md px-3 py-1.5 text-xs transition-colors ${
                  activeTab === r.review_type
                    ? "bg-surface text-text-primary border border-border border-b-transparent -mb-px"
                    : "text-text-tertiary hover:text-text-secondary"
                }`}
              >
                {REVIEW_BUTTONS.find((b) => b.type === r.review_type)?.label ??
                  r.review_type}
              </button>
            ))}
        </div>
      )}

      {displayContent && (
        <div className="relative rounded-lg border border-border bg-surface/20 p-6">
          <button
            onClick={copyContent}
            className="absolute top-3 right-3 rounded p-1.5 text-text-quaternary hover:text-text-secondary transition-colors"
            title="复制"
          >
            {copied ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <ClipboardCopy className="h-4 w-4" />
            )}
          </button>
          <div className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap text-sm text-text-secondary leading-relaxed">
            {displayContent}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check } from "lucide-react";

interface StepNavProps {
  projectId: string;
  completions?: {
    setup: boolean;
    story: boolean;
    characters: boolean;
    scenes: boolean;
  };
}

const steps = [
  { key: "setup", label: "基本信息", path: "setup" },
  { key: "story", label: "故事骨架", path: "story" },
  { key: "characters", label: "角色卡片", path: "characters" },
  { key: "scenes", label: "场景卡片", path: "scenes" },
  { key: "review", label: "AI 审查", path: "review" },
] as const;

export function StepNav({ projectId, completions }: StepNavProps) {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex items-center gap-1 rounded-lg border border-border bg-surface/30 p-1">
      {steps.map((step, i) => {
        const href = `/admin/film-psyche/${projectId}/${step.path}`;
        const isActive = pathname.includes(`/${step.path}`);
        const isComplete =
          completions?.[step.key as keyof typeof completions] ?? false;

        return (
          <Link
            key={step.key}
            href={href}
            className={`relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
              isActive
                ? "bg-surface text-text-primary"
                : "text-text-tertiary hover:text-text-secondary"
            }`}
          >
            {isComplete && !isActive && (
              <Check className="h-3 w-3 text-success" />
            )}
            <span className="hidden sm:inline">{i + 1}.</span>
            {step.label}
          </Link>
        );
      })}
    </nav>
  );
}

import type { AnalysisFormData } from "@/lib/types";

const WORK_TYPE_LABELS: Record<string, string> = {
  movie: "电影",
  series: "剧集",
  book: "书籍",
  anime: "动画",
};

export function generateAnalysisMarkdown(data: AnalysisFormData): string {
  const lines: string[] = [];

  lines.push(`# ${data.title || "未命名分析"}`);
  lines.push("");

  const meta: string[] = [];
  if (data.work_name)
    meta.push(`**作品：** ${data.work_name}（${WORK_TYPE_LABELS[data.work_type] || data.work_type}）`);
  if (data.author_director) meta.push(`**作者/导演：** ${data.author_director}`);
  if (meta.length > 0) {
    lines.push(meta.join("  \n"));
    lines.push("");
  }

  if (data.thesis) {
    lines.push("## 心理学论点");
    lines.push("");
    lines.push(data.thesis);
    lines.push("");
  }

  const filledCharacters = data.characters.filter((c) => c.character_name);
  if (filledCharacters.length > 0) {
    lines.push("## 角色映射");
    lines.push("");
    lines.push("| 角色 | 原型 | 认知功能 | 备注 |");
    lines.push("|------|------|----------|------|");
    for (const c of filledCharacters) {
      lines.push(
        `| ${c.character_name} | ${c.archetype} | ${c.mbti_function || "—"} | ${c.notes || "—"} |`
      );
    }
    lines.push("");
  }

  if (data.conflict_internal || data.conflict_external) {
    lines.push("## 核心冲突");
    lines.push("");
    if (data.conflict_internal) {
      lines.push("### 内在冲突");
      lines.push("");
      lines.push(data.conflict_internal);
      lines.push("");
    }
    if (data.conflict_external) {
      lines.push("### 外在冲突");
      lines.push("");
      lines.push(data.conflict_external);
      lines.push("");
    }
  }

  if (data.shadow || data.projection) {
    lines.push("## 阴影与投射");
    lines.push("");
    if (data.shadow) {
      lines.push("### 阴影");
      lines.push("");
      lines.push(data.shadow);
      lines.push("");
    }
    if (data.projection) {
      lines.push("### 投射");
      lines.push("");
      lines.push(data.projection);
      lines.push("");
    }
  }

  if (data.development_start || data.development_crisis || data.development_end) {
    lines.push("## 发展弧线");
    lines.push("");
    if (data.development_start) {
      lines.push("### 起始状态");
      lines.push("");
      lines.push(data.development_start);
      lines.push("");
    }
    if (data.development_crisis) {
      lines.push("### 危机与转折");
      lines.push("");
      lines.push(data.development_crisis);
      lines.push("");
    }
    if (data.development_end) {
      lines.push("### 整合");
      lines.push("");
      lines.push(data.development_end);
      lines.push("");
    }
  }

  if (data.reflection_scenario || data.reflection_insight) {
    lines.push("## 现实映射");
    lines.push("");
    if (data.reflection_scenario) {
      lines.push("### 现实场景");
      lines.push("");
      lines.push(data.reflection_scenario);
      lines.push("");
    }
    if (data.reflection_insight) {
      lines.push("### 洞察");
      lines.push("");
      lines.push(data.reflection_insight);
      lines.push("");
    }
  }

  if (data.closing) {
    lines.push("## 结语");
    lines.push("");
    lines.push(data.closing);
    lines.push("");
  }

  return lines.join("\n");
}

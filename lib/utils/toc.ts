export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function extractToc(content: string): TocItem[] {
  try {
    const parsed = JSON.parse(content);
    if (parsed?.type === "doc") {
      return extractFromTiptap(parsed);
    }
  } catch {
    return extractFromMarkdown(content);
  }
  return [];
}

function extractFromTiptap(node: Record<string, unknown>): TocItem[] {
  const items: TocItem[] = [];
  const children = (node.content as Record<string, unknown>[]) ?? [];

  for (const child of children) {
    if (child.type === "heading") {
      const level = (child.attrs as Record<string, unknown>)?.level as number;
      const text = extractText(child);
      if (text) {
        items.push({
          id: slugify(text),
          text,
          level,
        });
      }
    }
  }

  return items;
}

function extractFromMarkdown(content: string): TocItem[] {
  const items: TocItem[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const match = line.match(/^(#{1,4})\s+(.+)$/);
    if (match) {
      const text = match[2].replace(/[*_`\[\]]/g, "").trim();
      items.push({
        id: slugify(text),
        text,
        level: match[1].length,
      });
    }
  }

  return items;
}

function extractText(node: Record<string, unknown>): string {
  if (node.type === "text") return (node.text as string) ?? "";
  const children = (node.content as Record<string, unknown>[]) ?? [];
  return children.map(extractText).join("");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

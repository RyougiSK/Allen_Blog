export function calculateReadingTime(content: string): number {
  let text = content;

  try {
    const parsed = JSON.parse(content);
    if (parsed?.type === "doc") {
      text = extractTextFromTiptap(parsed);
    }
  } catch {
    text = content.replace(/<[^>]*>/g, "").replace(/[#*`>\-\[\]!()]/g, "");
  }

  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function extractTextFromTiptap(node: Record<string, unknown>): string {
  if (node.type === "text") return (node.text as string) ?? "";
  const children = (node.content as Record<string, unknown>[]) ?? [];
  return children.map(extractTextFromTiptap).join(" ");
}

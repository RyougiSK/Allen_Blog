"use client";

import { isTiptapJson, tiptapJsonToHtml } from "@/lib/tiptap/generate-html";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";

interface TiptapRendererProps {
  content: string;
}

export function TiptapRenderer({ content }: TiptapRendererProps) {
  if (isTiptapJson(content)) {
    const html = tiptapJsonToHtml(content);
    return (
      <div
        className="prose-editorial prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <div className="prose-editorial prose prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeSlug]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

"use client";

import { useRef, useCallback } from "react";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  FileCode,
  List,
  ListOrdered,
  Quote,
  Minus,
} from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

interface ToolbarAction {
  icon: React.ElementType;
  label: string;
  before: string;
  after: string;
  block?: boolean;
}

const toolbarActions: ToolbarAction[] = [
  { icon: Bold, label: "Bold", before: "**", after: "**" },
  { icon: Italic, label: "Italic", before: "*", after: "*" },
  { icon: Heading1, label: "Heading 1", before: "# ", after: "", block: true },
  { icon: Heading2, label: "Heading 2", before: "## ", after: "", block: true },
  { icon: Heading3, label: "Heading 3", before: "### ", after: "", block: true },
  { icon: LinkIcon, label: "Link", before: "[", after: "](url)" },
  { icon: ImageIcon, label: "Image", before: "![alt](", after: ")" },
  { icon: Code, label: "Inline Code", before: "`", after: "`" },
  { icon: FileCode, label: "Code Block", before: "```\n", after: "\n```" },
  { icon: List, label: "Bullet List", before: "- ", after: "", block: true },
  { icon: ListOrdered, label: "Numbered List", before: "1. ", after: "", block: true },
  { icon: Quote, label: "Quote", before: "> ", after: "", block: true },
  { icon: Minus, label: "Horizontal Rule", before: "\n---\n", after: "" },
];

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = useCallback(
    (action: ToolbarAction) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = value.slice(start, end);

      let newText: string;
      let cursorPos: number;

      if (action.block) {
        // For block-level items, insert at line start
        const lineStart = value.lastIndexOf("\n", start - 1) + 1;
        const before = value.slice(0, lineStart);
        const after = value.slice(lineStart);
        newText = before + action.before + after;
        cursorPos = lineStart + action.before.length + (end - lineStart);
      } else {
        const insertion = action.before + (selected || action.label) + action.after;
        newText = value.slice(0, start) + insertion + value.slice(end);
        cursorPos = start + action.before.length + (selected || action.label).length;
      }

      onChange(newText);

      // Restore focus and cursor
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(cursorPos, cursorPos);
      });
    },
    [value, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      if (e.key === "b") {
        e.preventDefault();
        insertMarkdown(toolbarActions[0]); // Bold
      } else if (e.key === "i") {
        e.preventDefault();
        insertMarkdown(toolbarActions[1]); // Italic
      } else if (e.key === "k") {
        e.preventDefault();
        insertMarkdown(toolbarActions[5]); // Link
      }
    },
    [insertMarkdown]
  );

  return (
    <div className="rounded-md border border-border overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-surface/50 px-2 py-1.5">
        {toolbarActions.map((action, i) => (
          <button
            key={action.label}
            type="button"
            title={action.label}
            onClick={() => insertMarkdown(action)}
            className={`inline-flex items-center justify-center rounded p-1.5 text-text-tertiary hover:text-text-primary hover:bg-surface transition-colors ${
              i === 2 || i === 5 || i === 7 || i === 9 || i === 12
                ? "ml-1.5 border-l border-border pl-2"
                : ""
            }`}
          >
            <action.icon className="h-4 w-4" />
          </button>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write your post in Markdown..."
        className="w-full min-h-[500px] resize-y bg-bg-primary px-4 py-3 text-sm font-mono text-text-primary placeholder:text-text-quaternary focus:outline-none"
        spellCheck
      />
    </div>
  );
}

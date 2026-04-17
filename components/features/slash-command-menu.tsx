"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Minus,
  Code,
  ImageIcon,
} from "lucide-react";
import type { Editor } from "@tiptap/react";

interface SlashCommandMenuProps {
  editor: Editor;
  position: { top: number; left: number } | null;
  onClose: () => void;
}

const COMMANDS = [
  { label: "Heading 1", icon: Heading1, action: (e: Editor) => e.chain().focus().toggleHeading({ level: 1 }).run() },
  { label: "Heading 2", icon: Heading2, action: (e: Editor) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { label: "Heading 3", icon: Heading3, action: (e: Editor) => e.chain().focus().toggleHeading({ level: 3 }).run() },
  { label: "Heading 4", icon: Heading4, action: (e: Editor) => e.chain().focus().toggleHeading({ level: 4 }).run() },
  { label: "Bullet List", icon: List, action: (e: Editor) => e.chain().focus().toggleBulletList().run() },
  { label: "Numbered List", icon: ListOrdered, action: (e: Editor) => e.chain().focus().toggleOrderedList().run() },
  { label: "Quote", icon: Quote, action: (e: Editor) => e.chain().focus().toggleBlockquote().run() },
  { label: "Divider", icon: Minus, action: (e: Editor) => e.chain().focus().setHorizontalRule().run() },
  { label: "Code Block", icon: Code, action: (e: Editor) => e.chain().focus().toggleCodeBlock().run() },
  {
    label: "Image",
    icon: ImageIcon,
    action: (e: Editor) => {
      const url = window.prompt("Image URL");
      if (url) e.chain().focus().setImage({ src: url }).run();
    },
  },
];

export function SlashCommandMenu({ editor, position, onClose }: SlashCommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filter, setFilter] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const filtered = COMMANDS.filter((cmd) =>
    cmd.label.toLowerCase().includes(filter.toLowerCase()),
  );

  const executeCommand = useCallback(
    (index: number) => {
      const cmd = filtered[index];
      if (cmd) {
        cmd.action(editor);
        onClose();
      }
    },
    [filtered, editor, onClose],
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % filtered.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        executeCommand(selectedIndex);
      } else if (e.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [filtered.length, selectedIndex, executeCommand, onClose]);

  if (!position || filtered.length === 0) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-56 rounded-[var(--radius-md)] border border-border bg-surface p-1 shadow-[var(--shadow-lg)]"
      style={{ top: position.top, left: position.left }}
    >
      {filtered.map((cmd, index) => {
        const Icon = cmd.icon;
        return (
          <button
            key={cmd.label}
            type="button"
            className={`flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-left text-[length:var(--text-caption)] transition-colors duration-[var(--duration-fast)] ${
              index === selectedIndex
                ? "bg-surface-hover text-text-primary"
                : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            }`}
            onClick={() => executeCommand(index)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <Icon className="h-4 w-4 text-text-tertiary" />
            {cmd.label}
          </button>
        );
      })}
    </div>
  );
}

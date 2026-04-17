import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";

export function getExtensions(placeholder?: string) {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4] },
      horizontalRule: {},
      codeBlock: {},
      blockquote: {},
      bulletList: {},
      orderedList: {},
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        rel: "noopener noreferrer",
        class: "text-accent-warm",
      },
    }),
    Image.configure({
      HTMLAttributes: {
        class: "rounded-[var(--radius-md)] max-w-full",
      },
    }),
    Underline,
    Placeholder.configure({
      placeholder: placeholder ?? "Start writing...",
    }),
  ];
}

export const extensionNames = [
  "starterKit",
  "link",
  "image",
  "underline",
  "placeholder",
] as const;

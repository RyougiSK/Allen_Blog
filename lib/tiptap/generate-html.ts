import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import type { JSONContent } from "@tiptap/react";

const serverExtensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3, 4] },
  }),
  Link,
  Image,
  Underline,
];

export function tiptapJsonToHtml(json: string): string {
  try {
    const content = JSON.parse(json) as JSONContent;
    return generateHTML(content, serverExtensions);
  } catch {
    return "";
  }
}

export function isTiptapJson(content: string): boolean {
  try {
    const parsed = JSON.parse(content);
    return parsed?.type === "doc" && Array.isArray(parsed?.content);
  } catch {
    return false;
  }
}

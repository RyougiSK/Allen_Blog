"use client";

import { Mail, MessageCircle, Send } from "lucide-react";

type Platform = "twitter" | "facebook" | "linkedin" | "whatsapp" | "telegram" | "email";

interface ShareButtonItemProps {
  platform: Platform;
  url: string;
  title: string;
  description?: string;
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 1.09.044 1.613.115v3.146c-.427-.044-.72-.065-.995-.065-1.41 0-1.956.533-1.956 1.92v2.442h3.422l-.543 3.667h-2.879v7.98z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.335 18.339H15.67v-4.177c0-.996-.02-2.278-1.39-2.278-1.389 0-1.601 1.084-1.601 2.205v4.25h-2.666V9.75h2.56v1.17h.035c.358-.674 1.228-1.387 2.528-1.387 2.7 0 3.2 1.778 3.2 4.091v4.715zM7.003 8.575a1.546 1.546 0 01-1.548-1.549 1.548 1.548 0 111.547 1.549zm1.336 9.764H5.666V9.75H8.34v8.589zM19.67 3H4.329C3.593 3 3 3.58 3 4.297v15.406C3 20.42 3.594 21 4.328 21h15.338C20.4 21 21 20.42 21 19.703V4.297C21 3.58 20.4 3 19.666 3h.003z" />
    </svg>
  );
}

const platformConfig: Record<Platform, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  getUrl: (url: string, title: string, description?: string) => string;
}> = {
  twitter: {
    label: "X",
    icon: XIcon,
    getUrl: (url, title) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
  facebook: {
    label: "Facebook",
    icon: FacebookIcon,
    getUrl: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  linkedin: {
    label: "LinkedIn",
    icon: LinkedinIcon,
    getUrl: (url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  whatsapp: {
    label: "WhatsApp",
    icon: MessageCircle,
    getUrl: (url, title) =>
      `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`,
  },
  telegram: {
    label: "Telegram",
    icon: Send,
    getUrl: (url, title) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  email: {
    label: "Email",
    icon: Mail,
    getUrl: (url, title, description) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent((description ? description + "\n\n" : "") + url)}`,
  },
};

export function ShareButtonItem({ platform, url, title, description }: ShareButtonItemProps) {
  const config = platformConfig[platform];
  const Icon = config.icon;

  function handleClick() {
    const shareUrl = config.getUrl(url, title, description);
    if (platform === "email") {
      window.location.href = shareUrl;
    } else {
      window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=500");
    }
  }

  return (
    <button
      onClick={handleClick}
      aria-label={`Share via ${config.label}`}
      className="inline-flex items-center justify-center h-9 w-9 rounded-[var(--radius-md)] text-text-tertiary transition-colors duration-[var(--duration-fast)] hover:text-text-primary hover:bg-bg-tertiary"
    >
      <Icon className="h-[18px] w-[18px]" />
    </button>
  );
}

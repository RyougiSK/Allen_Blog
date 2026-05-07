const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/media`;

export const SUPPORT = {
  stripe: {
    link: "https://buy.stripe.com/3cI14nambau13KF6Xh0oM00",
  },
  alipay: {
    qrCode: `${SUPABASE_URL}/storage/v1/object/public/media/support/alipay-qr.png`,
  },
} as const;

export type Pillar = "self" | "nature" | "living";

export const PILLARS = {
  self: {
    id: "self" as const,
    en: "Relationship with the Self",
    zh: "人与自己的关系",
    question: { en: "Who am I?", zh: "我是谁？" },
  },
  nature: {
    id: "nature" as const,
    en: "Relationship with Nature & Society",
    zh: "人与自然（包括人类社会）的关系",
    question: { en: "How do I live with the world?", zh: "我如何与世界相处？" },
  },
  living: {
    id: "living" as const,
    en: "Relationship with Living",
    zh: "人与生活的关系",
    question: { en: "How do I truly live this out?", zh: "我如何真正地活出来？" },
  },
} as const;

export const SITE = {
  name: "The Quiet Way",
  nameZh: "行于静中",
  title: "The Quiet Way",
  description: "Designing Inner Life in the Modern World",
  url: "https://the-quiet-way.com",
  author: {
    name: "Hanming (Allen) Chen",
    nameZh: "陈翰明",
    bio: "Based in Australia. Writing about what I notice underneath.",
  },
  logo: `${STORAGE_BASE}/brand/logo.png`,
  hero: {
    video: `${STORAGE_BASE}/hero/hero.mp4`,
    poster: `${STORAGE_BASE}/hero/hero-poster.jpg`,
  },
} as const;

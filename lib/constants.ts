const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/media`;

export const SUPPORT = {
  stripe: {
    coffee: process.env.NEXT_PUBLIC_STRIPE_LINK_COFFEE ?? "",
    meal: process.env.NEXT_PUBLIC_STRIPE_LINK_MEAL ?? "",
    patron: process.env.NEXT_PUBLIC_STRIPE_LINK_PATRON ?? "",
  },
  alipay: {
    qrCode: `${SUPABASE_URL}/storage/v1/object/public/media/support/alipay-qr.png`,
  },
} as const;

export const SITE = {
  name: "The Quiet Way",
  nameZh: "静之道",
  title: "The Quiet Way",
  description:
    "A personal journal on psychology, philosophy, and the questions that don't resolve.",
  url: "https://the-quiet-way.com",
  author: {
    name: "Hanming (Allen) Chen",
    nameZh: "陈翰明",
    bio: "BI analyst and consultant based in Australia. Writing on psychology, philosophy, and the inner life.",
  },
  logo: `${STORAGE_BASE}/brand/logo.png`,
  hero: {
    video: `${STORAGE_BASE}/hero/hero.mp4`,
    poster: `${STORAGE_BASE}/hero/hero-poster.jpg`,
  },
} as const;

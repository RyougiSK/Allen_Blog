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

export const SITE = {
  name: "The Quiet Way",
  nameZh: "行于静中",
  title: "The Quiet Way",
  description:
    "Notes on what I notice and the questions that stay.",
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

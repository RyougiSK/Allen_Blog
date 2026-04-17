const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/media`;

export const SITE = {
  name: "Han Ming Chen",
  title: "Han Ming Chen",
  description:
    "A personal journal on psychology, philosophy, and the questions that don't resolve.",
  url: "https://hanmingchen.com",
  author: {
    name: "Han Ming Chen",
    bio: "BI analyst and consultant based in Australia. Writing on psychology, philosophy, and the inner life.",
  },
  hero: {
    video: `${STORAGE_BASE}/hero/hero.mp4`,
    poster: `${STORAGE_BASE}/hero/hero-poster.jpg`,
  },
} as const;

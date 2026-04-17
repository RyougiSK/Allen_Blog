// --- Article (unified bilingual model) ---

export type ArticleStatus = "draft" | "published" | "archived";
export type ContentLocale = "en" | "zh";

export interface ArticleMeta {
  meta_title: string;
  meta_description: string;
  keywords: string[];
}

export interface ArticleLang {
  title: string;
  subtitle: string;
  slug: string;
  content: string;
  excerpt: string;
  completed: boolean;
  meta: ArticleMeta;
}

export interface Article {
  id: string;
  status: ArticleStatus;
  cover_image: string | null;
  category_id: string | null;
  author_id: string | null;
  created_at: string;
  updated_at: string;
  en: ArticleLang;
  zh: ArticleLang;
}

export interface ArticleWithTags extends Article {
  tags: Tag[];
  category?: Category | null;
}

export interface ArticleFormData {
  en: ArticleLang;
  zh: ArticleLang;
  tag_ids: string[];
  category_id: string | null;
  cover_image: string | null;
  status: ArticleStatus;
}

// --- Categories ---

export interface Category {
  id: string;
  name: string;
  name_zh: string;
  slug: string;
  description: string;
  display_order: number;
  created_at: string;
}

export interface CategoryWithCount extends Category {
  articleCount: number;
}

// --- Media ---

export interface MediaItem {
  id: string;
  filename: string;
  storage_path: string;
  url: string;
  alt_text: string;
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  uploaded_by: string | null;
  created_at: string;
}

// --- Tags ---

export interface Tag {
  id: string;
  name: string;
  name_zh: string;
  slug: string;
  created_at: string;
}

export interface TagWithCount extends Tag {
  postCount: number;
}

// --- Subscribers ---

export type SubscriberStatus = "pending" | "active" | "unsubscribed";

export interface Subscriber {
  id: string;
  email: string;
  preferred_locale: "en" | "zh";
  status: SubscriberStatus;
  token: string;
  confirmed_at: string | null;
  unsubscribed_at: string | null;
  created_at: string;
}

// --- Action results ---

export interface ActionResult {
  success: boolean;
  error?: string;
}

export interface ArticleActionResult extends ActionResult {
  article?: Article;
}

// --- Empty defaults ---

export const EMPTY_META: ArticleMeta = {
  meta_title: "",
  meta_description: "",
  keywords: [],
};

export const EMPTY_LANG: ArticleLang = {
  title: "",
  subtitle: "",
  slug: "",
  content: "",
  excerpt: "",
  completed: false,
  meta: { ...EMPTY_META },
};

// --- Legacy (keep until migration cleanup) ---

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  published: boolean;
  author_id: string | null;
  locale: "en" | "zh-cn";
  translation_of: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostWithTags extends Post {
  tags: Tag[];
}

export interface PostFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  published: boolean;
  tag_ids: string[];
  locale: "en" | "zh-cn";
  translation_of?: string;
}

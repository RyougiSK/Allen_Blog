export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  published: boolean;
  author_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
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
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

export interface PostActionResult extends ActionResult {
  post?: Post;
}

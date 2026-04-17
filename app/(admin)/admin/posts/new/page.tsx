import { createClient } from "@/utils/supabase/server";
import { ArticleForm } from "@/components/features/article-form";
import type { Tag } from "@/lib/types";

export default async function NewArticlePage() {
  const supabase = await createClient();
  const { data } = await supabase.from("tags").select("*").order("name");
  const tags: Tag[] = data ?? [];

  return <ArticleForm tags={tags} />;
}

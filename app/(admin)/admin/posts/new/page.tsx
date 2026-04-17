import { createClient } from "@/utils/supabase/server";
import { PostForm } from "@/components/features/post-form";
import type { Tag } from "@/lib/types";

export default async function NewPostPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("tags").select("*").order("name");
  const tags: Tag[] = data ?? [];

  return <PostForm tags={tags} />;
}

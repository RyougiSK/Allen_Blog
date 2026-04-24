"use server";

import { revalidatePath, unstable_cache } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { createStaticClient } from "@/utils/supabase/static";
import { slugify } from "@/lib/utils";
import type { ActionResult, WritingType, WritingTypeWithCount } from "@/lib/types";

export async function createWritingType(data: {
  name: string;
  name_zh?: string;
  description?: string;
}): Promise<ActionResult & { writingType?: WritingType }> {
  const supabase = await createClient();
  const name = data.name.trim();

  if (!name) return { success: false, error: "Name is required" };

  const { data: maxOrder } = await supabase
    .from("writing_types")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (maxOrder?.display_order ?? -1) + 1;

  const { data: writingType, error } = await supabase
    .from("writing_types")
    .insert({
      name,
      name_zh: data.name_zh ?? "",
      slug: slugify(name),
      description: data.description ?? "",
      is_default: false,
      display_order: nextOrder,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidateAll();
  return { success: true, writingType: writingType as WritingType };
}

export async function updateWritingType(
  id: string,
  data: { name?: string; name_zh?: string; slug?: string; description?: string },
): Promise<ActionResult> {
  const supabase = await createClient();

  const payload: Record<string, unknown> = {};
  if (data.name !== undefined) payload.name = data.name.trim();
  if (data.name_zh !== undefined) payload.name_zh = data.name_zh.trim();
  if (data.slug !== undefined) payload.slug = data.slug;
  if (data.description !== undefined) payload.description = data.description;

  const { error } = await supabase
    .from("writing_types")
    .update(payload)
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidateAll();
  return { success: true };
}

export async function deleteWritingType(id: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: wt } = await supabase
    .from("writing_types")
    .select("is_default")
    .eq("id", id)
    .single();

  if (wt?.is_default) {
    return { success: false, error: "The default writing type cannot be deleted." };
  }

  const { data: defaultType } = await supabase
    .from("writing_types")
    .select("id")
    .eq("is_default", true)
    .single();

  if (defaultType) {
    await supabase
      .from("articles")
      .update({ writing_type_id: defaultType.id })
      .eq("writing_type_id", id);
  }

  const { error } = await supabase.from("writing_types").delete().eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidateAll();
  return { success: true };
}

export async function reorderWritingTypes(
  orderedIds: string[],
): Promise<ActionResult> {
  const supabase = await createClient();

  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("writing_types")
      .update({ display_order: i })
      .eq("id", orderedIds[i]);

    if (error) return { success: false, error: error.message };
  }

  revalidateAll();
  return { success: true };
}

export async function fetchWritingTypes(): Promise<WritingType[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("writing_types")
    .select("*")
    .order("display_order");

  return (data ?? []) as WritingType[];
}

export async function fetchWritingTypesWithCounts(): Promise<WritingTypeWithCount[]> {
  const supabase = await createClient();

  const { data: types } = await supabase
    .from("writing_types")
    .select("*, articles(count)")
    .order("display_order");

  if (!types || types.length === 0) return [];

  return types.map((wt) => {
    const articleCount =
      (wt.articles as unknown as { count: number }[])?.[0]?.count ?? 0;
    const { articles: _articles, ...rest } = wt;
    return { ...(rest as WritingType), articleCount };
  });
}

export const fetchNavWritingTypes = unstable_cache(
  async (): Promise<WritingType[]> => {
    const supabase = createStaticClient();

    const { data } = await supabase
      .from("writing_types")
      .select("*")
      .order("display_order");

    return (data ?? []) as WritingType[];
  },
  ["nav-writing-types"],
  { revalidate: 3600 },
);

function revalidateAll() {
  revalidatePath("/en", "layout");
  revalidatePath("/zh", "layout");
  revalidatePath("/admin", "layout");
}

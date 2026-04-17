"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { slugify } from "@/lib/utils";
import type { ActionResult, Category, CategoryWithCount } from "@/lib/types";

export async function createCategory(data: {
  name: string;
  name_zh?: string;
  description?: string;
}): Promise<ActionResult & { category?: Category }> {
  const supabase = await createClient();
  const name = data.name.trim();

  if (!name) return { success: false, error: "Category name is required" };

  const { data: maxOrder } = await supabase
    .from("categories")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (maxOrder?.display_order ?? -1) + 1;

  const { data: category, error } = await supabase
    .from("categories")
    .insert({
      name,
      name_zh: data.name_zh ?? "",
      slug: slugify(name),
      description: data.description ?? "",
      display_order: nextOrder,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidateAll();
  return { success: true, category: category as Category };
}

export async function updateCategory(
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
    .from("categories")
    .update(payload)
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidateAll();
  return { success: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidateAll();
  return { success: true };
}

export async function reorderCategories(
  orderedIds: string[],
): Promise<ActionResult> {
  const supabase = await createClient();

  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("categories")
      .update({ display_order: i })
      .eq("id", orderedIds[i]);

    if (error) return { success: false, error: error.message };
  }

  revalidateAll();
  return { success: true };
}

export async function fetchCategories(): Promise<Category[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("display_order");

  return (data ?? []) as Category[];
}

export async function fetchCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("display_order");

  if (!categories || categories.length === 0) return [];

  const result: CategoryWithCount[] = [];
  for (const cat of categories) {
    const { count } = await supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("category_id", cat.id)
      .eq("status", "published");

    result.push({ ...(cat as Category), articleCount: count ?? 0 });
  }

  return result;
}

function revalidateAll() {
  revalidatePath("/en", "layout");
  revalidatePath("/zh", "layout");
  revalidatePath("/admin", "layout");
}

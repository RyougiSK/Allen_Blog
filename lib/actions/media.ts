"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type { ActionResult, MediaItem } from "@/lib/types";

export async function uploadMedia(
  formData: FormData,
): Promise<ActionResult & { media?: MediaItem }> {
  const supabase = await createClient();
  const file = formData.get("file") as File;
  const altText = (formData.get("alt_text") as string) ?? "";

  if (!file) return { success: false, error: "No file provided" };

  const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
    "image/gif",
    "image/svg+xml",
  ];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, error: "Unsupported file type" };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "File exceeds 5MB limit" };
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const id = crypto.randomUUID();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `uploads/${year}/${month}/${id}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("media")
    .upload(storagePath, file, { contentType: file.type });

  if (uploadError) return { success: false, error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("media").getPublicUrl(storagePath);

  const { data: media, error: dbError } = await supabase
    .from("media")
    .insert({
      filename: file.name,
      storage_path: storagePath,
      url: publicUrl,
      alt_text: altText,
      mime_type: file.type,
      size_bytes: file.size,
    })
    .select()
    .single();

  if (dbError) {
    await supabase.storage.from("media").remove([storagePath]);
    return { success: false, error: dbError.message };
  }

  revalidatePath("/admin/media");
  return { success: true, media: media as MediaItem };
}

export async function deleteMedia(id: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: media, error: fetchError } = await supabase
    .from("media")
    .select("storage_path")
    .eq("id", id)
    .single();

  if (fetchError || !media) {
    return { success: false, error: "Media not found" };
  }

  await supabase.storage.from("media").remove([media.storage_path]);

  const { error } = await supabase.from("media").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/media");
  return { success: true };
}

export async function updateMediaAlt(
  id: string,
  altText: string,
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("media")
    .update({ alt_text: altText })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function fetchMedia(
  options: { limit?: number; offset?: number; search?: string } = {},
): Promise<{ items: MediaItem[]; total: number }> {
  const supabase = await createClient();
  const { limit = 24, offset = 0, search } = options;

  let query = supabase
    .from("media")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(
      `filename.ilike.%${search}%,alt_text.ilike.%${search}%`,
    );
  }

  const { data, count, error } = await query.range(
    offset,
    offset + limit - 1,
  );

  if (error) return { items: [], total: 0 };
  return { items: (data ?? []) as MediaItem[], total: count ?? 0 };
}

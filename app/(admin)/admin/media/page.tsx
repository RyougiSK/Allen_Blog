import { fetchMedia } from "@/lib/actions/media";
import { MediaLibraryClient } from "./client";

export default async function MediaPage() {
  const { items, total } = await fetchMedia({ limit: 24 });

  return <MediaLibraryClient initialItems={items} initialTotal={total} />;
}

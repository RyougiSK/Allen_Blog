import { fetchAllTags } from "@/lib/actions/tags";
import { TagTable } from "@/components/features/tag-table";
import { NewTagForm } from "./new-tag-form";

export default async function TagsPage() {
  const tags = await fetchAllTags();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-text-primary">Tags</h1>
          <p className="mt-1 text-sm text-text-tertiary">
            Fine-grained topics for article discovery.
          </p>
        </div>
      </div>

      <div className="mb-6">
        <NewTagForm />
      </div>

      <TagTable tags={tags} />
    </div>
  );
}

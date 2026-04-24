import { fetchWritingTypesWithCounts } from "@/lib/actions/writing-types";
import { WritingTypeTable } from "@/components/features/writing-type-table";
import { NewWritingTypeForm } from "./new-type-form";

export const dynamic = "force-dynamic";

export default async function TypesPage() {
  const types = await fetchWritingTypesWithCounts();

  return (
    <div className="w-full max-w-6xl px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-text-primary">Writing Types</h1>
          <p className="mt-1 text-sm text-text-tertiary">
            Manage sections in the Writing dropdown. Blog is built-in and cannot be deleted.
          </p>
        </div>
      </div>

      <div className="mb-6">
        <NewWritingTypeForm />
      </div>

      <WritingTypeTable types={types} />
    </div>
  );
}

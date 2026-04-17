import { fetchCategoriesWithCounts } from "@/lib/actions/categories";
import { CategoryTable } from "@/components/features/category-table";
import { NewCategoryForm } from "./new-category-form";

export default async function CategoriesPage() {
  const categories = await fetchCategoriesWithCounts();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-text-primary">Categories</h1>
          <p className="mt-1 text-sm text-text-tertiary">
            Organize articles into editorial pillars.
          </p>
        </div>
      </div>

      <div className="mb-6">
        <NewCategoryForm />
      </div>

      <CategoryTable categories={categories} />
    </div>
  );
}

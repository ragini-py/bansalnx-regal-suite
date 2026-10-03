/**
 * Category API client — wraps `/api/categories`.
 */
import type { Category } from "@/data/types";
import { apiClient } from "@/lib/api/client";

export async function getCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<{ categories: Category[] }>("/categories");
  return data.categories;
}

export async function createCategoryRequest(input: {
  name: string;
  slug?: string;
}): Promise<{ category: Category; created: boolean }> {
  const { data } = await apiClient.post<{ category: Category; created: boolean }>(
    "/categories",
    input,
  );
  return data;
}

export async function updateCategoryRequest(
  id: string,
  input: { name?: string; slug?: string },
): Promise<Category> {
  const { data } = await apiClient.put<{ category: Category }>(`/categories/${id}`, input);
  return data.category;
}

export async function deleteCategoryRequest(id: string): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}

/**
 * `/api/uploads` — admin-only image upload to the backend public directory.
 */
import { apiClient } from "@/lib/api/client";

export type UploadFolder = "products" | "collections" | "content" | "general";

export async function uploadImageRequest(
  file: File,
  folder: UploadFolder = "general",
): Promise<string> {
  const form = new FormData();
  form.append("image", file);
  form.append("folder", folder);
  const { data } = await apiClient.post<{ url: string }>("/uploads", form);
  const base = apiClient.defaults.baseURL;
  if (base && /^https?:\/\//i.test(base)) {
    return new URL(data.url, base).toString();
  }
  return data.url;
}

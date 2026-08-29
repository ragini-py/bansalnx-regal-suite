/**
 * `/api/uploads` — admin-only image upload. Backend stores to Cloudinary if
 * configured, otherwise local disk (see backend/src/modules/uploads); this
 * side only cares that it gets a usable URL back.
 */
import { apiClient } from "@/lib/api/client";

export async function uploadImageRequest(file: File): Promise<string> {
  const form = new FormData();
  form.append("image", file);
  const { data } = await apiClient.post<{ url: string }>("/uploads", form);
  return data.url;
}

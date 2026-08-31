/**
 * `/api/content` — matches bansalnx-backend's modules/content shape
 * (HomepageContent in data/types.ts).
 */
import type { HomepageContent } from "@/data/types";
import { apiClient } from "@/lib/api/client";

export async function getContentRequest(): Promise<HomepageContent> {
  const { data } = await apiClient.get<{ content: HomepageContent }>("/content");
  return data.content;
}

export async function updateContentRequest(
  patch: Partial<HomepageContent>,
): Promise<HomepageContent> {
  const { data } = await apiClient.patch<{ content: HomepageContent }>("/content", patch);
  return data.content;
}

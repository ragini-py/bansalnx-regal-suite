/**
 * `/api/wishlist` — matches bansalnx-backend's modules/wishlist shape.
 * Full-replace only, same convention as cart.
 */
import { apiClient } from "@/lib/api/client";

export async function getWishlistRequest(): Promise<string[]> {
  const { data } = await apiClient.get<{ productIds: string[] }>("/wishlist");
  return data.productIds;
}

export async function replaceWishlistRequest(productIds: string[]): Promise<string[]> {
  const { data } = await apiClient.put<{ productIds: string[] }>("/wishlist", { productIds });
  return data.productIds;
}

/**
 * `/api/cart` — matches bansalnx-backend's modules/cart shape
 * (CartLine in data/types.ts). Full-replace only, same convention as the
 * rest of this app's admin write endpoints.
 */
import type { CartLine } from "@/data/types";
import { apiClient } from "@/lib/api/client";

export async function getCartRequest(): Promise<CartLine[]> {
  const { data } = await apiClient.get<{ lines: CartLine[] }>("/cart");
  return data.lines;
}

export async function replaceCartRequest(lines: CartLine[]): Promise<CartLine[]> {
  const { data } = await apiClient.put<{ lines: CartLine[] }>("/cart", { lines });
  return data.lines;
}

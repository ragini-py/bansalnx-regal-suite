/**
 * `/api/settings` — matches bansalnx-backend's modules/settings shape
 * (StoreSettings in data/types.ts).
 */
import type { StoreSettings } from "@/data/types";
import { apiClient } from "@/lib/api/client";

export async function getSettingsRequest(): Promise<StoreSettings> {
  const { data } = await apiClient.get<{ settings: StoreSettings }>("/settings");
  return data.settings;
}

export async function updateSettingsRequest(
  patch: Partial<Pick<StoreSettings, "freeShippingThreshold" | "shippingFee" | "codMaxOrderValue">>,
): Promise<StoreSettings> {
  const { data } = await apiClient.patch<{ settings: StoreSettings }>("/settings", patch);
  return data.settings;
}

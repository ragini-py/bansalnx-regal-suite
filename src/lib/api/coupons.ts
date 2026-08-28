/**
 * `/api/coupons` — matches bansalnx-backend's modules/coupons shape
 * field-for-field (Coupon in data/types.ts).
 */
import type { Coupon } from "@/data/types";
import { apiClient } from "@/lib/api/client";

export async function getCoupons(): Promise<Coupon[]> {
  const { data } = await apiClient.get<{ coupons: Coupon[] }>("/coupons");
  return data.coupons;
}

export async function createCouponRequest(
  coupon: Omit<Coupon, "id" | "timesUsed">,
): Promise<Coupon> {
  const { data } = await apiClient.post<{ coupon: Coupon }>("/coupons", coupon);
  return data.coupon;
}

export async function deleteCouponRequest(id: string): Promise<void> {
  await apiClient.delete(`/coupons/${id}`);
}

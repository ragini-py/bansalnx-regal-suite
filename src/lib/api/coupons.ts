/**
 * `/api/coupons` — matches bansalnx-backend's modules/coupons shape
 * field-for-field (Coupon in data/types.ts).
 */
import type { Coupon } from "@/data/types";
import { apiClient } from "@/lib/api/client";

// Admin-only full listing, including hidden/targeted codes — used by
// AdminPage's CouponsManagerTab. Never call this for a storefront visitor.
export async function getCoupons(): Promise<Coupon[]> {
  const { data } = await apiClient.get<{ coupons: Coupon[] }>("/coupons");
  return data.coupons;
}

// Customer-facing listing — only codes an admin marked isPublic. Safe to
// call for any signed-in or anonymous visitor (Account > Coupons display).
export async function getPublicCoupons(): Promise<Coupon[]> {
  const { data } = await apiClient.get<{ coupons: Coupon[] }>("/coupons/public");
  return data.coupons;
}

export interface ValidateCouponResult {
  couponCode: string;
  discount: number;
  subtotal: number;
}

// Checks eligibility and computes the discount for a code the shopper
// already knows — the backend re-derives everything from live product
// prices, so this never leaks hidden coupon terms and can't be spoofed.
export async function validateCouponRequest(
  code: string,
  lines: { productId: string; quantity: number }[],
): Promise<ValidateCouponResult> {
  const { data } = await apiClient.post<ValidateCouponResult>("/coupons/validate", {
    code,
    lines,
  });
  return data;
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

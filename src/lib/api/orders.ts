/**
 * `/api/orders` — matches bansalnx-backend's modules/orders shape
 * field-for-field (Order in data/types.ts).
 */
import type { Order } from "@/data/types";
import { apiClient } from "@/lib/api/client";

export async function createOrderRequest(
  order: Omit<Order, "id" | "createdAt" | "userId">,
  idempotencyKey: string,
): Promise<Order> {
  // The backend dedupes retried checkout submissions by this header (see
  // orders.controller.ts) — the axios client's own 401-refresh-then-retry
  // resends the same request config/headers automatically, and the caller
  // reuses the same key across a manual re-submit after a failure, so a
  // retried request can never create a second order for one checkout attempt.
  const { data } = await apiClient.post<{ order: Order }>("/orders", order, {
    headers: { "Idempotency-Key": idempotencyKey },
  });
  return data.order;
}

export async function getMyOrders(): Promise<Order[]> {
  const { data } = await apiClient.get<{ orders: Order[] }>("/orders/mine");
  return data.orders;
}

export async function getAllOrders(): Promise<Order[]> {
  const { data } = await apiClient.get<{ orders: Order[] }>("/orders");
  return data.orders;
}

export async function updateOrderRequest(id: string, patch: Partial<Order>): Promise<Order> {
  const { data } = await apiClient.patch<{ order: Order }>(`/orders/${id}`, patch);
  return data.order;
}

export async function requestReturnRequest(id: string, reason: string): Promise<Order> {
  const { data } = await apiClient.post<{ order: Order }>(`/orders/${id}/return`, { reason });
  return data.order;
}

export async function cancelOrderRequest(id: string): Promise<Order> {
  const { data } = await apiClient.post<{ order: Order }>(`/orders/${id}/cancel`);
  return data.order;
}

// Both id and email are required by the backend — an order id alone (a Mongo
// ObjectId, not fully random) must never be enough on its own to pull
// someone else's order details.
export async function trackOrderRequest(id: string, email: string): Promise<Order> {
  const params = new URLSearchParams({ id, email });
  const { data } = await apiClient.get<{ order: Order }>(`/orders/track?${params.toString()}`);
  return data.order;
}

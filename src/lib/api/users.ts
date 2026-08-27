/**
 * `/api/users/*` endpoints — currently just address management. Matches
 * bansalnx-backend's modules/users/addresses shape field-for-field.
 */
import type { Address } from "@/data/types";
import { apiClient } from "@/lib/api/client";
import type { AuthUser } from "@/lib/api/auth";

export async function addAddressRequest(address: Omit<Address, "id">): Promise<AuthUser> {
  const { data } = await apiClient.post<{ user: AuthUser }>("/users/me/addresses", address);
  return data.user;
}

export async function removeAddressRequest(addressId: string): Promise<AuthUser> {
  const { data } = await apiClient.delete<{ user: AuthUser }>(`/users/me/addresses/${addressId}`);
  return data.user;
}

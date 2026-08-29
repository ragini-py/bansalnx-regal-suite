/**
 * `/api/users` (admin-only list + patch) — matches bansalnx-backend's
 * modules/users/admin-users shape (User in data/types.ts, minus `password`).
 */
import type { User } from "@/data/types";
import { apiClient } from "@/lib/api/client";

export type AdminUser = Omit<User, "password">;

export async function getAllUsers(): Promise<AdminUser[]> {
  const { data } = await apiClient.get<{ users: AdminUser[] }>("/users");
  return data.users;
}

export async function updateUserRequest(
  id: string,
  patch: Partial<Pick<User, "role" | "status">>,
): Promise<AdminUser> {
  const { data } = await apiClient.patch<{ user: AdminUser }>(`/users/${id}`, patch);
  return data.user;
}

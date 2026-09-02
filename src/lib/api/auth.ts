/**
 * Auth endpoints — the only file that knows the shape of `/api/auth/*`.
 * Matches bansalnx-backend's PublicUser/PublicAddress response shape
 * (backend/src/modules/auth/auth.service.ts) field-for-field.
 */
import { isAxiosError } from "axios";

import type { User } from "@/data/types";
import { apiClient, setAccessToken, setCsrfToken, setRefreshHandler } from "@/lib/api/client";

export type AuthUser = Omit<User, "password">;

interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  csrfToken: string;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export function extractApiErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const body = err.response?.data as { message?: string } | undefined;
    if (body?.message) return body.message;
  }
  return fallback;
}

export async function registerRequest(input: RegisterInput): Promise<AuthUser> {
  const { data } = await apiClient.post<AuthResponse>("/auth/register", input);
  setAccessToken(data.accessToken);
  setCsrfToken(data.csrfToken);
  return data.user;
}

export async function loginRequest(input: LoginInput): Promise<AuthUser> {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", input);
  setAccessToken(data.accessToken);
  setCsrfToken(data.csrfToken);
  return data.user;
}

export async function logoutRequest(): Promise<void> {
  await apiClient.post("/auth/logout");
  setAccessToken(null);
  setCsrfToken(null);
}

export async function refreshRequest(): Promise<string | null> {
  try {
    const { data } = await apiClient.post<{ accessToken: string; csrfToken: string }>(
      "/auth/refresh",
    );
    setAccessToken(data.accessToken);
    setCsrfToken(data.csrfToken);
    return data.accessToken;
  } catch {
    setAccessToken(null);
    setCsrfToken(null);
    return null;
  }
}

export async function meRequest(): Promise<AuthUser> {
  const { data } = await apiClient.get<{ user: AuthUser }>("/auth/me");
  return data.user;
}

setRefreshHandler(refreshRequest);

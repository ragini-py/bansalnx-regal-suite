/**
 * `/api/auth/forgot-password` and `/reset-password` — matches
 * bansalnx-backend's auth module. Both endpoints respond 204 with no body.
 */
import { apiClient } from "@/lib/api/client";

export async function forgotPasswordRequest(email: string): Promise<void> {
  await apiClient.post("/auth/forgot-password", { email });
}

export interface ResetPasswordInput {
  token: string;
  password: string;
  confirmPassword: string;
}

export async function resetPasswordRequest(input: ResetPasswordInput): Promise<void> {
  await apiClient.post("/auth/reset-password", input);
}

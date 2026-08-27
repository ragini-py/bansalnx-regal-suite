/**
 * Centralized axios instance. Every API call in this app goes through this
 * client (or a wrapper around it) — no component or feature module should
 * construct its own axios/fetch call or hardcode the backend URL.
 */
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import { env } from "@/lib/env";

// Access token lives in memory only (never localStorage) so it can't be
// read by a script via storage APIs; the refresh token that can revive it
// is a separate httpOnly cookie the browser handles automatically.
let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return config;
});

// One retry-after-refresh per request, driven by whoever registers a
// refresh handler (auth module) — keeps this file free of auth-specific
// logic while still centralizing the retry behavior.
type RefreshHandler = () => Promise<string | null>;
let refreshHandler: RefreshHandler | null = null;
let refreshInFlight: Promise<string | null> | null = null;

export function setRefreshHandler(handler: RefreshHandler): void {
  refreshHandler = handler;
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const isAuthRoute =
      config?.url?.includes("/auth/login") || config?.url?.includes("/auth/register");

    if (
      error.response?.status !== 401 ||
      !config ||
      config._retried ||
      !refreshHandler ||
      isAuthRoute
    ) {
      return Promise.reject(error);
    }

    config._retried = true;
    refreshInFlight ??= refreshHandler().finally(() => {
      refreshInFlight = null;
    });

    const newToken = await refreshInFlight;
    if (!newToken) return Promise.reject(error);

    config.headers.set("Authorization", `Bearer ${newToken}`);
    return apiClient(config);
  },
);

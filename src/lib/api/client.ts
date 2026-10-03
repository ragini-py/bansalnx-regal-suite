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

// Double-submit CSRF token — returned in the JSON body by register/login/
// refresh (see backend/src/modules/auth/auth.controller.ts) alongside a
// same-value cookie the server compares it against. Kept in memory and sent
// back explicitly as a header (rather than relying on the browser reading
// the cookie itself) so this keeps working if the frontend and API ever end
// up on genuinely different domains, not just different ports.
let csrfToken: string | null = null;

const CSRF_STORAGE_KEY = "bansal_csrf_token";

export function setCsrfToken(token: string | null): void {
  csrfToken = token;
  if (typeof window !== "undefined") {
    try {
      if (token) {
        window.sessionStorage.setItem(CSRF_STORAGE_KEY, token);
      } else {
        window.sessionStorage.removeItem(CSRF_STORAGE_KEY);
      }
    } catch {
      /* ignore storage unavailable */
    }
  }
}

export function getCsrfToken(): string | null {
  if (csrfToken) return csrfToken;
  if (typeof window !== "undefined") {
    try {
      const stored = window.sessionStorage.getItem(CSRF_STORAGE_KEY);
      if (stored) return stored;
    } catch {
      /* ignore storage unavailable */
    }
  }
  return readCsrfCookie();
}

// On a fresh page load, csrfToken above is still null (in-memory state
// doesn't survive a reload) even though the browser may already be holding
// a valid csrfToken cookie from a previous session — used by store.tsx's
// silent boot-time refresh before any explicit login/refresh response has
// set the in-memory value. Read the cookie directly as a fallback.
function readCsrfCookie(): string | null {
  const match = document.cookie.match(/(?:^|; )csrfToken=([^;]*)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }
  const csrf = getCsrfToken();
  if (csrf) {
    config.headers.set("X-CSRF-Token", csrf);
  }
  return config;
});

// One retry-after-refresh per request, driven by whoever registers a
// refresh handler (auth module) — keeps this file free of auth-specific
// logic while still centralizing the retry behavior.
type RefreshHandler = () => Promise<string | null>;
type AuthFailureHandler = () => void;
let refreshHandler: RefreshHandler | null = null;
let authFailureHandler: AuthFailureHandler | null = null;
let refreshInFlight: Promise<string | null> | null = null;

export function setRefreshHandler(handler: RefreshHandler): void {
  refreshHandler = handler;
}

export function setAuthFailureHandler(handler: AuthFailureHandler): void {
  authFailureHandler = handler;
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const isAuthRoute =
      config?.url?.includes("/auth/login") ||
      config?.url?.includes("/auth/register") ||
      config?.url?.includes("/auth/refresh");

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
    if (!newToken) {
      authFailureHandler?.();
      return Promise.reject(error);
    }

    config.headers.set("Authorization", `Bearer ${newToken}`);
    return apiClient(config);
  },
);

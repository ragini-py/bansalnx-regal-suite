import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { env } from "@/lib/env";
import type { User } from "@/data/types";
import { cn } from "@/lib/utils";

// Official Google Multi-Color "G" Icon
export function GoogleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17Z"
        fill="#4285F4"
      />
      <path
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
        fill="#34A853"
      />
      <path
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15Z"
        fill="#FBBC05"
      />
      <path
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
        fill="#EA4335"
      />
    </svg>
  );
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (notification?: (status: unknown) => void) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with";
              shape?: "rectangular" | "pill" | "circle" | "square";
              width?: string | number;
            },
          ) => void;
        };
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

export interface GoogleAuthButtonProps {
  mode?: "signin" | "signup" | "continue";
  onSuccess?: (user: User) => void;
  onError?: (error: string) => void;
  className?: string;
  variant?: "outline" | "luxe" | "default";
  size?: "default" | "sm" | "lg" | "luxe";
  fullWidth?: boolean;
}

export function GoogleAuthButton({
  mode = "continue",
  onSuccess,
  onError,
  className,
  variant = "outline",
  size = "luxe",
  fullWidth = true,
}: GoogleAuthButtonProps) {
  const { loginWithGoogle } = useStore();
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const hiddenBtnRef = useRef<HTMLDivElement>(null);

  const clientId = (env.googleClientId || "").trim();
  const isConfigured = Boolean(
    clientId &&
      clientId !== "your-google-client-id.apps.googleusercontent.com" &&
      !clientId.startsWith("placeholder"),
  );

  // Load Google Identity Services SDK
  useEffect(() => {
    if (window.google?.accounts) {
      setScriptLoaded(true);
      return;
    }

    const existing = document.getElementById("google-gsi-script");
    if (!existing) {
      const script = document.createElement("script");
      script.id = "google-gsi-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => setScriptLoaded(true);
      document.body.appendChild(script);
    } else {
      existing.addEventListener("load", () => setScriptLoaded(true));
    }
  }, []);

  // Initialize Google Sign-In when ready
  useEffect(() => {
    if (!scriptLoaded || !isConfigured || !window.google?.accounts?.id) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          if (response.credential) {
            await handleToken(response.credential);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render official hidden button as a fallback trigger
      if (hiddenBtnRef.current) {
        hiddenBtnRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(hiddenBtnRef.current, {
          theme: "outline",
          size: "large",
          text: mode === "signup" ? "signup_with" : mode === "signin" ? "signin_with" : "continue_with",
          width: 250,
        });
      }
    } catch (err) {
      console.warn("Failed to initialize Google Auth:", err);
    }
  }, [scriptLoaded, isConfigured, clientId, mode]);

  async function handleToken(token: string) {
    setLoading(true);
    try {
      const result = await loginWithGoogle(token);
      if (result.ok && result.user) {
        toast.success(`Signed in as ${result.user.firstName}`);
        onSuccess?.(result.user);
      } else {
        const msg = result.error || "Unable to complete Google sign-in.";
        toast.error(msg);
        onError?.(msg);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google authentication error";
      toast.error(msg);
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleClick() {
    if (loading) return;

    if (!isConfigured) {
      toast.info(
        "Google Sign-In is awaiting credentials. Please add VITE_GOOGLE_CLIENT_ID and GOOGLE_CLIENT_ID to your .env files.",
      );
      return;
    }

    if (!window.google?.accounts) {
      toast.error("Google authentication service is loading. Please try again in a moment.");
      return;
    }

    // Prefer OAuth2 Token Client popup for standard interactive sign-in
    if (window.google.accounts.oauth2) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "email profile openid",
          callback: async (resp) => {
            if (resp.error) {
              if (resp.error !== "popup_closed_by_user") {
                toast.error(`Google Sign-In: ${resp.error}`);
              }
              return;
            }
            if (resp.access_token) {
              await handleToken(resp.access_token);
            }
          },
        });
        tokenClient.requestAccessToken({ prompt: "select_account" });
        return;
      } catch (e) {
        console.warn("OAuth2 token client failed, falling back to One-Tap/Rendered button", e);
      }
    }

    // Fallback: Trigger GIS Prompt or hidden rendered button
    if (hiddenBtnRef.current) {
      const btn = hiddenBtnRef.current.querySelector<HTMLElement>('div[role="button"], button');
      if (btn) {
        btn.click();
        return;
      }
    }

    window.google.accounts.id.prompt();
  }

  const label =
    mode === "signup"
      ? "Sign up with Google"
      : mode === "signin"
        ? "Sign in with Google"
        : "Continue with Google";

  return (
    <div className={cn("relative", fullWidth ? "w-full" : "w-auto")}>
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled={loading}
        onClick={handleClick}
        className={cn(
          "relative flex items-center justify-center gap-3 font-medium transition-all duration-200",
          "border-border/80 bg-background hover:bg-muted/60 text-foreground hover:border-foreground/30",
          "rounded-none h-11 text-xs tracking-wide uppercase",
          fullWidth && "w-full",
          className,
        )}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <GoogleIcon className="h-4 w-4 shrink-0" />
        )}
        <span>{loading ? "Connecting to Google…" : label}</span>
      </Button>

      {/* Hidden container for Google GSI rendered button fallback */}
      <div
        ref={hiddenBtnRef}
        aria-hidden="true"
        style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0, overflow: "hidden" }}
      />
    </div>
  );
}

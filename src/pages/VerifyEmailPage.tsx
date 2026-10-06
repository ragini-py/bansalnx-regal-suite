import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, AlertCircle, Mail, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";

import { SiteLayout } from "@/components/storefront/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandMark } from "@/components/brand/BrandMark";
import { useStore } from "@/lib/store";

import hero from "@/assets/collection-2.jpg";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const {
    verifyEmail,
    resendVerification,
    pendingIntent,
    setPendingIntent,
    toggleWishlist,
    addToCart,
  } = useStore();

  const [status, setStatus] = useState<"verifying" | "success" | "error" | "no_token">(
    token ? "verifying" : "no_token",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  function resolveIntentAndNavigate(role: string) {
    if (pendingIntent) {
      if (pendingIntent.type === "wishlist" && pendingIntent.productId) {
        toggleWishlist(pendingIntent.productId);
        toast.success("Added to your wishlist");
      } else if (
        pendingIntent.type === "cart" &&
        pendingIntent.productId &&
        pendingIntent.variant
      ) {
        addToCart({
          productId: pendingIntent.productId,
          size: pendingIntent.variant.size,
          colour: pendingIntent.variant.colour,
        });
        toast.success("Added to your bag");
      }
      const returnTo = pendingIntent.returnTo;
      setPendingIntent(null);
      navigate(returnTo);
      return;
    }
    if (role !== "customer") {
      navigate("/admin");
      return;
    }
    navigate("/account");
  }

  useEffect(() => {
    if (!token) {
      setStatus("no_token");
      return;
    }

    let isMounted = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    setStatus("verifying");

    verifyEmail(token).then((res) => {
      if (!isMounted) return;
      if (res.ok && res.user) {
        setStatus("success");
        toast.success(`Welcome to Bansal-nx, ${res.user.firstName}! Your email is verified.`);
        timer = setTimeout(() => {
          if (isMounted) {
            resolveIntentAndNavigate(res.user?.role || "customer");
          }
        }, 1800);
      } else {
        setStatus("error");
        setErrorMessage(res.error || "This verification link is invalid or has expired.");
      }
    });

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    if (!resendEmail.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    setResending(true);
    setResendSuccess(false);
    const res = await resendVerification(resendEmail.trim());
    setResending(false);
    if (res.ok) {
      setResendSuccess(true);
      toast.success("Verification link sent! Please check your inbox.");
    } else {
      toast.error(res.error || "Failed to resend verification email.");
    }
  }

  return (
    <SiteLayout>
      <div className="grid min-h-[85vh] lg:grid-cols-2">
        <div className="relative hidden lg:block">
          <img src={hero} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-ink/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-10 text-center">
            <BrandMark size="lg" tone="onDark" withTagline />
          </div>
        </div>

        <div className="flex items-center justify-center bg-background px-5 py-16 sm:px-10">
          <div className="w-full max-w-md">
            {status === "verifying" && (
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
                <p className="eyebrow mt-6 text-muted-foreground">Authenticating</p>
                <h1 className="mt-2 text-2xl font-serif sm:text-3xl">Verifying your email</h1>
                <p className="mt-3 text-sm text-muted-foreground">
                  Please wait a moment while we activate your Bansal-nx account...
                </p>
              </div>
            )}

            {status === "success" && (
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <p className="eyebrow mt-6 text-emerald-600 dark:text-emerald-400">Verified</p>
                <h1 className="mt-2 text-2xl font-serif sm:text-3xl">Email Verified!</h1>
                <p className="mt-3 text-sm text-muted-foreground">
                  Your email has been confirmed. Signing you in and redirecting to your dashboard...
                </p>

                <div className="mt-8">
                  <Button
                    onClick={() => resolveIntentAndNavigate("customer")}
                    variant="luxe"
                    size="luxe"
                    className="w-full"
                  >
                    Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {(status === "error" || status === "no_token") && (
              <div>
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                    {status === "error" ? (
                      <AlertCircle className="h-9 w-9" />
                    ) : (
                      <Mail className="h-9 w-9 text-primary" />
                    )}
                  </div>
                  <p className="eyebrow mt-6 text-muted-foreground">
                    {status === "error" ? "Verification Failed" : "Email Verification"}
                  </p>
                  <h1 className="mt-2 text-2xl font-serif sm:text-3xl">
                    {status === "error" ? "Invalid or Expired Link" : "Verify Your Account"}
                  </h1>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {status === "error"
                      ? errorMessage || "This link is no longer valid. Links expire after 24 hours."
                      : "Enter your registered email address to receive a fresh verification link."}
                  </p>
                </div>

                {resendSuccess ? (
                  <div className="mt-8 border border-emerald-500/30 bg-emerald-500/5 p-5 text-center">
                    <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="mt-2 text-sm font-medium text-emerald-900 dark:text-emerald-200">
                      Verification link sent!
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Please check your inbox (and spam folder) for the confirmation link.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleResend} className="mt-8 space-y-4">
                    <div>
                      <Label htmlFor="resend-email">Email Address</Label>
                      <Input
                        id="resend-email"
                        type="email"
                        placeholder="you@example.com"
                        className="mt-1.5 rounded-none"
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="luxe"
                      size="luxe"
                      className="w-full"
                      disabled={resending}
                    >
                      {resending ? "Sending link..." : "Resend Verification Link"}
                    </Button>
                  </form>
                )}

                <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
                  <p>
                    Already verified?{" "}
                    <Link to="/login" className="text-foreground link-underline">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

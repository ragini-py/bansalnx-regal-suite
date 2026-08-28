import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";

import { Breadcrumbs, PageHeader, SiteLayout } from "@/components/storefront/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandMark } from "@/components/brand/BrandMark";
import { forgotPasswordRequest } from "@/lib/api/password-reset";

const schema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
});

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = schema.safeParse({ email });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Enter a valid email address");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await forgotPasswordRequest(result.data.email);
      setSent(true);
    } catch {
      // The endpoint always succeeds regardless of whether the email
      // matches an account — a thrown error here means the request itself
      // failed (network/server), not "no such account".
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteLayout>
      <PageHeader
        breadcrumb={
          <Breadcrumbs
            items={[{ label: "Home", href: <Link to="/">Home</Link> }, { label: "Reset Password" }]}
          />
        }
        title="Reset Password"
      />
      <div className="flex min-h-[60vh] items-center justify-center bg-secondary/20 px-5 py-16 sm:px-10">
        <div className="w-full max-w-sm border border-border bg-background px-6 py-10 sm:px-10">
          <div className="flex justify-center">
            <BrandMark size="md" />
          </div>

          {!sent ? (
            <>
              <h1 className="mt-6 text-center text-2xl">Reset your password</h1>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Enter your account email and we'll send you a link to reset your password.
              </p>

              <form className="mt-8 space-y-5" onSubmit={submit} noValidate>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className="mt-1.5 rounded-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!error}
                    aria-describedby={error ? "email-error" : undefined}
                  />
                  {error && (
                    <p id="email-error" className="mt-1.5 text-xs text-destructive">
                      {error}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="luxe"
                  size="luxe"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Sending…" : "Send reset link"}
                </Button>
              </form>
            </>
          ) : (
            <div className="mt-6 text-center">
              <h1 className="text-2xl">Check your email</h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                If an account exists for{" "}
                <span className="font-medium text-foreground">{email}</span>, a password reset link
                has been sent. The link expires in 30 minutes.
              </p>
              <div className="mt-8 flex flex-col gap-3">
                <Button variant="luxeOutline" size="luxeSm" onClick={() => setSent(false)}>
                  Resend link
                </Button>
                <Link to="/login" className="text-sm text-foreground link-underline">
                  Back to sign in
                </Link>
              </div>
            </div>
          )}

          <p className="mt-8 text-center text-[11px] leading-relaxed text-muted-foreground">
            Transactional email delivery is pending provider integration; in this preview no email
            is actually sent.
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}

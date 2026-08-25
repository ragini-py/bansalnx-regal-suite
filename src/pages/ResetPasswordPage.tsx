import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { z } from "zod";

import { Breadcrumbs, PageHeader, SiteLayout } from "@/components/storefront/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandMark } from "@/components/brand/BrandMark";

const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;
type FormErrors = Partial<Record<keyof FormValues, string>>;

function passwordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || undefined;
  const [values, setValues] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const strength = useMemo(() => passwordStrength(values.password), [values.password]);
  const strengthLabel = ["Very weak", "Weak", "Fair", "Good", "Strong"][strength];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = schema.safeParse(values);
    if (!result.success) {
      const next: FormErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FormValues;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 700);
  }

  if (!token) {
    return (
      <SiteLayout>
        <PageHeader
          breadcrumb={<Breadcrumbs items={[{ label: "Home", href: <Link to="/">Home</Link> }, { label: "Reset Password" }]} />}
          title="Reset Password"
        />
        <div className="flex min-h-[60vh] items-center justify-center bg-secondary/20 px-5 py-16 sm:px-10">
          <div className="w-full max-w-sm border border-border bg-background px-6 py-10 text-center sm:px-10">
            <BrandMark size="md" className="mx-auto" />
            <h1 className="mt-6 text-2xl">Invalid or expired link</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link
              to="/forgot-password"
              className="mt-8 inline-block text-sm text-foreground link-underline"
            >
              Request a new link
            </Link>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <PageHeader
        breadcrumb={<Breadcrumbs items={[{ label: "Home", href: <Link to="/">Home</Link> }, { label: "Reset Password" }]} />}
        title="Set New Password"
      />
      <div className="flex min-h-[60vh] items-center justify-center bg-secondary/20 px-5 py-16 sm:px-10">
      <div className="w-full max-w-sm border border-border bg-background px-6 py-10 sm:px-10">
        <div className="flex justify-center">
          <BrandMark size="md" />
        </div>

        {!done ? (
          <>
            <h1 className="mt-6 text-center text-2xl">Set a new password</h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Choose a strong password you haven't used before.
            </p>

            <form className="mt-8 space-y-5" onSubmit={submit} noValidate>
              <div>
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  className="mt-1.5 rounded-none"
                  value={values.password}
                  onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
                  aria-invalid={!!errors.password}
                  aria-describedby="password-hint password-error"
                />
                {values.password && (
                  <div className="mt-2">
                    <div className="flex h-1 gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <span
                          key={i}
                          className={`h-full flex-1 ${i < strength ? "bg-gold" : "bg-border"}`}
                        />
                      ))}
                    </div>
                    <p id="password-hint" className="mt-1 text-[11px] text-muted-foreground">
                      Strength: {strengthLabel} — use 8+ characters with a mix of letters, numbers and symbols.
                    </p>
                  </div>
                )}
                {errors.password && (
                  <p id="password-error" className="mt-1.5 text-xs text-destructive">
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className="mt-1.5 rounded-none"
                  value={values.confirmPassword}
                  onChange={(e) => setValues((v) => ({ ...v, confirmPassword: e.target.value }))}
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                />
                {errors.confirmPassword && (
                  <p id="confirmPassword-error" className="mt-1.5 text-xs text-destructive">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <Button type="submit" variant="luxe" size="luxe" className="w-full" disabled={loading}>
                {loading ? "Updating…" : "Update password"}
              </Button>
            </form>
          </>
        ) : (
          <div className="mt-6 text-center">
            <h1 className="text-2xl">Password updated</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Your password has been reset. You can now sign in with your new password.
            </p>
            <Link to="/login" className="mt-8 inline-block text-sm text-foreground link-underline">
              Continue to sign in
            </Link>
          </div>
        )}
      </div>
    </div>
    </SiteLayout>
  );
}

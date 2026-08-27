import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { SiteLayout } from "@/components/storefront/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandMark } from "@/components/brand/BrandMark";
import { useStore } from "@/lib/store";

import hero from "@/assets/collection-1.jpg";

const schema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;
type FormErrors = Partial<Record<keyof FormValues, string>>;

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || undefined;
  const navigate = useNavigate();
  const { login, pendingIntent, setPendingIntent, toggleWishlist, addToCart } = useStore();

  const [values, setValues] = useState<FormValues>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
    navigate(redirect || "/account");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
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
    const res = await login(result.data.email, result.data.password);
    setLoading(false);
    if (!res.ok || !res.user) {
      setFormError(res.error ?? "Unable to sign in.");
      return;
    }
    toast.success(`Welcome back, ${res.user.firstName}`);
    resolveIntentAndNavigate(res.user.role);
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
          <div className="w-full max-w-sm">
            <p className="eyebrow text-muted-foreground">Welcome back</p>
            <h1 className="mt-2 text-3xl">Sign in</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Access your orders, wishlist and saved addresses.
            </p>

            {formError && (
              <div
                role="alert"
                className="mt-6 border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              >
                {formError}
              </div>
            )}

            <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="mt-1.5 rounded-none"
                  value={values.email}
                  onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1.5 text-xs text-destructive">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-muted-foreground link-underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative mt-1.5">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className="rounded-none pr-10"
                    value={values.password}
                    onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="mt-1.5 text-xs text-destructive">
                    {errors.password}
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
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              New to Bansal-nx?{" "}
              <Link
                to={redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : "/register"}
                className="text-foreground link-underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

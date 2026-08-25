import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandMark } from "@/components/brand/BrandMark";
import { useStore } from "@/lib/store";

import hero from "@/assets/collection-2.jpg";

const schema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required").max(60, "Too long"),
    lastName: z.string().trim().min(1, "Last name is required").max(60, "Too long"),
    email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
    phone: z.string().trim().min(10, "Enter a valid phone number").max(15, "Too long"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    terms: z.literal(true, { errorMap: () => ({ message: "You must accept the Terms of Service" }) }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;
type FormErrors = Partial<Record<keyof FormValues, string>>;

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || undefined;
  const navigate = useNavigate();
  const { register, pendingIntent, setPendingIntent, toggleWishlist, addToCart } = useStore();

  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: false as boolean,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function resolveIntentAndNavigate(role: string) {
    if (pendingIntent) {
      if (pendingIntent.type === "wishlist" && pendingIntent.productId) {
        toggleWishlist(pendingIntent.productId);
        toast.success("Added to your wishlist");
      } else if (pendingIntent.type === "cart" && pendingIntent.productId && pendingIntent.variant) {
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

  function handleSubmit(e: React.FormEvent) {
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
    window.setTimeout(() => {
      const res = register({
        firstName: result.data.firstName,
        lastName: result.data.lastName,
        email: result.data.email,
        phone: result.data.phone,
        password: result.data.password,
      });
      setLoading(false);
      if (!res.ok || !res.user) {
        setFormError(res.error ?? "Unable to create your account.");
        return;
      }
      toast.success(`Welcome to Bansal-nx, ${res.user.firstName}`);
      resolveIntentAndNavigate(res.user.role);
    }, 500);
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src={hero} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-ink/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-10 text-center">
          <BrandMark size="lg" tone="onDark" withTagline />
        </div>
      </div>

      <div className="flex items-center justify-center bg-background px-5 py-16 sm:px-10">
        <div className="w-full max-w-md">
          <p className="eyebrow text-muted-foreground">Join us</p>
          <h1 className="mt-2 text-3xl">Create an account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Faster checkout, order tracking and a saved wishlist.
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
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  autoComplete="given-name"
                  className="mt-1.5 rounded-none"
                  value={values.firstName}
                  onChange={(e) => setValues((v) => ({ ...v, firstName: e.target.value }))}
                  aria-invalid={!!errors.firstName}
                  aria-describedby={errors.firstName ? "firstName-error" : undefined}
                />
                {errors.firstName && (
                  <p id="firstName-error" className="mt-1.5 text-xs text-destructive">{errors.firstName}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  autoComplete="family-name"
                  className="mt-1.5 rounded-none"
                  value={values.lastName}
                  onChange={(e) => setValues((v) => ({ ...v, lastName: e.target.value }))}
                  aria-invalid={!!errors.lastName}
                  aria-describedby={errors.lastName ? "lastName-error" : undefined}
                />
                {errors.lastName && (
                  <p id="lastName-error" className="mt-1.5 text-xs text-destructive">{errors.lastName}</p>
                )}
              </div>
            </div>

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
              {errors.email && <p id="email-error" className="mt-1.5 text-xs text-destructive">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                className="mt-1.5 rounded-none"
                value={values.phone}
                onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "phone-error" : undefined}
              />
              {errors.phone && <p id="phone-error" className="mt-1.5 text-xs text-destructive">{errors.phone}</p>}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
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
              {errors.password && <p id="password-error" className="mt-1.5 text-xs text-destructive">{errors.password}</p>}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                className="mt-1.5 rounded-none"
                value={values.confirmPassword}
                onChange={(e) => setValues((v) => ({ ...v, confirmPassword: e.target.value }))}
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
              />
              {errors.confirmPassword && (
                <p id="confirmPassword-error" className="mt-1.5 text-xs text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            <div>
              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="terms"
                  checked={values.terms}
                  onCheckedChange={(c) => setValues((v) => ({ ...v, terms: c === true }))}
                  aria-invalid={!!errors.terms}
                  aria-describedby={errors.terms ? "terms-error" : undefined}
                  className="mt-0.5"
                />
                <Label htmlFor="terms" className="text-sm font-normal leading-snug text-muted-foreground">
                  I agree to the{" "}
                  <Link to="/terms" className="text-foreground link-underline">
                    Terms of Service
                  </Link>
                </Label>
              </div>
              {errors.terms && <p id="terms-error" className="mt-1.5 text-xs text-destructive">{errors.terms}</p>}
            </div>

            <Button type="submit" variant="luxe" size="luxe" className="w-full" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login"}
              className="text-foreground link-underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

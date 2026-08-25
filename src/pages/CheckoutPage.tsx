import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, ShoppingBag, XCircle } from "lucide-react";
import { z } from "zod";

import { EmptyState } from "@/components/common/SectionHeading";
import { BrandMark } from "@/components/brand/BrandMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatINR } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Address, PaymentMethod } from "@/data/types";

const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the recipient's full name"),
  phone: z.string().trim().min(8, "Enter a valid phone number"),
  line1: z.string().trim().min(4, "Enter the address"),
  locality: z.string().trim().min(2, "Enter the locality"),
  city: z.string().trim().min(2, "Enter the city"),
  state: z.string().trim().min(2, "Enter the state"),
  pincode: z.string().trim().min(4, "Enter a valid pincode"),
  country: z.string().trim().min(2, "Enter the country"),
});

type AddressForm = z.infer<typeof addressSchema>;
type AddressErrors = Partial<Record<keyof AddressForm, string>>;

const emptyAddressForm: AddressForm = {
  fullName: "",
  phone: "",
  line1: "",
  locality: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};

type PaymentState = "idle" | "processing" | "failed";

function ShellHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Link to="/">
          <BrandMark size="sm" />
        </Link>
        <Link
          to="/cart"
          className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground link-underline"
        >
          Return to bag
        </Link>
      </div>
    </header>
  );
}

function CheckoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ShellHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}

export function CheckoutPage() {
  const {
    isAuthenticated,
    user,
    cartLines,
    totals,
    settings,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    addAddress,
    placeOrder,
    setPendingIntent,
  } = useStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    user?.addresses.find((a) => a.isDefault)?.id ?? user?.addresses[0]?.id ?? null,
  );
  const [useNewAddress, setUseNewAddress] = useState(!user?.addresses.length);
  const [addressForm, setAddressForm] = useState<AddressForm>(emptyAddressForm);
  const [addressErrors, setAddressErrors] = useState<AddressErrors>({});
  const [saveNewAddress, setSaveNewAddress] = useState(true);

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("razorpay");
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [formError, setFormError] = useState<string | null>(null);

  const t = totals(paymentMethod);
  const codBlocked = !settings.codEnabled || t.total > settings.codMaxOrderValue;

  const resolvedAddress: Address | null = useMemo(() => {
    if (!useNewAddress) {
      return user?.addresses.find((a) => a.id === selectedAddressId) ?? null;
    }
    const parsed = addressSchema.safeParse(addressForm);
    if (!parsed.success) return null;
    return { id: "new", label: "Delivery", isDefault: false, ...parsed.data };
  }, [useNewAddress, selectedAddressId, addressForm, user]);

  function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    const result = applyCoupon(couponInput);
    if (!result.ok) {
      setCouponError(result.error ?? "That code isn't valid.");
      return;
    }
    setCouponError(null);
    setCouponInput("");
  }

  function validateAddressForm(): boolean {
    const parsed = addressSchema.safeParse(addressForm);
    if (parsed.success) {
      setAddressErrors({});
      return true;
    }
    const errs: AddressErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof AddressForm;
      errs[key] = issue.message;
    }
    setAddressErrors(errs);
    return false;
  }

  async function handlePlaceOrder() {
    setFormError(null);
    if (!email.trim() || !phone.trim()) {
      setFormError("Please provide contact details.");
      return;
    }
    let address: Address | null = null;
    if (useNewAddress) {
      if (!validateAddressForm()) return;
      const parsed = addressSchema.parse(addressForm);
      address = saveNewAddress
        ? addAddress({ label: "Delivery", ...parsed, isDefault: (user?.addresses.length ?? 0) === 0 })
        : { id: "guest-address", label: "Delivery", ...parsed, isDefault: false };
    } else {
      address = user?.addresses.find((a) => a.id === selectedAddressId) ?? null;
      if (!address) {
        setFormError("Please select or add a delivery address.");
        return;
      }
    }
    if (paymentMethod === "cod" && codBlocked) {
      setFormError("Cash on Delivery isn't available for this order.");
      return;
    }

    setPaymentState("processing");
    await new Promise((resolve) => setTimeout(resolve, 1600));

    const order = placeOrder({ address: address!, paymentMethod, email, phone });
    setPaymentState("idle");
    navigate(`/order/${order.id}`);
  }

  function simulateFailure() {
    setPaymentState("processing");
    setTimeout(() => setPaymentState("failed"), 1200);
  }

  if (!isAuthenticated) {
    return (
      <CheckoutShell>
        <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-5 text-center">
          <BrandMark size="md" />
          <h1 className="mt-8 font-display text-3xl">Sign in to check out</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Create an account or sign in to complete your order and track it with ease.
          </p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
            <Button
              asChild
              variant="luxe"
              size="luxe"
              className="flex-1"
              onClick={() =>
                setPendingIntent({ type: "checkout", returnTo: "/checkout" })
              }
            >
              <Link to="/login?redirect=/checkout">
                Login
              </Link>
            </Button>
            <Button
              asChild
              variant="luxeOutline"
              size="luxe"
              className="flex-1"
              onClick={() =>
                setPendingIntent({ type: "checkout", returnTo: "/checkout" })
              }
            >
              <Link to="/register?redirect=/checkout">
                Create Account
              </Link>
            </Button>
          </div>
        </div>
      </CheckoutShell>
    );
  }

  if (cartLines.length === 0) {
    return (
      <CheckoutShell>
        <div className="mx-auto max-w-lg px-5 py-24">
          <EmptyState
            icon={<ShoppingBag className="h-8 w-8" strokeWidth={1} />}
            title="Your bag is empty"
            description="Add something beautiful before you check out."
            action={
              <Button asChild variant="luxe" size="luxe">
                <Link to="/products">Shop the Collection</Link>
              </Button>
            }
          />
        </div>
      </CheckoutShell>
    );
  }

  return (
    <CheckoutShell>
      <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 lg:px-12">
        <h1 className="font-display text-3xl">Checkout</h1>

        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_400px]">
          <div className="space-y-10">
            {/* Contact */}
            <section aria-labelledby="contact-heading">
              <h2 id="contact-heading" className="eyebrow">Contact</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 rounded-none" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 rounded-none" />
                </div>
              </div>
            </section>

            {/* Delivery address */}
            <section aria-labelledby="address-heading">
              <h2 id="address-heading" className="eyebrow">Delivery Address</h2>
              <div className="mt-4 space-y-3">
                {(user?.addresses.length ?? 0) > 0 && (
                  <RadioGroup
                    value={useNewAddress ? "new" : selectedAddressId ?? ""}
                    onValueChange={(val) => {
                      if (val === "new") {
                        setUseNewAddress(true);
                      } else {
                        setUseNewAddress(false);
                        setSelectedAddressId(val);
                      }
                    }}
                  >
                    {user?.addresses.map((addr) => (
                      <label
                        key={addr.id}
                        htmlFor={`addr-${addr.id}`}
                        className="flex cursor-pointer items-start gap-3 border border-border p-4 has-[[data-state=checked]]:border-gold"
                      >
                        <RadioGroupItem value={addr.id} id={`addr-${addr.id}`} className="mt-1" />
                        <div className="text-sm">
                          <p className="uppercase tracking-[0.15em] text-[11px] text-muted-foreground">{addr.label}</p>
                          <p className="mt-1">{addr.fullName} · {addr.phone}</p>
                          <p className="text-muted-foreground">{addr.line1}, {addr.locality}, {addr.city}, {addr.state} {addr.pincode}</p>
                        </div>
                      </label>
                    ))}
                    <label
                      htmlFor="addr-new"
                      className="flex cursor-pointer items-center gap-3 border border-border p-4 has-[[data-state=checked]]:border-gold"
                    >
                      <RadioGroupItem value="new" id="addr-new" />
                      <span className="text-sm">Use a new address</span>
                    </label>
                  </RadioGroup>
                )}

                {useNewAddress && (
                  <div className="grid grid-cols-1 gap-4 border border-border p-5 sm:grid-cols-2">
                    <Field label="Full name" error={addressErrors.fullName}>
                      <Input value={addressForm.fullName} onChange={(e) => setAddressForm((p) => ({ ...p, fullName: e.target.value }))} className="rounded-none" />
                    </Field>
                    <Field label="Phone" error={addressErrors.phone}>
                      <Input value={addressForm.phone} onChange={(e) => setAddressForm((p) => ({ ...p, phone: e.target.value }))} className="rounded-none" />
                    </Field>
                    <Field label="Address line" error={addressErrors.line1} full>
                      <Input value={addressForm.line1} onChange={(e) => setAddressForm((p) => ({ ...p, line1: e.target.value }))} className="rounded-none" />
                    </Field>
                    <Field label="Locality" error={addressErrors.locality}>
                      <Input value={addressForm.locality} onChange={(e) => setAddressForm((p) => ({ ...p, locality: e.target.value }))} className="rounded-none" />
                    </Field>
                    <Field label="City" error={addressErrors.city}>
                      <Input value={addressForm.city} onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))} className="rounded-none" />
                    </Field>
                    <Field label="State" error={addressErrors.state}>
                      <Input value={addressForm.state} onChange={(e) => setAddressForm((p) => ({ ...p, state: e.target.value }))} className="rounded-none" />
                    </Field>
                    <Field label="Pincode" error={addressErrors.pincode}>
                      <Input value={addressForm.pincode} onChange={(e) => setAddressForm((p) => ({ ...p, pincode: e.target.value }))} className="rounded-none" />
                    </Field>
                    <Field label="Country" error={addressErrors.country}>
                      <Input value={addressForm.country} onChange={(e) => setAddressForm((p) => ({ ...p, country: e.target.value }))} className="rounded-none" />
                    </Field>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground sm:col-span-2">
                      <input
                        type="checkbox"
                        checked={saveNewAddress}
                        onChange={(e) => setSaveNewAddress(e.target.checked)}
                        className="h-3.5 w-3.5"
                      />
                      Save this address to my account
                    </label>
                  </div>
                )}
              </div>
            </section>

            {/* Delivery method */}
            <section aria-labelledby="delivery-heading">
              <h2 id="delivery-heading" className="eyebrow">Delivery Method</h2>
              <div className="mt-4 border border-gold/50 bg-gold/5 p-4">
                <p className="text-sm">Standard delivery — 5–8 business days</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Live courier rates and AWB creation will arrive with the Delhivery integration.
                </p>
              </div>
            </section>

            {/* Coupon */}
            <section aria-labelledby="coupon-heading">
              <h2 id="coupon-heading" className="eyebrow">Coupon</h2>
              <div className="mt-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between border border-gold/40 bg-gold/5 px-3 py-2">
                    <span className="text-sm">{appliedCoupon.code} applied</span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground underline underline-offset-2"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="Enter code" className="rounded-none" />
                    <Button type="button" variant="luxeOutline" size="luxeSm" onClick={handleApplyCoupon}>
                      Apply
                    </Button>
                  </div>
                )}
                {couponError && <p className="mt-2 text-xs text-destructive">{couponError}</p>}
              </div>
            </section>

            {/* Payment method */}
            <section aria-labelledby="payment-heading">
              <h2 id="payment-heading" className="eyebrow">Payment Method</h2>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                className="mt-4"
              >
                <label htmlFor="pay-razorpay" className="flex cursor-pointer items-start gap-3 border border-border p-4 has-[[data-state=checked]]:border-gold">
                  <RadioGroupItem value="razorpay" id="pay-razorpay" className="mt-1" />
                  <div className="text-sm">
                    <p>Razorpay</p>
                    <p className="text-muted-foreground">Pay securely by card, UPI or netbanking</p>
                  </div>
                </label>
                <label
                  htmlFor="pay-cod"
                  className="flex cursor-pointer items-start gap-3 border border-border p-4 has-[[data-state=checked]]:border-gold aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
                  aria-disabled={codBlocked}
                >
                  <RadioGroupItem value="cod" id="pay-cod" className="mt-1" disabled={codBlocked} />
                  <div className="text-sm">
                    <p>Cash on Delivery</p>
                    <p className="text-muted-foreground">
                      Pay when your order is delivered · fee {formatINR(settings.codFee)}
                    </p>
                    {codBlocked && (
                      <p className="mt-1 text-[11px] text-destructive">
                        {!settings.codEnabled
                          ? "Cash on Delivery is currently unavailable."
                          : `Not available above ${formatINR(settings.codMaxOrderValue)}.`}
                      </p>
                    )}
                  </div>
                </label>
              </RadioGroup>
            </section>

            {formError && <p className="text-sm text-destructive">{formError}</p>}
          </div>

          {/* Order summary */}
          <aside className="lg:sticky lg:top-10 lg:h-fit">
            <div className="border border-border bg-card p-6 sm:p-8">
              <h2 className="font-display text-xl">Order Summary</h2>
              <ul className="mt-6 space-y-4">
                {cartLines.map((line) => (
                  <li key={line.variantId} className="flex gap-3">
                    <img src={line.product.images[0]} alt={line.product.name} className="h-16 w-13 shrink-0 object-cover" />
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="truncate">{line.product.name}</p>
                      <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                        {line.size} · {line.colour} · Qty {line.quantity}
                      </p>
                    </div>
                    <span className="text-sm">{formatINR(line.lineTotal)}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-6 space-y-3 border-t border-border pt-6 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>{formatINR(t.subtotal)}</dd>
                </div>
                {t.discount > 0 && (
                  <div className="flex justify-between text-gold-deep">
                    <dt>Discount</dt>
                    <dd>-{formatINR(t.discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd>{t.shippingFee === 0 ? "Complimentary" : formatINR(t.shippingFee)}</dd>
                </div>
                {paymentMethod === "cod" && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">COD fee</dt>
                    <dd>{formatINR(t.codFee)}</dd>
                  </div>
                )}
              </dl>
              <div className="mt-6 flex justify-between border-t border-border pt-6 text-base">
                <span>Total</span>
                <span>{formatINR(t.total)}</span>
              </div>

              <Button
                variant="luxe"
                size="luxe"
                className="mt-8 w-full"
                onClick={handlePlaceOrder}
                disabled={paymentState === "processing"}
              >
                {paymentMethod === "razorpay"
                  ? `Pay ${formatINR(t.total)} securely`
                  : "Place order — Cash on Delivery"}
              </Button>

              <button
                type="button"
                onClick={simulateFailure}
                className="mt-4 w-full text-center text-[11px] uppercase tracking-[0.18em] text-muted-foreground underline underline-offset-2"
              >
                Simulate payment failure (demo)
              </button>
            </div>
          </aside>
        </div>
      </div>

      {paymentState === "processing" && (
        <div role="status" aria-live="polite" className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm">
          <div className="mx-4 max-w-sm border border-border bg-background p-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-gold" />
            <h3 className="mt-5 font-display text-xl">Processing your payment</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              The Razorpay checkout would open here. Success is confirmed server-side once
              payment settles — never asserted from the browser.
            </p>
          </div>
        </div>
      )}

      {paymentState === "failed" && (
        <div role="alertdialog" aria-live="assertive" className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm">
          <div className="mx-4 max-w-sm border border-destructive/40 bg-background p-8 text-center">
            <XCircle className="mx-auto h-8 w-8 text-destructive" />
            <h3 className="mt-5 font-display text-xl">We couldn't complete your payment.</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              This is a demo failure state. No charge was made.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button variant="luxe" size="luxeSm" className="flex-1" onClick={() => setPaymentState("idle")}>
                Try Again
              </Button>
              <Button
                variant="luxeOutline"
                size="luxeSm"
                className="flex-1"
                onClick={() => {
                  setPaymentState("idle");
                  setPaymentMethod(paymentMethod === "razorpay" ? "cod" : "razorpay");
                }}
              >
                Choose another method
              </Button>
            </div>
          </div>
        </div>
      )}
    </CheckoutShell>
  );
}

function Field({
  label,
  error,
  full,
  children,
}: {
  label: string;
  error?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <Label>{label}</Label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

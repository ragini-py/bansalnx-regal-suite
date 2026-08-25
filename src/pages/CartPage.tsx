import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";

import { Breadcrumbs, PageHeader, SiteLayout } from "@/components/storefront/SiteLayout";
import { EmptyState } from "@/components/common/SectionHeading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatINR } from "@/lib/format";
import { useStore } from "@/lib/store";

export function CartPage() {
  const {
    cartLines,
    updateQuantity,
    removeFromCart,
    toggleWishlist,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    totals,
    settings,
  } = useStore();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const t = totals();

  function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    const result = applyCoupon(couponInput);
    if (!result.ok) {
      setCouponError(result.error ?? "That code isn't valid.");
      return;
    }
    setCouponError(null);
    setCouponInput("");
    toast.success("Coupon applied");
  }

  function handleMoveToWishlist(productId: string, variantId: string, name: string) {
    toggleWishlist(productId);
    removeFromCart(variantId);
    toast.success(`${name} moved to your wishlist`);
  }

  return (
    <SiteLayout>
      <PageHeader
        breadcrumb={
          <Breadcrumbs items={[{ label: "Home", href: <Link to="/">Home</Link> }, { label: "Bag" }]} />
        }
        title="Your Bag"
        description={cartLines.length ? `${cartLines.length} ${cartLines.length === 1 ? "piece" : "pieces"} awaiting checkout.` : undefined}
      />

      <div className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8 lg:px-12">
        {cartLines.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="h-8 w-8" strokeWidth={1} />}
            title="Your bag is waiting."
            description="Nothing here yet. Explore the atelier and add a piece you'll keep for a lifetime."
            action={
              <Button asChild variant="luxe" size="luxe">
                <Link to="/products">Shop the Collection</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px]">
            <ul className="divide-y divide-border border-y border-border">
              {cartLines.map((line) => (
                <li key={line.variantId} className="flex gap-5 py-7">
                  <Link to={`/products/${line.product.slug}`} className="shrink-0">
                    <img
                      src={line.product.images[0]}
                      alt={line.product.name}
                      width={1000}
                      height={1300}
                      loading="lazy"
                      className="h-36 w-28 object-cover sm:h-44 sm:w-32"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          to={`/products/${line.product.slug}`}
                          className="font-display text-lg link-underline"
                        >
                          {line.product.name}
                        </Link>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                          {line.size} · {line.colour}
                        </p>
                        <p className="mt-2 text-sm">{formatINR(line.product.price)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(line.variantId)}
                        aria-label={`Remove ${line.product.name} from bag`}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {!line.available && (
                      <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-destructive">
                        This variant is no longer available — please remove it to continue.
                      </p>
                    )}

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-5">
                      <div className="flex items-center border border-border">
                        <button
                          type="button"
                          onClick={() => updateQuantity(line.variantId, line.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="grid h-9 w-9 place-items-center transition-colors hover:bg-muted"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-9 text-center text-sm">{line.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(line.variantId, line.quantity + 1)}
                          aria-label="Increase quantity"
                          className="grid h-9 w-9 place-items-center transition-colors hover:bg-muted"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleMoveToWishlist(line.productId, line.variantId, line.product.name)}
                        className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-gold-deep"
                      >
                        <Heart className="h-3.5 w-3.5" /> Move to wishlist
                      </button>
                      <span className="ml-auto text-sm">{formatINR(line.lineTotal)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="lg:sticky lg:top-24 lg:h-fit">
              <div className="border border-border bg-card p-6 sm:p-8">
                <h2 className="font-display text-xl">Order Summary</h2>

                <div className="mt-6">
                  <label htmlFor="coupon" className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Coupon code
                  </label>
                  {appliedCoupon ? (
                    <div className="mt-2 flex items-center justify-between border border-gold/40 bg-gold/5 px-3 py-2">
                      <span className="text-sm">{appliedCoupon.code} applied</span>
                      <button
                        type="button"
                        onClick={() => {
                          removeCoupon();
                          toast.success("Coupon removed");
                        }}
                        className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground underline underline-offset-2"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="mt-2 flex gap-2">
                      <Input
                        id="coupon"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Enter code"
                        className="rounded-none"
                      />
                      <Button type="button" variant="luxeOutline" size="luxeSm" onClick={handleApplyCoupon}>
                        Apply
                      </Button>
                    </div>
                  )}
                  {couponError && <p className="mt-2 text-xs text-destructive">{couponError}</p>}
                </div>

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
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Tax</dt>
                    <dd>Included</dd>
                  </div>
                </dl>

                {t.shippingFee > 0 && (
                  <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                    Add {formatINR(settings.freeShippingThreshold - t.subtotal + t.discount)} more for
                    complimentary shipping.
                  </p>
                )}

                <div className="mt-6 flex justify-between border-t border-border pt-6 text-base">
                  <span>Total</span>
                  <span>{formatINR(t.total)}</span>
                </div>

                <Button asChild variant="luxe" size="luxe" className="mt-8 w-full">
                  <Link to="/checkout">Proceed to Checkout</Link>
                </Button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}

import { Link } from "react-router-dom";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";

import { EmptyState } from "@/components/common/SectionHeading";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatINR } from "@/lib/format";
import { useStore } from "@/lib/store";

export function CartDrawer() {
  const {
    cartDrawerOpen,
    setCartDrawerOpen,
    cartLines,
    updateQuantity,
    removeFromCart,
    totals,
    settings,
  } = useStore();
  const t = totals();
  const hasUnavailable = cartLines.some((l) => !l.available);

  return (
    <Sheet open={cartDrawerOpen} onOpenChange={setCartDrawerOpen}>
      <SheetContent className="flex w-full flex-col gap-0 border-border bg-background p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-4 py-4 sm:px-6 sm:py-5">
          <SheetTitle className="text-left font-display text-lg sm:text-xl font-light">
            Your bag
            <span className="ml-2 text-xs tracking-[0.2em] text-muted-foreground">
              {cartLines.length} {cartLines.length === 1 ? "item" : "items"}
            </span>
          </SheetTitle>
        </SheetHeader>

        {/* Complimentary Shipping Progress Bar */}
        {cartLines.length > 0 && (
          <div className="border-b border-border/80 bg-[#fcf9f2] px-4 py-2.5 sm:px-6 sm:py-3">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700">
              <span className="truncate pr-2">
                {t.shippingFee === 0 ? (
                  <span className="text-[#a97b41] font-semibold">
                    Complimentary luxury delivery unlocked
                  </span>
                ) : (
                  <span>
                    Add{" "}
                    <strong className="text-[#a97b41] font-semibold">
                      {formatINR(settings.freeShippingThreshold - t.subtotal)}
                    </strong>{" "}
                    for free shipping
                  </span>
                )}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                {Math.min(100, Math.round((t.subtotal / (settings.freeShippingThreshold || 1)) * 100))}%
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-gradient-to-r from-[#d8b378] to-[#a97b41] transition-all duration-700 ease-out"
                style={{
                  width: `${Math.min(100, Math.round((t.subtotal / (settings.freeShippingThreshold || 1)) * 100))}%`,
                }}
              />
            </div>
          </div>
        )}

        {cartLines.length === 0 ? (
          <div className="flex flex-1 items-center px-6">
            <div className="w-full">
              <EmptyState
                icon={<ShoppingBag className="h-7 w-7" strokeWidth={1} />}
                title="Your bag is empty"
                description="Nothing here yet. Explore our collection and add a handcrafted piece you'll cherish."
                action={
                  <Button asChild variant="luxe" size="lg" onClick={() => setCartDrawerOpen(false)}>
                    <Link to="/products">Shop the collection</Link>
                  </Button>
                }
              />
            </div>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-4 sm:px-6">
              {cartLines.map((line, idx) => (
                <li
                  key={line.variantId}
                  style={{ animationDelay: `${idx * 60}ms` }}
                  className="flex gap-3 py-4 sm:gap-4 sm:py-5 animate-fade-up"
                >
                  <Link
                    to={`/products/${line.product.slug}`}
                    onClick={() => setCartDrawerOpen(false)}
                    className="shrink-0 overflow-hidden rounded-xs"
                  >
                    <img
                      src={line.product.images[0]}
                      alt={line.product.name}
                      width={1000}
                      height={1300}
                      loading="lazy"
                      className="h-24 w-18 sm:h-28 sm:w-22 object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-display text-sm sm:text-base">{line.product.name}</p>
                        <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:text-[11px]">
                          {line.size} · {line.colour}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(line.variantId)}
                        aria-label={`Remove ${line.product.name}`}
                        className="p-1 text-muted-foreground transition-all hover:text-destructive active:scale-90"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {!line.available && (
                      <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-destructive">
                        No longer available
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center border border-border">
                        <button
                          type="button"
                          onClick={() => updateQuantity(line.variantId, line.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center transition-all hover:bg-muted active:scale-90"
                        >
                          <Minus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        </button>
                        <span className="w-7 sm:w-8 text-center text-xs sm:text-sm font-medium">{line.quantity}</span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(line.variantId, Math.min(10, line.quantity + 1))
                          }
                          disabled={line.quantity >= 10}
                          aria-label="Increase quantity"
                          className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center transition-all hover:bg-muted active:scale-90 disabled:opacity-40 disabled:hover:bg-transparent"
                        >
                          <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        </button>
                      </div>
                      <span className="text-xs sm:text-sm font-medium">{formatINR(line.lineTotal)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-border px-4 py-4 sm:px-6 sm:py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatINR(t.subtotal)}</span>
              </div>
              <p className="mt-1.5 text-[10px] sm:text-[11px] leading-relaxed text-muted-foreground">
                {t.shippingFee === 0
                  ? "Complimentary shipping applied."
                  : `Shipping ${formatINR(t.shippingFee)} — free above ${formatINR(settings.freeShippingThreshold)}.`}{" "}
                Taxes calculated at checkout.
              </p>
              <div className="mt-4 flex flex-col gap-2.5">
                {hasUnavailable ? (
                  <Button asChild variant="luxe" size="sm" className="h-10 text-xs">
                    <Link to="/cart" onClick={() => setCartDrawerOpen(false)}>
                      Review bag (unavailable items)
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="luxe" size="sm" className="h-10 text-xs font-medium">
                    <Link to="/checkout" onClick={() => setCartDrawerOpen(false)}>
                      Proceed to checkout
                    </Link>
                  </Button>
                )}
                <Button asChild variant="luxeOutline" size="sm" className="h-10 text-xs">
                  <Link to="/cart" onClick={() => setCartDrawerOpen(false)}>
                    View bag
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

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

  return (
    <Sheet open={cartDrawerOpen} onOpenChange={setCartDrawerOpen}>
      <SheetContent className="flex w-full flex-col gap-0 border-border bg-background p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-6 py-5">
          <SheetTitle className="text-left font-display text-xl font-light">
            Your bag
            <span className="ml-2 text-xs tracking-[0.2em] text-muted-foreground">
              {cartLines.length} {cartLines.length === 1 ? "item" : "items"}
            </span>
          </SheetTitle>
        </SheetHeader>

        {cartLines.length === 0 ? (
          <div className="flex flex-1 items-center px-6">
            <div className="w-full">
              <EmptyState
                icon={<ShoppingBag className="h-7 w-7" strokeWidth={1} />}
                title="Your bag is waiting."
                description="Nothing here yet. Explore the atelier and add a piece you'll keep."
                action={
                  <Button asChild variant="luxe" size="luxe" onClick={() => setCartDrawerOpen(false)}>
                    <Link to="/products">Shop the collection</Link>
                  </Button>
                }
              />
            </div>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-6">
              {cartLines.map((line) => (
                <li key={line.variantId} className="flex gap-4 py-5">
                  <Link
                    to={`/products/${line.product.slug}`}
                    onClick={() => setCartDrawerOpen(false)}
                    className="shrink-0"
                  >
                    <img
                      src={line.product.images[0]}
                      alt={line.product.name}
                      width={1000}
                      height={1300}
                      loading="lazy"
                      className="h-28 w-22 object-cover"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-display text-base">{line.product.name}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                          {line.size} · {line.colour}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(line.variantId)}
                        aria-label={`Remove ${line.product.name}`}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    {!line.available && (
                      <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-destructive">
                        No longer available
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="flex items-center border border-border">
                        <button
                          type="button"
                          onClick={() => updateQuantity(line.variantId, line.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="grid h-8 w-8 place-items-center transition-colors hover:bg-muted"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm">{line.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(line.variantId, line.quantity + 1)}
                          aria-label="Increase quantity"
                          className="grid h-8 w-8 place-items-center transition-colors hover:bg-muted"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-sm">{formatINR(line.lineTotal)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-border px-6 py-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatINR(t.subtotal)}</span>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                {t.shippingFee === 0
                  ? "Complimentary shipping applied."
                  : `Shipping ${formatINR(t.shippingFee)} — complimentary above ${formatINR(settings.freeShippingThreshold)}.`}{" "}
                Taxes calculated at checkout.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <Button asChild variant="luxe" size="luxe">
                  <Link to="/checkout" onClick={() => setCartDrawerOpen(false)}>
                    Proceed to checkout
                  </Link>
                </Button>
                <Button asChild variant="luxeOutline" size="luxe">
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

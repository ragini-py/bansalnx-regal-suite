import { Link, useLocation } from "react-router-dom";
import { Eye, Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AuthPromptDialog } from "@/components/storefront/AuthPromptDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Product } from "@/data/types";
import { discountPercent, formatINR } from "@/lib/format";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const badgeLabel: Record<string, string> = {
  new: "New",
  bestseller: "Bestseller",
  exclusive: "Exclusive",
};

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { isWishlisted, toggleWishlist, isAuthenticated, setPendingIntent, addToCart, setCartDrawerOpen } = useStore();
  const location = useLocation();
  const [promptOpen, setPromptOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? "M");
  const [selectedColour, setSelectedColour] = useState(product.colours[0] ?? "");

  const saved = isWishlisted(product.id);
  const off = discountPercent(product.mrp, product.price);
  const soldOut = product.variants.every((v) => v.availability === "unavailable");

  function onWishlist(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!isAuthenticated) {
      setPendingIntent({
        type: "wishlist",
        productId: product.id,
        returnTo: location.pathname + location.search,
      });
      setPromptOpen(true);
      return;
    }
    const result = toggleWishlist(product.id);
    toast.success(result === "added" ? "Saved to wishlist" : "Removed from wishlist", {
      description: product.name,
    });
  }

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product.id,
      size: selectedSize,
      colour: selectedColour,
      quantity: 1,
    });
    setCartDrawerOpen(true);
    setQuickAddOpen(false);
    toast.success("Added to your bag", {
      description: `${product.name} — ${selectedColour}, ${selectedSize}`,
    });
  }

  return (
    <>
      <article className="group relative flex flex-col">
        <div className="relative overflow-hidden bg-muted">
          <Link
            to={`/products/${product.slug}`}
            className="block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
            aria-label={product.name}
          >
            <img
              src={product.images[0]}
              alt={product.name}
              width={1000}
              height={1300}
              loading={priority ? "eager" : "lazy"}
              className="aspect-4/5 w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
            />
            {product.images[1] && (
              <img
                src={product.images[1]}
                alt=""
                aria-hidden="true"
                width={1000}
                height={1300}
                loading="lazy"
                className="absolute inset-0 aspect-4/5 w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              />
            )}
            {product.badge && (
              <span className="absolute left-3 top-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-800 rounded-md shadow-xs border border-slate-200/60">
                {badgeLabel[product.badge]}
              </span>
            )}
            {soldOut && (
              <span className="absolute bottom-0 left-0 right-0 bg-slate-950/80 py-2 text-center text-xs font-semibold uppercase tracking-wider text-white">
                Currently unavailable
              </span>
            )}
          </Link>

          {/* Quick Add Overlay on Hover */}
          {!soldOut && (
            <div className="absolute inset-x-3 bottom-3 hidden sm:flex opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">
              <button
                type="button"
                onClick={() => setQuickAddOpen(true)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 px-3 text-xs font-semibold rounded-lg shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="h-3.5 w-3.5" /> Quick Add
              </button>
            </div>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={onWishlist}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          aria-pressed={saved}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-slate-700 shadow-sm transition-transform duration-200 hover:bg-white hover:scale-105"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              saved ? "fill-rose-500 text-rose-500" : "text-slate-700",
            )}
          />
        </button>

        {/* Card Details */}
        <div className="mt-3 flex flex-col gap-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
            {product.category}
          </p>
          <Link
            to={`/products/${product.slug}`}
            className="self-start font-sans font-medium text-sm text-slate-900 hover:text-amber-800 transition-colors line-clamp-1"
          >
            {product.name}
          </Link>
          <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-sm font-bold text-slate-900">{formatINR(product.price)}</span>
            {off > 0 && (
              <>
                <span className="text-xs text-slate-400 line-through">
                  {formatINR(product.mrp)}
                </span>
                <span className="text-xs font-semibold text-emerald-600">{off}% off</span>
              </>
            )}
          </div>
        </div>
      </article>

      {/* Quick Add Modal */}
      {quickAddOpen && (
        <Dialog open={quickAddOpen} onOpenChange={setQuickAddOpen}>
          <DialogContent className="max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <DialogHeader>
              <DialogTitle className="font-sans font-bold text-lg text-slate-900">{product.name}</DialogTitle>
              <DialogDescription className="text-xs font-medium text-slate-500">{product.category} · {formatINR(product.price)}</DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="flex gap-4">
                <img src={product.images[0]} alt={product.name} className="h-24 w-20 object-cover rounded-lg border border-slate-200 shrink-0" />
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1.5">Select Colour</p>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {product.colours.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setSelectedColour(c)}
                          className={cn(
                            "border px-2.5 py-1 text-xs transition-colors",
                            selectedColour === c ? "border-gold bg-gold text-ink font-medium" : "border-border hover:border-foreground/50",
                          )}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Select Size</p>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {product.sizes.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedSize(s)}
                          className={cn(
                            "border px-2.5 py-1 text-xs transition-colors",
                            selectedSize === s ? "border-gold bg-gold text-ink font-medium" : "border-border hover:border-foreground/50",
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <Button variant="luxe" className="flex-1" onClick={handleQuickAdd}>
                  Add to Bag — {formatINR(product.price)}
                </Button>
                <Button asChild variant="luxeOutline">
                  <Link to={`/products/${product.slug}`}>Full Details</Link>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <AuthPromptDialog open={promptOpen} onOpenChange={setPromptOpen} intent="wishlist" />
    </>
  );
}

export function ProductGrid({
  products,
  columns = 4,
}: {
  products: Product[];
  columns?: 3 | 4;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 sm:gap-y-14",
        columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3",
      )}
    >
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} priority={i < 2} />
      ))}
    </div>
  );
}

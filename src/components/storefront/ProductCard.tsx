import { Link, useLocation } from "react-router-dom";
import { Heart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AuthPromptDialog } from "@/components/storefront/AuthPromptDialog";
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
  const { isWishlisted, toggleWishlist, isAuthenticated, setPendingIntent } = useStore();
  const location = useLocation();
  const [promptOpen, setPromptOpen] = useState(false);
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

  return (
    <>
      <article className="group relative flex flex-col">
        <Link
          to={`/products/${product.slug}`}
          className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
          aria-label={product.name}
        >
          <div className="relative overflow-hidden bg-muted">
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
              <span className="absolute left-0 top-4 bg-ivory/95 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-ink">
                {badgeLabel[product.badge]}
              </span>
            )}
            {soldOut && (
              <span className="absolute bottom-0 left-0 right-0 bg-ink/70 py-2 text-center text-[10px] uppercase tracking-[0.22em] text-ivory">
                Currently unavailable
              </span>
            )}
          </div>
        </Link>

        <button
          type="button"
          onClick={onWishlist}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          aria-pressed={saved}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center bg-ivory/85 text-ink opacity-100 transition-all duration-300 hover:bg-ivory focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold sm:opacity-0 sm:group-hover:opacity-100"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-transform duration-300",
              saved ? "fill-gold text-gold scale-110" : "text-ink",
            )}
          />
        </button>

        <div className="mt-4 flex flex-col gap-1.5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {product.category}
          </p>
          <Link
            to={`/products/${product.slug}`}
            className="link-underline self-start font-display text-lg leading-snug"
          >
            {product.name}
          </Link>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-sm tracking-wide">{formatINR(product.price)}</span>
            {off > 0 && (
              <>
                <span className="text-xs text-muted-foreground line-through">
                  {formatINR(product.mrp)}
                </span>
                <span className="text-xs text-gold-deep">{off}% off</span>
              </>
            )}
          </div>
        </div>
      </article>

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

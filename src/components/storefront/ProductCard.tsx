import { Link, useLocation } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "@/lib/toast";

import { AuthPromptDialog } from "@/components/storefront/AuthPromptDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getProductImagesForColour, isVariantAvailable } from "@/data/catalog";
import type { Product } from "@/data/types";
import { discountPercent, formatINR } from "@/lib/format";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const badgeLabel: Record<string, string> = {
  new: "New",
  bestseller: "Bestseller",
  exclusive: "Exclusive",
};

const colourMap: Record<string, string> = {
  ivory: "#fdfbf7",
  cream: "#fffdd0",
  gold: "#d4af37",
  rose: "#e8a598",
  peach: "#f8cbb6",
  pink: "#f4a6b8",
  emerald: "#2d5a43",
  sapphire: "#2b4c7e",
  ruby: "#9b111e",
  black: "#1c1917",
  white: "#ffffff",
  beige: "#f5f0e6",
  maroon: "#6b1724",
  yellow: "#eedc82",
  green: "#3b5323",
  red: "#a52a2a",
  blue: "#4682b4",
  silver: "#c0c0c0",
  rust: "#b7410e",
  plum: "#5e2a40",
  teal: "#005f73",
  sage: "#9caf88",
  wine: "#722f37",
  navy: "#1b2a47",
  mustard: "#e1ad01",
  blush: "#f7cfcf",
  "pearl grey": "#c5c6c7",
  "royal purple": "#602b7a",
  "peacock teal": "#0d6970",
  "antique gold": "#cda14d",
  "leaf green": "#5b7e47",
  "antique rose": "#c48888",
};

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const {
    isWishlisted,
    toggleWishlist,
    isAuthenticated,
    setPendingIntent,
    addToCart,
    setCartDrawerOpen,
  } = useStore();
  const location = useLocation();
  const [promptOpen, setPromptOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [activeColour, setActiveColour] = useState(product.colours[0] ?? "");
  const [selectedColour, setSelectedColour] = useState(product.colours[0] ?? "");
  const [selectedSize, setSelectedSize] = useState("");

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const carouselIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const images = getProductImagesForColour(product, activeColour);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (carouselIntervalRef.current) clearInterval(carouselIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [product.id]);

  function handleMouseEnter() {
    if (images.length <= 1) return;
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (carouselIntervalRef.current) clearInterval(carouselIntervalRef.current);

    // Wait 2 seconds before starting the carousel in cyclic order
    hoverTimerRef.current = setTimeout(() => {
      setActiveImageIndex((prev) => (prev + 1) % images.length);
      carouselIntervalRef.current = setInterval(() => {
        setActiveImageIndex((prev) => (prev + 1) % images.length);
      }, 2000);
    }, 2000);
  }

  function handleMouseLeave() {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    if (carouselIntervalRef.current) {
      clearInterval(carouselIntervalRef.current);
      carouselIntervalRef.current = null;
    }
    setActiveImageIndex(0);
  }

  const saved = isWishlisted(product.id);
  const off = discountPercent(product.mrp, product.price);
  const soldOut = product.variants.every((v) => v.availability === "unavailable");
  const selectedAvailable = selectedSize
    ? isVariantAvailable(product, selectedSize, selectedColour)
    : false;

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
    if (!selectedSize || !selectedAvailable) return;
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
      <article
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="group relative flex flex-col rounded-xl sm:rounded-2xl border border-[#ebe0cf]/80 bg-[#fdfbf7]/90 p-1.5 sm:p-2.5 shadow-[0_4px_20px_-10px_rgba(45,35,28,0.06)] backdrop-blur-xs transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] sm:hover:-translate-y-1.5 sm:hover:scale-[1.025] hover:shadow-[0_22px_45px_-15px_rgba(42,32,22,0.16)] hover:border-[#d9c4a4] shimmer-hover"
      >
        <div className="relative aspect-4/5 w-full overflow-hidden rounded-lg sm:rounded-xl bg-[#f5ede2]/40">
          <Link
            to={`/products/${product.slug}${activeColour ? `?colour=${encodeURIComponent(activeColour)}` : ""}`}
            className="relative block h-full w-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#c6903c]"
            aria-label={product.name}
          >
            {images.map((imgSrc, idx) => (
              <img
                key={idx}
                src={imgSrc}
                alt={idx === 0 ? product.name : ""}
                aria-hidden={idx !== activeImageIndex}
                width={1000}
                height={1300}
                loading={priority && idx === 0 ? "eager" : "lazy"}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = idx % 2 === 0 ? "/products/p1.jpg" : "/products/p2.jpg";
                }}
                className={cn(
                  "absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out",
                  idx === activeImageIndex
                    ? "opacity-100 scale-[1.02]"
                    : "opacity-0 scale-100 pointer-events-none",
                )}
              />
            ))}
            {soldOut && (
              <span className="absolute bottom-0 left-0 right-0 z-10 bg-neutral-950/85 py-1 text-center text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-white backdrop-blur-xs">
                Currently unavailable
              </span>
            )}
          </Link>

          {/* Subtle Carousel Indicators (visible when cycling multi-image dresses) */}
          {images.length > 1 && (
            <div className="absolute top-2 inset-x-0 flex justify-center items-center gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none z-10">
              {images.map((_, dotIdx) => (
                <span
                  key={dotIdx}
                  className={cn(
                    "h-1 rounded-full transition-all duration-400",
                    dotIdx === activeImageIndex
                      ? "w-3 bg-white shadow-xs"
                      : "w-1 bg-white/45 backdrop-blur-xs",
                  )}
                />
              ))}
            </div>
          )}

          {/* Floating Wishlist Heart Button - High z-index & touch target */}
          <button
            type="button"
            onClick={onWishlist}
            aria-label={
              saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`
            }
            aria-pressed={saved}
            className="absolute right-1.5 top-1.5 sm:right-2.5 sm:top-2.5 z-20 grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full border border-white/60 bg-white/80 text-neutral-700 shadow-sm backdrop-blur-md transition-all duration-300 hover:bg-white hover:scale-110 active:scale-90 cursor-pointer"
          >
            <Heart
              className={cn(
                "h-3.5 w-3.5 transition-colors",
                saved ? "fill-rose-500 text-rose-500" : "text-neutral-700",
              )}
            />
          </button>

          {/* Badge Tag Pill at bottom of image */}
          {product.badge && !soldOut && (
            <span className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 z-10 inline-flex items-center rounded-full border border-white/60 bg-white/90 px-1.5 py-0.5 sm:px-2 text-[7.5px] sm:text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8a6335] shadow-xs backdrop-blur-md transition-opacity duration-300 pointer-events-none sm:group-hover:opacity-0">
              {badgeLabel[product.badge] ?? product.badge}
            </span>
          )}

          {/* Refined Quick Add Capsule Pill */}
          {!soldOut && (
            <div className="absolute inset-x-0 bottom-3 hidden sm:flex justify-center opacity-0 translate-y-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0">
              <button
                type="button"
                onClick={() => setQuickAddOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#1d1a17]/90 px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-white shadow-lg backdrop-blur-md transition-all hover:bg-black hover:scale-105 active:scale-95 cursor-pointer"
              >
                <ShoppingBag className="h-3 w-3" />
                <span>Quick Add</span>
              </button>
            </div>
          )}
        </div>

        {/* Anchored Bottom Information */}
        <div className="flex flex-1 flex-col justify-between px-1.5 pt-2 pb-1.5 sm:px-3 sm:pt-3 sm:pb-2.5">
          <div>
            <div className="flex items-center justify-between gap-1">
              <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.14em] sm:tracking-[0.16em] text-[#9a7342] truncate">
                {product.category}
              </p>
              {/* Interactive Colour Swatches */}
              {product.colours && product.colours.length > 1 && (
                <div
                  className="flex items-center gap-1 shrink-0"
                  title={`${product.colours.length} available colours`}
                >
                  {product.colours.slice(0, 3).map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveColour(col);
                        setSelectedColour(col);
                        setActiveImageIndex(0);
                      }}
                      onMouseEnter={() => {
                        setActiveColour(col);
                        setActiveImageIndex(0);
                      }}
                      title={col}
                      aria-label={`Select colour ${col}`}
                      className={cn(
                        "h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full border border-black/20 shadow-2xs transition-all cursor-pointer",
                        activeColour.toLowerCase() === col.toLowerCase()
                          ? "ring-1.5 ring-[#c6903c] ring-offset-0.5 scale-110 opacity-100"
                          : "opacity-70 hover:opacity-100",
                      )}
                      style={{ backgroundColor: colourMap[col.toLowerCase()] || "#c8bca9" }}
                    />
                  ))}
                  {product.colours.length > 3 && (
                    <span className="text-[8px] sm:text-[9px] font-medium text-neutral-400">
                      +{product.colours.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
            <Link
              to={`/products/${product.slug}${activeColour ? `?colour=${encodeURIComponent(activeColour)}` : ""}`}
              className="mt-0.5 sm:mt-1 block font-serif text-[13px] sm:text-[14.5px] font-normal leading-tight sm:leading-snug tracking-tight text-[#24211e] transition-colors line-clamp-1 hover:text-[#9a7342]"
            >
              {product.name}
            </Link>
          </div>
          <div className="mt-1.5 sm:mt-2.5 flex flex-wrap items-baseline justify-between gap-x-1 gap-y-0.5 border-t border-[#f0e6d6]/60 pt-1.5 sm:pt-2">
            <div className="flex flex-wrap items-baseline gap-1 sm:gap-1.5 min-w-0">
              <span className="text-[12.5px] sm:text-[14px] font-semibold text-[#24211e]">
                {formatINR(product.price)}
              </span>
              {off > 0 && (
                <span className="text-[9.5px] sm:text-[11px] text-neutral-400 line-through">
                  {formatINR(product.mrp)}
                </span>
              )}
            </div>
            {off > 0 && (
              <span className="shrink-0 rounded-full bg-emerald-50 px-1 py-0.2 sm:px-1.5 sm:py-0.5 text-[8px] sm:text-[9.5px] font-semibold tracking-wide text-emerald-800 border border-emerald-200/60">
                {off}%<span className="hidden sm:inline"> off</span>
              </span>
            )}
          </div>
        </div>
      </article>

      {/* Quick Add Modal */}
      {quickAddOpen && (
        <Dialog open={quickAddOpen} onOpenChange={setQuickAddOpen}>
          <DialogContent className="max-w-md rounded-2xl border border-[#ebdcc9] bg-[#fffdfb] p-6 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl font-medium text-[#24211e]">
                {product.name}
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-[#9a7342]">
                {product.category} · {formatINR(product.price)}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="flex gap-4">
                <img
                  key={selectedColour}
                  src={getProductImagesForColour(product, selectedColour)[0] ?? product.images[0]}
                  alt={product.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/products/p1.jpg";
                  }}
                  className="h-24 w-20 object-cover rounded-xl border border-[#ebdcc9]/70 shrink-0 shadow-sm animate-fade-in"
                />
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-neutral-600 mb-1.5">Select Colour</p>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {product.colours.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setSelectedColour(c);
                            setSelectedSize("");
                          }}
                          className={cn(
                            "rounded-md border px-2.5 py-1 text-xs transition-colors cursor-pointer",
                            selectedColour === c
                              ? "border-[#c6903c] bg-[#c6903c] text-white font-medium shadow-xs"
                              : "border-[#e3d7c3] text-neutral-700 hover:border-neutral-400 bg-white",
                          )}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.15em] text-neutral-500">
                      Select Size
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {product.sizes.map((s) => {
                        const available = isVariantAvailable(product, s, selectedColour);
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setSelectedSize(s)}
                            disabled={!available}
                            title={available ? undefined : "Currently unavailable"}
                            className={cn(
                              "rounded-md border px-2.5 py-1 text-xs transition-colors cursor-pointer disabled:cursor-not-allowed disabled:line-through disabled:opacity-40",
                              selectedSize === s
                                ? "border-[#c6903c] bg-[#c6903c] text-white font-medium shadow-xs"
                                : "border-[#e3d7c3] text-neutral-700 hover:border-neutral-400 bg-white",
                            )}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                    {selectedSize && !selectedAvailable && (
                      <p className="mt-1.5 text-xs text-destructive">
                        This combination is unavailable.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  variant="luxe"
                  className="flex-1"
                  onClick={handleQuickAdd}
                  disabled={!selectedSize || !selectedAvailable}
                >
                  {selectedSize ? `Add to Bag — ${formatINR(product.price)}` : "Select a size"}
                </Button>
                <Button asChild variant="luxeOutline">
                  <Link
                    to={`/products/${product.slug}${selectedColour ? `?colour=${encodeURIComponent(selectedColour)}` : ""}`}
                  >
                    Full Details
                  </Link>
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

export function ProductGrid({ products, columns = 4 }: { products: Product[]; columns?: 3 | 4 }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-2.5 gap-y-5 sm:gap-x-6 sm:gap-y-12",
        columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3",
      )}
    >
      {products.map((product, i) => (
        <div
          key={product.id}
          style={{ animationDelay: `${(i % 8) * 70}ms` }}
          className="animate-fade-up"
        >
          <ProductCard product={product} priority={i < 2} />
        </div>
      ))}
    </div>
  );
}

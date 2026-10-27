import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Award,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  RefreshCcw,
  Ruler,
  ShieldCheck,
  Truck,
  X,
} from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "@/lib/toast";

import { Reveal } from "@/components/common/Reveal";
import { EmptyState, SectionHeading } from "@/components/common/SectionHeading";
import { AuthPromptDialog } from "@/components/storefront/AuthPromptDialog";
import { ProductGrid } from "@/components/storefront/ProductCard";
import { Breadcrumbs, SiteLayout } from "@/components/storefront/SiteLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  findVariant,
  getColourHex,
  getProductImagesForColour,
  isColourOutOfStock,
  isProductOutOfStock,
  isVariantAvailable,
} from "@/data/catalog";
import { discountPercent, formatINR } from "@/lib/format";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryColour = searchParams.get("colour");

  const {
    products,
    isAuthenticated,
    isWishlisted,
    toggleWishlist,
    addToCart,
    setCartDrawerOpen,
    setPendingIntent,
    settings,
  } = useStore();

  const product = products.find((p) => p.slug === slug && p.published);

  const initialColour = useMemo(() => {
    if (!product) return "";
    if (queryColour) {
      const match = product.colours.find(
        (c) => c.toLowerCase() === queryColour.toLowerCase(),
      );
      if (match) return match;
    }
    return product.colours[0] ?? "";
  }, [product, queryColour]);

  const [colour, setColour] = useState(initialColour);
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [sizeError, setSizeError] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptIntent, setPromptIntent] = useState<"wishlist" | "cart">("cart");
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const wasSwipe = useRef(false);
  const sizeSectionRef = useRef<HTMLFieldSetElement>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const modalTouchStartX = useRef<number | null>(null);

  const handleStickyCta = () => {
    if (!size) {
      setSizeError(true);
      sizeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      toast.error("Please choose a size first");
      return;
    }
    handleAddToCart();
  };

  const handlePrevImage = () => {
    const count = currentImages.length;
    if (count <= 1) return;
    setActiveImage((i) => (i - 1 + count) % count);
  };

  const handleNextImage = () => {
    const count = currentImages.length;
    if (count <= 1) return;
    setActiveImage((i) => (i + 1) % count);
  };

  const handleModalTouchStart = (e: React.TouchEvent) => {
    modalTouchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleModalTouchEnd = (e: React.TouchEvent) => {
    if (modalTouchStartX.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? modalTouchStartX.current;
    const delta = endX - modalTouchStartX.current;
    if (Math.abs(delta) > 40) {
      if (delta < 0) {
        handleNextImage();
      } else {
        handlePrevImage();
      }
    }
    modalTouchStartX.current = null;
  };

  const currentImages = useMemo(() => {
    if (!product) return ["/products/p1.jpg"];
    return getProductImagesForColour(product, colour);
  }, [product, colour]);

  useEffect(() => {
    if (!zoomOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevImage();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNextImage();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoomOpen, currentImages.length]);

  useEffect(() => {
    thumbnailRefs.current[activeImage]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeImage]);

  useEffect(() => {
    setActiveImage(0);
    setSize("");
    setQuantity(1);
    setSizeError(false);
    setColour(initialColour);
  }, [slug, product?.id, initialColour]);

  const related = useMemo(() => {
    if (!product) return [];
    return products
      .filter(
        (p) =>
          p.published &&
          p.id !== product.id &&
          (p.category === product.category ||
            (product.categoryIds &&
              p.categoryIds?.some((id) => product.categoryIds?.includes(id))) ||
            (Array.isArray(p.collections) &&
              Array.isArray(product.collections) &&
              p.collections.some((c) => product.collections.includes(c)))),
      )
      .slice(0, 4);
  }, [products, product]);

  if (!product) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl px-5 py-28 sm:px-8">
          <EmptyState
            title="This piece is no longer available"
            description="It may have been retired or renamed. Browse our current catalog to find your preferred design."
            action={
              <Button asChild variant="luxe" size="lg">
                <Link to="/products">Shop All Creations</Link>
              </Button>
            }
          />
        </div>
      </SiteLayout>
    );
  }

  const saving = discountPercent(product.mrp, product.price);
  const wished = isWishlisted(product.id);
  const isOutOfStock = isProductOutOfStock(product);
  const isCurrentColourOutOfStock = isColourOutOfStock(product, colour);
  const isEntirelySoldOut = isOutOfStock || isCurrentColourOutOfStock;
  const selectedAvailable = size ? isVariantAvailable(product, size, colour) : false;
  const colourSoldOut = (c: string) => isColourOutOfStock(product, c);

  const handleWishlist = () => {
    if (!isAuthenticated) {
      setPendingIntent({
        type: "wishlist",
        productId: product.id,
        returnTo: `/products/${product.slug}`,
      });
      setPromptIntent("wishlist");
      setPromptOpen(true);
      return;
    }
    const result = toggleWishlist(product.id);
    toast.success(result === "added" ? "Saved to your wishlist" : "Removed from your wishlist");
  };

  const handleAddToCart = () => {
    if (!size) {
      setSizeError(true);
      toast.error("Please choose a size first");
      return;
    }
    addToCart({ productId: product.id, size, colour, quantity });
    toast.success(`${product.name} added to your bag`, {
      description: `${colour}, ${size} · Qty ${quantity}`,
    });
    setCartDrawerOpen(true);
  };

  const handleBuyNow = () => {
    if (!size) {
      setSizeError(true);
      toast.error("Please choose a size first");
      return;
    }
    addToCart({ productId: product.id, size, colour, quantity });
    navigate("/checkout");
  };

  const handleGalleryTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
    wasSwipe.current = false;
  };

  const handleGalleryTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      wasSwipe.current = true;
      const count = currentImages.length;
      setActiveImage((i) => (delta < 0 ? (i + 1) % count : (i - 1 + count) % count));
    }
    touchStartX.current = null;
  };

  const handleGalleryClick = () => {
    if (wasSwipe.current) {
      wasSwipe.current = false;
      return;
    }
    setZoomOpen(true);
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1400px] px-4 pb-32 pt-4 sm:px-8 sm:pb-24 sm:pt-12 lg:pb-20 lg:pt-16 lg:px-12">
        <Breadcrumbs
          items={[
            {
              label: "Home",
              href: (
                <Link to="/" className="link-underline">
                  Home
                </Link>
              ),
            },
            {
              label: "Shop",
              href: (
                <Link to="/products" className="link-underline">
                  Shop
                </Link>
              ),
            },
            { label: product.name },
          ]}
        />

        <div className="mt-4 sm:mt-8 grid gap-8 sm:gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          {/* Gallery */}
          <div>
            <div
              className="group relative aspect-3/4 overflow-hidden bg-secondary select-none touch-pan-y cursor-zoom-in"
              onClick={handleGalleryClick}
              onTouchStart={handleGalleryTouchStart}
              onTouchEnd={handleGalleryTouchEnd}
            >
              <img
                key={`${colour}-${activeImage}`}
                src={currentImages[activeImage] ?? currentImages[0]}
                alt={`${product.name} — view ${activeImage + 1}`}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/products/p1.jpg";
                }}
                className="h-full w-full object-cover object-top transition-transform duration-700 md:group-hover:scale-105 animate-fade-in"
              />

              {/* Previous / Next Image Navigation Buttons */}
              {currentImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevImage();
                    }}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-ink/75 text-pearl shadow-md backdrop-blur-xs transition-all duration-200 hover:bg-ink hover:scale-110 active:scale-90"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextImage();
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-ink/75 text-pearl shadow-md backdrop-blur-xs transition-all duration-200 hover:bg-ink hover:scale-110 active:scale-90"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}

              {product.badge && (
                <span className="absolute left-3 top-3 sm:left-3.5 sm:top-3.5 z-10 bg-ink px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] text-ivory sm:px-3 sm:py-1.5 sm:text-[10px]">
                  {product.badge === "new"
                    ? "New"
                    : product.badge === "bestseller"
                      ? "Bestseller"
                      : "Exclusive"}
                </span>
              )}

              {/* Mobile Carousel Progress Dots */}
              {currentImages.length > 1 && (
                <div className="absolute inset-x-0 bottom-3 sm:bottom-3.5 flex justify-center items-center gap-1.5 sm:hidden pointer-events-none">
                  {currentImages.map((_, i) => (
                    <span
                      key={i}
                      aria-hidden="true"
                      className={cn(
                        "h-1 rounded-full transition-all duration-300",
                        i === activeImage ? "w-5 bg-white shadow-xs" : "w-1.5 bg-white/50",
                      )}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnails Strip */}
            {currentImages.length > 1 && (
              <div
                className={cn(
                  "mt-3 flex gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none snap-x sm:mt-4 sm:gap-3",
                  currentImages.length <= 5 ? "justify-center sm:justify-start" : "justify-start",
                )}
              >
                {currentImages.map((image, i) => (
                  <button
                    key={image + i}
                    ref={(el) => {
                      thumbnailRefs.current[i] = el;
                    }}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    aria-label={`View image ${i + 1} of ${product.name}`}
                    aria-current={i === activeImage}
                    className={cn(
                      "relative aspect-3/4 w-14 sm:w-20 shrink-0 snap-start overflow-hidden border transition-all duration-200 active:scale-95",
                      i === activeImage
                        ? "border-gold ring-1 ring-gold shadow-xs opacity-100"
                        : "border-border hover:border-foreground/40 opacity-70 hover:opacity-100",
                    )}
                  >
                    <img
                      src={image}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/products/p1.jpg";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="lg:sticky lg:top-28 lg:self-start space-y-6">
            <div>
              <p className="eyebrow text-gold-deep font-medium">{product.category}</p>
              <h1 className="mt-2 text-2xl font-light leading-snug sm:text-4xl lg:text-[2.6rem]">
                {product.name}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {product.shortDescription}
              </p>
            </div>

            {/* Price section */}
            <div className="border-y border-border/80 py-4">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-display text-3xl font-normal">
                  {product.price > 0 ? formatINR(product.price) : "Price on Request"}
                </span>
                {product.mrp > product.price && product.price > 0 && (
                  <>
                    <span className="text-sm text-muted-foreground line-through">
                      {formatINR(product.mrp)}
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.18em] text-gold-deep font-medium">
                      {saving}% off
                    </span>
                  </>
                )}
                {isEntirelySoldOut && (
                  <span className="inline-flex items-center rounded-full border border-neutral-900/15 bg-neutral-900/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-neutral-800">
                    Out of Stock / Bespoke Order
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Inclusive of all taxes · Handcrafted in Kolkata
              </p>
            </div>

            {/* Special Promo Coupon Pill */}
            <div className="flex items-center justify-between border border-gold/40 bg-gold/5 px-4 py-3 text-xs">
              <div>
                <span>
                  Use code{" "}
                  <strong className="font-mono text-gold-deep font-medium">WELCOME10</strong> for
                  10% off
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText("WELCOME10");
                  toast.success("Code WELCOME10 copied to clipboard!");
                }}
                className="text-[10px] uppercase tracking-[0.15em] font-medium text-gold-deep underline underline-offset-2"
              >
                Copy
              </button>
            </div>

            {/* Colour selection or display */}
            {product.colours.length > 0 && (
              <fieldset>
                <legend className="mb-2 text-[11px] uppercase tracking-[0.2em] font-medium">
                  Colour:{" "}
                  <span className="text-foreground font-normal">
                    {colour || product.colours[0]}
                  </span>
                </legend>
                {product.colours.length > 1 ? (
                  <div className="flex flex-wrap gap-2">
                    {product.colours.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setColour(c);
                          setActiveImage(0);
                          setSize("");
                          setSearchParams(
                            (prev) => {
                              const next = new URLSearchParams(prev);
                              next.set("colour", c);
                              return next;
                            },
                            { replace: true },
                          );
                        }}
                        aria-pressed={colour === c}
                        disabled={colourSoldOut(c)}
                        className="inline-flex items-center gap-2 border border-border px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-all duration-200 hover:border-gold hover:text-foreground active:scale-95 disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 aria-pressed:border-gold aria-pressed:bg-gold/10 aria-pressed:text-gold-deep font-medium"
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full border border-black/15 shadow-2xs shrink-0"
                          style={{ backgroundColor: getColourHex(c) }}
                        />
                        <span>{c}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 border border-gold/30 bg-gold/5 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.16em] text-gold-deep font-medium">
                    <span
                      className="h-2.5 w-2.5 rounded-full border border-black/15 shadow-2xs shrink-0"
                      style={{ backgroundColor: getColourHex(product.colours[0]) }}
                    />
                    <span>{product.colours[0]}</span>
                  </div>
                )}
              </fieldset>
            )}

            {/* Size selection */}
            <fieldset ref={sizeSectionRef}>
              <div className="mb-2 flex items-center justify-between">
                <legend className="text-[11px] uppercase tracking-[0.2em] font-medium">
                  Size: {size && <span className="text-muted-foreground font-normal">{size}</span>}
                </legend>
                <button
                  type="button"
                  onClick={() => setSizeChartOpen(true)}
                  className="flex items-center gap-1 text-[11px] uppercase tracking-[0.15em] text-gold-deep hover:underline"
                >
                  <Ruler className="h-3 w-3" /> Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => {
                  const available = isVariantAvailable(product, s, colour);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setSize(s);
                        setSizeError(false);
                      }}
                      aria-pressed={size === s}
                      disabled={!available}
                      title={available ? undefined : "Currently unavailable"}
                      className="min-w-[3.25rem] border border-border px-3.5 py-2.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-all duration-200 hover:border-gold hover:text-foreground active:scale-95 disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 aria-pressed:border-gold aria-pressed:bg-gold/10 aria-pressed:text-gold-deep font-medium"
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              {sizeError && (
                <p role="alert" className="mt-2 text-xs text-destructive animate-fade-in">
                  Please select a size to continue.
                </p>
              )}
            </fieldset>

            {/* Quantity */}
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.2em] font-medium">Quantity</p>
              <div className="inline-flex items-center border border-border">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="p-2.5 text-muted-foreground transition-all hover:text-foreground active:scale-90"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span aria-live="polite" className="w-10 text-center text-sm font-medium">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(5, q + 1))}
                  aria-label="Increase quantity"
                  className="p-2.5 text-muted-foreground transition-all hover:text-foreground active:scale-90"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-row gap-2 sm:gap-3">
                {isEntirelySoldOut ? (
                  <Button
                    variant="outline"
                    size="luxeLg"
                    className="flex-1 h-auto px-1 py-1.5 rounded-xl text-[11px] sm:text-xs sm:h-12 sm:px-8 sm:py-3 sm:rounded-md uppercase tracking-widest text-muted-foreground border-border/80 bg-muted/40 cursor-not-allowed"
                    disabled
                  >
                    Out of Stock
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="luxe"
                      size="luxeLg"
                      className="flex-1 h-auto px-1 py-1.5 rounded-xl text-[11px] sm:text-xs sm:h-12 sm:px-8 sm:py-3 sm:rounded-md"
                      onClick={handleAddToCart}
                      disabled={!!size && !selectedAvailable}
                    >
                      Add to Bag — {formatINR(product.price * quantity)}
                    </Button>
                    <Button
                      variant="luxeOutline"
                      size="luxeLg"
                      className="flex-1 h-auto px-1 py-1.5 rounded-xl text-[11px] sm:text-xs sm:h-12 sm:px-8 sm:py-3 sm:rounded-md"
                      onClick={handleBuyNow}
                      disabled={!!size && !selectedAvailable}
                    >
                      Buy Now
                    </Button>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={handleWishlist}
                aria-pressed={wished}
                className="flex w-full items-center justify-center gap-2 py-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
              >
                <Heart className={cn("h-3.5 w-3.5", wished && "fill-gold text-gold")} />
                {wished ? "Saved to Wishlist" : "Save to Wishlist"}
              </button>
            </div>

            {/* Store trust badges */}
            <ul className="grid gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:grid-cols-2">
              <li className="flex items-start gap-2">
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                Free express shipping above {formatINR(settings.freeShippingThreshold)}
              </li>
              <li className="flex items-start gap-2">
                <RefreshCcw className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                7-day exchange on unworn pieces
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                100% certified pure fabrics
              </li>
              <li className="flex items-start gap-2">
                <Award className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                15+ years Kolkata manufacturer · CHAMAK quality
              </li>
            </ul>

            {/* Product Accordion */}
            <Accordion type="single" collapsible className="border-t border-border pt-2">
              <AccordionItem value="description">
                <AccordionTrigger className="text-xs uppercase tracking-[0.2em]">
                  Description
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {product.description}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="details">
                <AccordionTrigger className="text-xs uppercase tracking-[0.2em]">
                  Fabric &amp; Craftsmanship
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                    {product.details.map((detail) => (
                      <li key={detail} className="flex gap-2.5">
                        <span aria-hidden="true" className="text-gold">
                          —
                        </span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="care">
                <AccordionTrigger className="text-xs uppercase tracking-[0.2em]">
                  Garment Care
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                    {product.care.map((item) => (
                      <li key={item} className="flex gap-2.5">
                        <span aria-hidden="true" className="text-gold">
                          —
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping">
                <AccordionTrigger className="text-xs uppercase tracking-[0.2em]">
                  Shipping &amp; Delivery Timeline
                </AccordionTrigger>
                <AccordionContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                  <p>
                    In-stock items are dispatched in 1–3 business days. Made-to-order creations are
                    crafted and dispatched within 7–12 business days.
                  </p>
                  <p>All parcels are insured and shipped via reliable express couriers.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="returns">
                <AccordionTrigger className="text-xs uppercase tracking-[0.2em]">
                  Returns &amp; Refund Policy
                </AccordionTrigger>
                <AccordionContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                  <p>
                    Eligible unworn pieces with original designer tags intact can be returned within 7 days of delivery.
                  </p>
                  <p>
                    To return, submit a return request in your Account / Order page, and ship the parcel by Speed Post, DTDC, Blue Dart, or any postal or courier service of your choice to our central facility:
                  </p>
                  <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-xs text-slate-800 leading-relaxed space-y-0.5">
                    <p className="font-bold text-slate-900">Bansal NX (Returns Dept)</p>
                    <p>2nd Flr, Rm No. 38, 134/1, Mahatma Gandhi Rd, Central Avenue, Kolutolla, Kolkata, West Bengal 700073</p>
                    <p className="text-amber-850 font-mono text-[11px]">bansalnx.in · care@bansalnx.in</p>
                  </div>
                  <p className="text-xs text-emerald-800 font-semibold">
                    ✓ Once your parcel reaches our Kolkata facility and clears quality inspection, your refund will be immediately issued back to you.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="border-t border-border bg-secondary/40">
          <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:px-12">
            <Reveal>
              <SectionHeading
                align="left"
                eyebrow="You may also like"
                title="Complete the Look"
                description="Complementary couture silhouettes curated for this season."
              />
              <div className="mt-12">
                <ProductGrid products={related} />
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Sticky Mobile Add to Bag Bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/80 bg-background/95 px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-xl backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-foreground leading-tight">
              {product.name}
            </p>
            <div className="mt-0.5 flex items-baseline gap-1.5 leading-none">
              <span className="font-display text-base font-medium text-gold-deep">
                {formatINR(product.price)}
              </span>
              {size && (
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  · Size {size}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleWishlist}
              aria-label={wished ? "Saved to Wishlist" : "Save to Wishlist"}
              className="flex h-10 w-10 items-center justify-center border border-border bg-background transition-colors hover:border-gold active:scale-95"
            >
              <Heart className={cn("h-4 w-4", wished && "fill-gold text-gold")} />
            </button>
            {isEntirelySoldOut ? (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="h-10 px-4 text-xs font-medium tracking-wider text-muted-foreground border-border/80 bg-muted/40 cursor-not-allowed"
              >
                Out of Stock
              </Button>
            ) : (
              <Button
                variant="luxe"
                size="sm"
                onClick={handleStickyCta}
                className="h-10 px-4 text-xs font-medium tracking-wider"
              >
                {size ? `Add to Bag (${size})` : "Select Size"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Size Chart Modal */}
      <Dialog open={sizeChartOpen} onOpenChange={setSizeChartOpen}>
        <DialogContent className="w-[92vw] max-w-lg rounded-none border border-border bg-background p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Bespoke Size Guide</DialogTitle>
            <DialogDescription>
              Garment body measurements in inches (standard Indian sizing).
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 overflow-x-auto border border-border">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 uppercase tracking-[0.1em] border-b border-border">
                <tr>
                  <th className="p-2.5">Size</th>
                  <th className="p-2.5">Bust</th>
                  <th className="p-2.5">Waist</th>
                  <th className="p-2.5">Hip</th>
                  <th className="p-2.5">Length</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { s: "XS", b: "34", w: "28", h: "36", l: "42" },
                  { s: "S", b: "36", w: "30", h: "38", l: "42" },
                  { s: "M", b: "38", w: "32", h: "40", l: "43" },
                  { s: "L", b: "40", w: "34", h: "42", l: "43" },
                  { s: "XL", b: "42", w: "36", h: "44", l: "44" },
                  { s: "XXL", b: "44", w: "38", h: "46", l: "44" },
                ].map((row) => (
                  <tr key={row.s} className="hover:bg-muted/30">
                    <td className="p-2.5 font-medium">{row.s}</td>
                    <td className="p-2.5 text-muted-foreground">{row.b}&quot;</td>
                    <td className="p-2.5 text-muted-foreground">{row.w}&quot;</td>
                    <td className="p-2.5 text-muted-foreground">{row.h}&quot;</td>
                    <td className="p-2.5 text-muted-foreground">{row.l}&quot;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Need custom made-to-measure tailoring? Add your exact measurements in order notes at
            checkout or write to our styling concierge.
          </p>
        </DialogContent>
      </Dialog>

      {/* Luxury Full-Screen Lightbox Modal */}
      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md animate-fade-in" />
          <DialogPrimitive.Content
            className="fixed inset-0 z-50 flex flex-col justify-between p-3 sm:p-6 outline-none select-none"
            aria-describedby={undefined}
          >
            <DialogTitle className="sr-only">{product.name} Gallery View</DialogTitle>

            {/* Top Bar: Title, Counter & Close Button */}
            <div className="flex items-center justify-between gap-4 z-20">
              <div className="min-w-0">
                <p className="font-serif text-sm sm:text-base text-white tracking-wide truncate max-w-[220px] sm:max-w-md">
                  {product.name}
                </p>
                {currentImages.length > 1 && (
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/50 mt-0.5 font-mono">
                    {activeImage + 1} / {currentImages.length}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setZoomOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 active:scale-95 cursor-pointer backdrop-blur-xs"
                aria-label="Close image modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Main Image Stage */}
            <div
              className="relative flex-1 flex items-center justify-center w-full my-auto px-2 sm:px-16 overflow-hidden"
              onTouchStart={handleModalTouchStart}
              onTouchEnd={handleModalTouchEnd}
              onClick={() => setZoomOpen(false)}
            >
              <img
                key={`${colour}-${activeImage}`}
                src={currentImages[activeImage] ?? currentImages[0]}
                alt={`${product.name} — view ${activeImage + 1}`}
                loading="lazy"
                decoding="async"
                onClick={(e) => e.stopPropagation()}
                className="max-h-[68vh] sm:max-h-[76vh] w-auto max-w-full object-contain rounded-xs shadow-2xl transition-all duration-300 animate-fade-in cursor-default"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/products/p1.jpg";
                }}
              />

              {/* Prev / Next Chevrons inside Lightbox */}
              {currentImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevImage();
                    }}
                    className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 backdrop-blur-md transition-all active:scale-90 shadow-xl cursor-pointer"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextImage();
                    }}
                    className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 backdrop-blur-md transition-all active:scale-90 shadow-xl cursor-pointer"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Thumbnail Strip */}
            {currentImages.length > 1 && (
              <div className="flex items-center justify-center gap-2 py-2 sm:py-3 px-4 overflow-x-auto scrollbar-none max-w-full z-20">
                {currentImages.map((image, i) => (
                  <button
                    key={image + i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    aria-label={`View image ${i + 1}`}
                    className={cn(
                      "relative aspect-3/4 h-12 sm:h-16 shrink-0 overflow-hidden border transition-all duration-200 cursor-pointer active:scale-95",
                      i === activeImage
                        ? "border-gold ring-1 ring-gold opacity-100 scale-105 shadow-md"
                        : "border-white/20 opacity-40 hover:opacity-80 hover:border-white/50",
                    )}
                  >
                    <img
                      src={image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </Dialog>

      <AuthPromptDialog open={promptOpen} onOpenChange={setPromptOpen} intent={promptIntent} />
    </SiteLayout>
  );
}

import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Check,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  RefreshCcw,
  Ruler,
  ShieldCheck,
  Sparkles,
  Truck,
  ZoomIn,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

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
import { findVariant, isVariantAvailable } from "@/data/catalog";
import { discountPercent, formatINR } from "@/lib/format";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
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

  const [colour, setColour] = useState(product?.colours[0] ?? "");
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

  const related = useMemo(() => {
    if (!product) return [];
    return products
      .filter(
        (p) =>
          p.published &&
          p.id !== product.id &&
          (p.category === product.category ||
            p.collections.some((c) => product.collections.includes(c))),
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
  const selectedAvailable = size ? isVariantAvailable(product, size, colour) : false;
  const colourSoldOut = (c: string) => !product.sizes.some((s) => isVariantAvailable(product, s, c));

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
      const count = product.images.length;
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
      <div className="mx-auto max-w-[1400px] px-5 pb-32 pt-8 sm:px-8 sm:pb-24 lg:pb-20 lg:px-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: <Link to="/" className="link-underline">Home</Link> },
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

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          {/* Gallery */}
          <div>
            <div
              className="group relative aspect-3/4 overflow-hidden bg-secondary cursor-zoom-in touch-pan-y"
              onClick={handleGalleryClick}
              onTouchStart={handleGalleryTouchStart}
              onTouchEnd={handleGalleryTouchEnd}
            >
              <img
                src={product.images[activeImage]}
                alt={`${product.name} — view ${activeImage + 1}`}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <button
                type="button"
                className="absolute right-4 bottom-4 bg-ink/80 text-pearl p-2.5 rounded-full backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Zoom image"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              {product.badge && (
                <span className="absolute left-4 top-4 bg-ink px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-ivory">
                  {product.badge === "new"
                    ? "New"
                    : product.badge === "bestseller"
                      ? "Bestseller"
                      : "Exclusive"}
                </span>
              )}
              {product.images.length > 1 && (
                <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 sm:hidden">
                  {product.images.map((_, i) => (
                    <span
                      key={i}
                      aria-hidden="true"
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        i === activeImage ? "w-5 bg-white" : "w-1.5 bg-white/50",
                      )}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {product.images.map((image, i) => (
                <button
                  key={image + i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1} of ${product.name}`}
                  aria-current={i === activeImage}
                  className={cn(
                    "relative aspect-3/4 w-20 shrink-0 overflow-hidden border transition-colors sm:w-24",
                    i === activeImage ? "border-gold ring-1 ring-gold" : "border-border hover:border-foreground/40",
                  )}
                >
                  <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="lg:sticky lg:top-28 lg:self-start space-y-6">
            <div>
              <p className="eyebrow text-gold-deep font-medium">{product.category}</p>
              <h1 className="mt-2 text-3xl font-light leading-tight sm:text-4xl lg:text-[2.6rem]">
                {product.name}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {product.shortDescription}
              </p>
            </div>

            {/* Price section */}
            <div className="border-y border-border/80 py-4">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-display text-3xl font-normal">{formatINR(product.price)}</span>
                {product.mrp > product.price && (
                  <>
                    <span className="text-sm text-muted-foreground line-through">
                      {formatINR(product.mrp)}
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.18em] text-gold-deep font-medium">
                      {saving}% off
                    </span>
                  </>
                )}
              </div>
              <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Inclusive of all taxes · Handcrafted in Jaipur
              </p>
            </div>

            {/* Special Promo Coupon Pill */}
            <div className="flex items-center justify-between border border-gold/40 bg-gold/5 px-4 py-3 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                <span>Use code <strong className="font-mono text-gold-deep font-medium">WELCOME10</strong> for 10% off</span>
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

            {/* Colour selection */}
            {product.colours.length > 1 && (
              <fieldset>
                <legend className="mb-2 text-[11px] uppercase tracking-[0.2em] font-medium">
                  Colour: <span className="text-muted-foreground font-normal">{colour}</span>
                </legend>
                <div className="flex flex-wrap gap-2">
                  {product.colours.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setColour(c);
                        setSize("");
                      }}
                      aria-pressed={colour === c}
                      disabled={colourSoldOut(c)}
                      className="border border-border px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-gold hover:text-foreground disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 aria-pressed:border-gold aria-pressed:bg-gold/10 aria-pressed:text-gold-deep font-medium"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {/* Size selection */}
            <fieldset>
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
                      className="min-w-[3.25rem] border border-border px-3.5 py-2.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-gold hover:text-foreground disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 aria-pressed:border-gold aria-pressed:bg-gold/10 aria-pressed:text-gold-deep font-medium"
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              {sizeError && (
                <p role="alert" className="mt-2 text-xs text-destructive">
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
                  className="p-2.5 text-muted-foreground transition-colors hover:text-foreground"
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
                  className="p-2.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="luxe"
                  size="luxeLg"
                  className="flex-1 text-xs"
                  onClick={handleAddToCart}
                  disabled={!!size && !selectedAvailable}
                >
                  Add to Bag — {formatINR(product.price * quantity)}
                </Button>
                <Button
                  variant="luxeOutline"
                  size="luxeLg"
                  className="flex-1 text-xs"
                  onClick={handleBuyNow}
                  disabled={!!size && !selectedAvailable}
                >
                  Buy Now
                </Button>
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
            <ul className="grid gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:grid-cols-3">
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
                        <span aria-hidden="true" className="text-gold">—</span>
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
                        <span aria-hidden="true" className="text-gold">—</span>
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
                  <p>In-stock items are dispatched in 1–3 business days. Made-to-order creations are crafted and dispatched within 7–12 business days.</p>
                  <p>All parcels are insured and shipped via Delhivery Express.</p>
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
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between border-t border-border bg-background/95 p-4 backdrop-blur-md lg:hidden">
        <div>
          <p className="text-xs font-medium text-foreground truncate max-w-[160px]">{product.name}</p>
          <p className="text-sm font-display text-gold-deep">{formatINR(product.price)}</p>
        </div>
        <Button variant="luxe" size="sm" onClick={handleAddToCart}>
          {size ? `Add to Bag (${size})` : "Select Size"}
        </Button>
      </div>

      {/* Size Chart Modal */}
      <Dialog open={sizeChartOpen} onOpenChange={setSizeChartOpen}>
        <DialogContent className="max-w-lg rounded-none border border-border bg-background p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Bespoke Size Guide</DialogTitle>
            <DialogDescription>Garment body measurements in inches (standard Indian sizing).</DialogDescription>
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
            Need custom made-to-measure tailoring? Add your exact measurements in order notes at checkout or write to our styling concierge.
          </p>
        </DialogContent>
      </Dialog>

      {/* Image Zoom Modal */}
      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] rounded-none border border-border bg-ink p-2 overflow-hidden flex items-center justify-center">
          <img src={product.images[activeImage]} alt={product.name} className="max-h-[85vh] w-auto object-contain" />
        </DialogContent>
      </Dialog>

      <AuthPromptDialog open={promptOpen} onOpenChange={setPromptOpen} intent={promptIntent} />
    </SiteLayout>
  );
}

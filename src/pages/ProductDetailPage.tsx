import { Link, useParams } from "react-router-dom";
import { Heart, Minus, Plus, Truck, RefreshCcw, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
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
import { findVariant, isVariantAvailable } from "@/data/catalog";
import { discountPercent, formatINR } from "@/lib/format";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
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
            title="This piece has left the atelier"
            description="It may have been retired or renamed. Browse the current catalogue to find something close."
            action={
              <Button asChild variant="luxe" size="luxe">
                <Link to="/products">Shop all</Link>
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
    if (!isAuthenticated) {
      setPendingIntent({
        type: "cart",
        productId: product.id,
        variant: { size, colour },
        returnTo: `/products/${product.slug}`,
      });
      setPromptIntent("cart");
      setPromptOpen(true);
      return;
    }
    addToCart({ productId: product.id, size, colour, quantity });
    toast.success(`${product.name} added to your bag`);
    setCartDrawerOpen(true);
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1400px] px-5 pb-20 pt-8 sm:px-8 lg:px-12">
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
            <div className="relative aspect-3/4 overflow-hidden bg-secondary">
              <img
                src={product.images[activeImage]}
                alt={`${product.name} — view ${activeImage + 1}`}
                className="h-full w-full object-cover"
              />
              {product.badge && (
                <span className="absolute left-4 top-4 bg-ink px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-ivory">
                  {product.badge === "new"
                    ? "New"
                    : product.badge === "bestseller"
                      ? "Bestseller"
                      : "Exclusive"}
                </span>
              )}
            </div>
            <div className="mt-4 flex gap-3">
              {product.images.map((image, i) => (
                <button
                  key={image + i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1} of ${product.name}`}
                  aria-current={i === activeImage}
                  className={cn(
                    "relative aspect-3/4 w-20 overflow-hidden border transition-colors sm:w-24",
                    i === activeImage ? "border-gold" : "border-border hover:border-foreground/40",
                  )}
                >
                  <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow">{product.category}</p>
            <h1 className="mt-3 text-3xl leading-tight sm:text-4xl lg:text-[2.6rem]">
              {product.name}
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {product.shortDescription}
            </p>

            <div className="mt-7 flex flex-wrap items-baseline gap-3">
              <span className="font-display text-2xl">{formatINR(product.price)}</span>
              {product.mrp > product.price && (
                <>
                  <span className="text-sm text-muted-foreground line-through">
                    {formatINR(product.mrp)}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-gold-deep">
                    {saving}% off
                  </span>
                </>
              )}
            </div>
            <p className="mt-1.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Inclusive of all taxes
            </p>

            <div className="rule-gold my-8" aria-hidden="true" />

            {/* Colour */}
            {product.colours.length > 1 && (
              <fieldset className="mb-8">
                <legend className="mb-3 text-[11px] uppercase tracking-[0.2em]">
                  Colour: <span className="text-muted-foreground">{colour}</span>
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
                      className="border border-border px-4 py-2.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-gold hover:text-foreground disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-primary-foreground"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {/* Size */}
            <fieldset className="mb-8">
              <legend className="mb-3 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.2em]">
                Size
                {size && <span className="text-muted-foreground normal-case tracking-normal">{size}</span>}
              </legend>
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
                      className="min-w-[3.25rem] border border-border px-3.5 py-2.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-gold hover:text-foreground disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-primary-foreground"
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              {sizeError && (
                <p role="alert" className="mt-3 text-xs text-destructive">
                  Please select a size to continue.
                </p>
              )}
              {size && !selectedAvailable && (
                <p className="mt-3 text-xs text-muted-foreground">
                  {size} in {colour} is currently unavailable — write to us for a made-to-measure
                  enquiry.
                </p>
              )}
              <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Made to order · 4–6 weeks
              </p>
            </fieldset>

            {/* Quantity */}
            <div className="mb-8">
              <p className="mb-3 text-[11px] uppercase tracking-[0.2em]">Quantity</p>
              <div className="inline-flex items-center border border-border">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="p-3 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span aria-live="polite" className="w-10 text-center text-sm">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(5, q + 1))}
                  aria-label="Increase quantity"
                  className="p-3 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="luxe"
                size="luxeLg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={!!size && !selectedAvailable}
              >
                Add to bag
              </Button>
              <Button
                variant="luxeOutline"
                size="luxeLg"
                onClick={handleWishlist}
                aria-pressed={wished}
                className="sm:w-auto"
              >
                <Heart className={cn("mr-2 h-4 w-4", wished && "fill-current text-gold")} />
                {wished ? "Saved" : "Wishlist"}
              </Button>
            </div>

            <ul className="mt-8 grid gap-4 border-t border-border pt-8 text-xs text-muted-foreground sm:grid-cols-3">
              <li className="flex items-start gap-2.5">
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                Free shipping above {formatINR(settings.freeShippingThreshold)}
              </li>
              <li className="flex items-start gap-2.5">
                <RefreshCcw className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                7-day exchange on unworn pieces
              </li>
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                Atelier authenticity guarantee
              </li>
            </ul>

            <Accordion type="single" collapsible className="mt-8 border-t border-border">
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
                  Fabric &amp; details
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
                  Care
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
                  Shipping &amp; returns
                </AccordionTrigger>
                <AccordionContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                  <p>
                    Made-to-order pieces are dispatched in four to six weeks. Ready pieces leave the
                    atelier within three business days.
                  </p>
                  <p>
                    Exchanges are accepted within seven days of delivery on unworn, untailored
                    pieces.{" "}
                    <Link to="/returns" className="link-underline text-foreground">
                      Read the full policy
                    </Link>
                    .
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {size && (
              <p className="mt-6 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Selection: {colour} · {size} ·{" "}
                {findVariant(product, size, colour)?.availability === "available"
                  ? "Available"
                  : "Unavailable"}
              </p>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-t border-border bg-secondary/40">
          <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:px-12">
            <Reveal>
              <SectionHeading
                align="left"
                eyebrow="You may also like"
                title="Complete the look"
                description="Pieces from the same edit, chosen to sit alongside this one."
              />
              <div className="mt-12">
                <ProductGrid products={related} />
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <AuthPromptDialog open={promptOpen} onOpenChange={setPromptOpen} intent={promptIntent} />
    </SiteLayout>
  );
}

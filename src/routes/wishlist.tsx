import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, X } from "lucide-react";
import { toast } from "sonner";

import { AccountGate } from "@/components/account/AccountLayout";
import { PeacockGlyph } from "@/components/brand/BrandMark";
import { EmptyState } from "@/components/common/SectionHeading";
import { Breadcrumbs, PageHeader, SiteLayout } from "@/components/storefront/SiteLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product } from "@/data/types";
import { discountPercent, formatINR } from "@/lib/format";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/wishlist")({
  component: WishlistPage,
  head: () => ({
    meta: [
      { title: "Wishlist | Bansal-nx" },
      { name: "description", content: "Your saved favourites at Bansal-nx." },
      { property: "og:title", content: "Wishlist | Bansal-nx" },
      { property: "og:description", content: "Your saved favourites at Bansal-nx." },
    ],
  }),
});

function availabilitySummary(product: Product): { text: string; anyAvailable: boolean } {
  const sizes = Array.from(
    new Set(product.variants.filter((v) => v.availability === "available").map((v) => v.size)),
  );
  if (sizes.length === 0) return { text: "No longer available", anyAvailable: false };
  return { text: `Available in ${sizes.join(", ")}`, anyAvailable: true };
}

function WishlistCard({ product }: { product: Product }) {
  const { toggleWishlist, addToCart, setCartDrawerOpen } = useStore();
  const [size, setSize] = useState<string>("");
  const [colour, setColour] = useState<string>(product.colours[0] ?? "");
  const off = discountPercent(product.mrp, product.price);
  const { text: summary, anyAvailable } = availabilitySummary(product);

  const availableSizesForColour = useMemo(
    () =>
      product.variants.filter((v) => v.colour === colour).map((v) => ({
        size: v.size,
        available: v.availability === "available",
      })),
    [product.variants, colour],
  );

  function handleRemove() {
    toggleWishlist(product.id);
    toast.success("Removed from wishlist", { description: product.name });
  }

  function handleAddToBag() {
    if (!size || !colour) {
      toast.error("Please select a size and colour.");
      return;
    }
    addToCart({ productId: product.id, size, colour });
    setCartDrawerOpen(true);
    toast.success("Added to bag", { description: `${product.name} — ${colour}, ${size}` });
  }

  return (
    <article className="flex flex-col border border-border/70 bg-card">
      <Link to="/products/$slug" params={{ slug: product.slug }} className="relative block overflow-hidden bg-muted">
        <img
          src={product.images[0]}
          alt={product.name}
          className="aspect-4/5 w-full object-cover"
          loading="lazy"
        />
        {!anyAvailable && (
          <span className="absolute bottom-0 left-0 right-0 bg-ink/70 py-2 text-center text-[10px] uppercase tracking-[0.22em] text-ivory">
            No longer available
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {product.category}
          </p>
          <Link
            to="/products/$slug"
            params={{ slug: product.slug }}
            className="link-underline mt-1 inline-block font-display text-lg leading-snug"
          >
            {product.name}
          </Link>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-sm tracking-wide">{formatINR(product.price)}</span>
          {off > 0 && (
            <>
              <span className="text-xs text-muted-foreground line-through">{formatINR(product.mrp)}</span>
              <span className="text-xs text-gold-deep">{off}% off</span>
            </>
          )}
        </div>
        <p
          className={`text-xs ${anyAvailable ? "text-muted-foreground" : "text-destructive"}`}
          role={anyAvailable ? undefined : "status"}
        >
          {summary}
        </p>

        {anyAvailable && (
          <div className="mt-1 grid grid-cols-2 gap-2">
            <Select
              value={colour}
              onValueChange={(v) => {
                setColour(v);
                setSize("");
              }}
            >
              <SelectTrigger aria-label={`Colour for ${product.name}`} className="rounded-none">
                <SelectValue placeholder="Colour" />
              </SelectTrigger>
              <SelectContent>
                {product.colours.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger aria-label={`Size for ${product.name}`} className="rounded-none">
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent>
                {availableSizesForColour.map((s) => (
                  <SelectItem key={s.size} value={s.size} disabled={!s.available}>
                    {s.size}
                    {!s.available ? " (Unavailable)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="mt-auto flex items-center gap-2 pt-2">
          <Button
            type="button"
            variant="luxe"
            size="luxeSm"
            className="flex-1"
            disabled={!anyAvailable}
            onClick={handleAddToBag}
          >
            Add to Bag
          </Button>
          <Button
            type="button"
            variant="luxeOutline"
            size="icon"
            aria-label={`Remove ${product.name} from wishlist`}
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}

function WishlistPage() {
  const { isAuthenticated, wishlist, products } = useStore();

  if (!isAuthenticated) return <AccountGate />;

  const savedProducts = wishlist
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  return (
    <SiteLayout>
      <PageHeader
        breadcrumb={
          <Breadcrumbs items={[{ label: "Home", href: <Link to="/">Home</Link> }, { label: "Wishlist" }]} />
        }
        title="Wishlist"
        description="Pieces you've saved for later."
      />
      <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        {savedProducts.length === 0 ? (
          <EmptyState
            icon={<Heart className="h-8 w-8" />}
            title="Your favourites belong here."
            description="Browse the collection and tap the heart on any piece to save it."
            action={
              <Button asChild variant="luxe" size="luxe">
                <Link to="/products">Shop Now</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedProducts.map((product) => (
              <WishlistCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}

// Keep reference so PeacockGlyph import isn't flagged unused if not used elsewhere in file.
void PeacockGlyph;

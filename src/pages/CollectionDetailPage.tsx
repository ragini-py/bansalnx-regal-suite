import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

import { EmptyState } from "@/components/common/SectionHeading";
import { ProductGrid } from "@/components/storefront/ProductCard";
import { Breadcrumbs, SiteLayout } from "@/components/storefront/SiteLayout";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export function CollectionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { collections, products } = useStore();
  const collection = collections.find((c) => c.slug === slug && c.published);

  const items = useMemo(() => {
    if (!collection) return [];
    // 1. Direct ID / slug matches from collection.productIds
    const byId = collection.productIds
      .map((id) => products.find((p) => p.id === id || p._id === id || p.slug === id))
      .filter((p): p is (typeof products)[0] => !!p && p.published);

    if (byId.length > 0) return byId;

    // 2. Category name fallback match
    const normSlug = collection.slug.toLowerCase().replace(/[^a-z0-9]/g, "");
    return products.filter((p) => {
      if (!p.published) return false;
      const catNorm = (p.category || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      return catNorm.includes(normSlug) || normSlug.includes(catNorm);
    });
  }, [collection, products]);

  if (!collection) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl px-5 py-28 sm:px-8">
          <EmptyState
            title="This edit has closed"
            description="The collection you're looking for is no longer available. The current edits are waiting for you."
            action={
              <Button asChild variant="luxe" size="luxe">
                <Link to="/collections">View all collections</Link>
              </Button>
            }
          />
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="relative isolate overflow-hidden bg-ink">
        <img
          src={collection.bannerImage}
          alt={collection.name}
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-ink/55" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1400px] px-4 pb-12 pt-24 sm:px-8 sm:pb-24 sm:pt-36 lg:px-12">
          <div className="text-pearl/70">
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
                  label: "Collections",
                  href: (
                    <Link to="/collections" className="link-underline">
                      Collections
                    </Link>
                  ),
                },
                { label: collection.name },
              ]}
            />
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-3xl leading-tight text-ivory sm:mt-6 sm:text-5xl lg:text-[4rem]">
            {collection.name}
          </h1>
          <p className="mt-3 max-w-xl text-xs leading-relaxed text-pearl/80 sm:mt-5 sm:text-base">
            {collection.description}
          </p>
          <p className="mt-6 text-[10px] uppercase tracking-[0.24em] text-gold sm:mt-8 sm:text-[11px]">
            {items.length} {items.length === 1 ? "piece" : "pieces"} in this edit
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8 sm:py-20 lg:px-12">
        {items.length ? (
          <ProductGrid products={items} />
        ) : (
          <EmptyState
            title="This edit is being restyled"
            description="New pieces are being photographed for this collection. In the meantime, the full catalogue is open."
            action={
              <Button asChild variant="luxe" size="luxe">
                <Link to="/products">Shop all</Link>
              </Button>
            }
          />
        )}

        <div className="mt-20 border-t border-border pt-10 text-center">
          <p className="eyebrow">Keep exploring</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {collections
              .filter((c) => c.published && c.slug !== collection.slug)
              .map((c) => (
                <Button key={c.id} asChild variant="luxeOutline" size="luxeSm">
                  <Link to={`/collections/${c.slug}`}>{c.name}</Link>
                </Button>
              ))}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

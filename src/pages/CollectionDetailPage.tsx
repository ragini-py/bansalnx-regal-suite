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

  const items = collection.productIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p) => !!p && p.published)
    .map((p) => p!);

  return (
    <SiteLayout>
      <section className="relative isolate overflow-hidden bg-ink">
        <img
          src={collection.bannerImage}
          alt={collection.name}
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-ink/55" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1400px] px-5 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-36 lg:px-12">
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
          <h1 className="mt-6 max-w-3xl font-display text-[2.4rem] leading-[1.08] text-ivory sm:text-5xl lg:text-[4rem]">
            {collection.name}
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-pearl/80 sm:text-base">
            {collection.description}
          </p>
          <p className="mt-8 text-[11px] uppercase tracking-[0.24em] text-gold">
            {items.length} {items.length === 1 ? "piece" : "pieces"} in this edit
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
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
                  <Link to={`/collections/${c.slug}`}>
                    {c.name}
                  </Link>
                </Button>
              ))}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/common/Reveal";
import { Breadcrumbs, PageHeader, SiteLayout } from "@/components/storefront/SiteLayout";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "The Collections — Curated Edits | Bansal-nx" },
      {
        name: "description",
        content:
          "Explore the Bansal-nx edits: The Ceremony Edit, Quiet Hours, Heritage Atelier and New Season — each built around a single idea.",
      },
      { property: "og:title", content: "The Collections | Bansal-nx" },
      {
        property: "og:description",
        content: "Four curated edits from the Bansal-nx atelier in Jaipur.",
      },
    ],
  }),
  component: CollectionsPage,
});

function CollectionsPage() {
  const { collections, products } = useStore();
  const live = collections.filter((c) => c.published).sort((a, b) => a.order - b.order);

  return (
    <SiteLayout>
      <PageHeader
        breadcrumb={
          <Breadcrumbs
            items={[
              { label: "Home", href: <Link to="/" className="link-underline">Home</Link> },
              { label: "Collections" },
            ]}
          />
        }
        title="The Collections"
        description="Each edit is assembled by hand from the season's catalogue — a point of view rather than a category."
      />

      <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="space-y-20 sm:space-y-28">
          {live.map((collection, index) => {
            const count = collection.productIds.filter((id) =>
              products.some((p) => p.id === id && p.published),
            ).length;
            const reversed = index % 2 === 1;

            return (
              <Reveal key={collection.id} as="article">
                <div
                  className={
                    reversed
                      ? "grid items-center gap-8 lg:grid-cols-2 lg:gap-16 [&>*:first-child]:lg:order-2"
                      : "grid items-center gap-8 lg:grid-cols-2 lg:gap-16"
                  }
                >
                  <Link
                    to="/collections/$slug"
                    params={{ slug: collection.slug }}
                    className="group block overflow-hidden"
                  >
                    <div className="relative aspect-4/3 overflow-hidden bg-secondary">
                      <img
                        src={collection.bannerImage}
                        alt={collection.name}
                        loading={index === 0 ? "eager" : "lazy"}
                        className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                      />
                    </div>
                  </Link>
                  <div>
                    <p className="eyebrow">
                      Edit {String(index + 1).padStart(2, "0")} — {count} pieces
                    </p>
                    <h2 className="mt-4 text-3xl leading-[1.15] sm:text-4xl lg:text-[2.9rem]">
                      {collection.name}
                    </h2>
                    <div className="rule-gold my-7 w-24" aria-hidden="true" />
                    <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {collection.description}
                    </p>
                    <Link
                      to="/collections/$slug"
                      params={{ slug: collection.slug }}
                      className="link-underline mt-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em]"
                    >
                      Explore the edit
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </SiteLayout>
  );
}

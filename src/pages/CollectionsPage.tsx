import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/common/Reveal";
import { Breadcrumbs, PageHeader, SiteLayout } from "@/components/storefront/SiteLayout";
import { useStore } from "@/lib/store";

export function CollectionsPage() {
  const { collections, products } = useStore();
  const live = collections.filter((c) => c.published).sort((a, b) => a.order - b.order);

  return (
    <SiteLayout>
      <PageHeader
        breadcrumb={
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
              { label: "Collections & Categories" },
            ]}
          />
        }
        title="Curated Collections & Categories"
        description="Explore our signature edits and categories handcrafted by master artisans in Jaipur."
      />

      <div className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
        {/* Category Quick Filter Pills */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <Link
            to="/products"
            className="rounded-full border border-border/80 bg-background/80 px-4 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-gold hover:text-foreground hover:scale-105 active:scale-95"
          >
            All Pieces ({products.filter((p) => p.published).length})
          </Link>
          {live.map((c) => {
            const count = c.productIds.filter((id) =>
              products.some((p) => (p.id === id || p._id === id) && p.published),
            ).length;
            return (
              <Link
                key={c.id}
                to={`/collections/${c.slug}`}
                className="rounded-full border border-border/80 bg-background/80 px-4 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-gold hover:text-foreground hover:scale-105 active:scale-95"
              >
                {c.name} {count > 0 ? `(${count})` : ""}
              </Link>
            );
          })}
        </div>

        {/* 6-Card Category & Collection Showcase Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {live.map((collection, index) => {
            const count = collection.productIds.filter((id) =>
              products.some((p) => (p.id === id || p._id === id) && p.published),
            ).length;

            return (
              <Reveal key={collection.id} delay={index * 60}>
                <Link
                  to={`/collections/${collection.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:border-amber-300/80 shimmer-hover"
                >
                  {/* Image Container with Luxury Aspect Ratio */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100">
                    <img
                      src={collection.coverImage || collection.bannerImage}
                      alt={collection.name}
                      loading={index < 3 ? "eager" : "lazy"}
                      className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent transition-opacity duration-300 group-hover:opacity-90" />

                    {/* Top Badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className="inline-flex items-center rounded-full bg-slate-950/70 backdrop-blur-md px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-amber-300 border border-amber-400/30">
                        Edit {String(index + 1).padStart(2, "0")} · {count || "Curated"}{" "}
                        {count === 1 ? "Piece" : "Pieces"}
                      </span>
                    </div>

                    {/* Floating Info Overlay on Image */}
                    <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-6 text-white">
                      <h2 className="font-display text-xl font-bold tracking-tight text-white group-hover:text-amber-200 transition-colors sm:text-2xl lg:text-3xl">
                        {collection.name}
                      </h2>
                      <p className="mt-1.5 text-xs text-slate-200 line-clamp-2 leading-relaxed opacity-90 sm:mt-2">
                        {collection.description}
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-amber-300 sm:mt-4">
                        <span>Explore Collection</span>
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </SiteLayout>
  );
}

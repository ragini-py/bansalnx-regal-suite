import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/common/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ProductGrid } from "@/components/storefront/ProductCard";
import { SiteLayout } from "@/components/storefront/SiteLayout";
import { Button } from "@/components/ui/button";
import { imagery } from "@/data/catalog";
import { useStore } from "@/lib/store";
import type { Collection, Product } from "@/data/types";

export function HomePage() {
  const { content, products, collections } = useStore();

  const visible = (key: string) => content.sections.find((s) => s.key === key)?.visible !== false;
  const ordered = content.sections.filter((s) => s.visible);

  const live = products.filter((p) => p.published);
  const featuredProducts = content.featuredProductIds
    .map((id) => live.find((p) => p.id === id))
    .filter((p): p is Product => !!p);
  const newArrivals = live
    .filter((p) => p.newArrival)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);
  const bestsellers = live.filter((p) => p.bestseller).slice(0, 4);
  const featuredCollections = content.featuredCollectionIds
    .map((id) => collections.find((c) => c.id === id))
    .filter((c): c is Collection => !!c && c.published);

  const blocks: Record<string, ReactElement | null> = {
    hero: <Hero key="hero" />,
    collections: featuredCollections.length ? (
      <CollectionsBlock key="collections" collections={featuredCollections} />
    ) : null,
    newArrivals: newArrivals.length ? (
      <ProductBlock
        key="newArrivals"
        eyebrow="Just in"
        title="New Arrivals"
        description="The latest pieces to leave the atelier, added weekly."
        items={newArrivals}
        href="/products?sort=newest"
        cta="View all new arrivals"
      />
    ) : null,
    editorial: <Editorial key="editorial" />,
    bestsellers: bestsellers.length ? (
      <ProductBlock
        key="bestsellers"
        eyebrow="Most requested"
        title="The Bestsellers"
        description="Pieces our clients return to, season after season."
        items={bestsellers}
        href="/products?sort=featured"
        cta="Shop bestsellers"
      />
    ) : null,
    promo: <Promo key="promo" />,
    featured: featuredProducts.length ? (
      <ProductBlock
        key="featured"
        eyebrow="Atelier selection"
        title="Chosen by the Studio"
        description="A short list, hand-picked from the current season."
        items={featuredProducts.slice(0, 4)}
        href="/products"
        cta="Explore the full catalogue"
      />
    ) : null,
    story: <Story key="story" />,
    craft: <Craft key="craft" />,
  };

  return (
    <SiteLayout>
      {ordered.length
        ? ordered.map((section) => blocks[section.key] ?? null)
        : Object.keys(blocks)
            .filter(visible)
            .map((key) => blocks[key])}
    </SiteLayout>
  );
}

function Hero() {
  const { content } = useStore();
  const { hero } = content;

  return (
    <section className="relative isolate min-h-[88vh] w-full overflow-hidden bg-ink">
      <img
        src={imagery.hero}
        alt="Model in a hand-embroidered Bansal-nx ensemble in a Jaipur palace corridor"
        className="absolute inset-0 h-full w-full object-cover object-center opacity-90"
      />
      <div className="absolute inset-0 bg-ink/55" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-ink/85 to-transparent" aria-hidden="true" />
      <div className="relative mx-auto flex min-h-[88vh] max-w-[1400px] flex-col justify-end px-5 pb-16 pt-32 sm:px-8 sm:pb-24 lg:px-12">
        <div className="max-w-3xl fade-up">
          <p className="text-[11px] uppercase tracking-[0.32em] text-gold">{hero.eyebrow}</p>
          <h1 className="mt-6 font-display text-[2.6rem] leading-[1.05] text-ivory sm:text-6xl lg:text-[4.6rem]">
            {hero.heading}
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-pearl/80 sm:text-base">
            {hero.subheading}
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Button asChild variant="gold" size="luxeLg">
              <Link to="/products">{hero.primaryCta}</Link>
            </Button>
            <Button asChild variant="onImage" size="luxeLg">
              <Link to="/collections">{hero.secondaryCta}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CollectionsBlock({ collections }: { collections: Collection[] }) {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
      <SectionHeading
        eyebrow="Curated"
        title="The Collections"
        description="Four edits, each built around a single idea — ceremony, quiet, heritage, and what is new."
      />
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {collections.slice(0, 3).map((collection, i) => (
          <Reveal key={collection.id} delay={i === 0 ? 0 : i === 1 ? 100 : 200}>
            <Link
              to={`/collections/${collection.slug}`}
              className="group block"
            >
              <div className="relative aspect-3/4 overflow-hidden bg-secondary">
                <img
                  src={collection.coverImage}
                  alt={collection.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-ink/25 transition-opacity duration-500 group-hover:bg-ink/40" aria-hidden="true" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="font-display text-2xl text-ivory sm:text-[1.75rem]">
                    {collection.name}
                  </h3>
                  <span className="mt-3 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-gold">
                    Explore
                    <ArrowRight className="h-3 w-3 transition-transform duration-500 group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {collection.description}
              </p>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ProductBlock({
  eyebrow,
  title,
  description,
  items,
  href,
  cta,
}: {
  eyebrow: string;
  title: string;
  description: string;
  items: Product[];
  href: string;
  cta: string;
}) {
  return (
    <section className="border-t border-border/70">
      <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
        <SectionHeading
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
          action={
            <Button asChild variant="luxeOutline" size="luxe">
              <Link to={href}>
                {cta}
              </Link>
            </Button>
          }
        />
        <div className="mt-14">
          <ProductGrid products={items} />
        </div>
      </div>
    </section>
  );
}

function Editorial() {
  const { content } = useStore();
  return (
    <section className="bg-secondary/50">
      <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:gap-20 lg:px-12">
        <Reveal>
          <div className="relative aspect-4/5 overflow-hidden">
            <img
              src={imagery.editorial}
              alt="Champagne gold saree photographed against a charcoal backdrop"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        </Reveal>
        <Reveal delay={150}>
          <p className="eyebrow">Editorial</p>
          <h2 className="mt-5 text-3xl leading-[1.15] sm:text-4xl lg:text-[3rem]">
            {content.editorial.heading}
          </h2>
          <div className="rule-gold my-8 w-24" aria-hidden="true" />
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            {content.editorial.caption}
          </p>
          <Button asChild variant="luxe" size="luxe" className="mt-10">
            <Link to="/collections">{content.editorial.cta}</Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

function Promo() {
  const { content } = useStore();
  return (
    <section className="relative isolate overflow-hidden bg-ink">
      <img
        src={imagery.promo}
        alt="Bansal-nx couture gowns in an editorial setting"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-ink/60" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1400px] px-5 py-24 text-center sm:px-8 sm:py-32 lg:px-12">
        <Reveal>
          <p className="text-[11px] uppercase tracking-[0.32em] text-gold">The Atelier Invitation</p>
          <h2 className="mx-auto mt-6 max-w-2xl font-display text-3xl leading-[1.12] text-ivory sm:text-5xl">
            {content.promo.heading}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-pearl/80">
            {content.promo.caption}
          </p>
          <Button asChild variant="gold" size="luxeLg" className="mt-10">
            <Link to="/products">{content.promo.cta}</Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

function Story() {
  const { content } = useStore();
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-20 text-center sm:px-8 sm:py-28 lg:px-12">
      <Reveal>
        <p className="eyebrow">Our story</p>
        <h2 className="mx-auto mt-5 max-w-3xl text-3xl leading-[1.15] sm:text-4xl lg:text-[3rem]">
          {content.story.heading}
        </h2>
        <div className="rule-gold mx-auto my-8 w-32" aria-hidden="true" />
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {content.story.body}
        </p>
        <Button asChild variant="luxeOutline" size="luxe" className="mt-10">
          <Link to="/about">{content.story.cta}</Link>
        </Button>
      </Reveal>
    </section>
  );
}

const craftPoints = [
  {
    title: "Hand embroidery",
    body: "Zardozi, dabka and resham worked on wooden frames by karigars who have kept the craft for three generations.",
  },
  {
    title: "Made to order",
    body: "Each piece is cut for you after you order, which is why our garments take four to six weeks — and why they last.",
  },
  {
    title: "Natural fibre only",
    body: "Mulberry silk, silk velvet, mulmul cotton and handloom tissue, sourced from weaving clusters we visit ourselves.",
  },
];

function Craft() {
  return (
    <section className="border-t border-border/70 bg-secondary/40">
      <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.1fr_1fr] lg:gap-20 lg:px-12">
        <Reveal>
          <div className="relative aspect-16/11 overflow-hidden">
            <img
              src={imagery.craft}
              alt="Close-up of artisan hand-working gold zardozi embroidery on silk"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        </Reveal>
        <Reveal delay={150}>
          <p className="eyebrow">The craft</p>
          <h2 className="mt-5 text-3xl leading-[1.15] sm:text-4xl">
            Four hundred hours, one garment
          </h2>
          <ul className="mt-10 space-y-8">
            {craftPoints.map((point) => (
              <li key={point.title} className="border-t border-border pt-6">
                <h3 className="text-xl">{point.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{point.body}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

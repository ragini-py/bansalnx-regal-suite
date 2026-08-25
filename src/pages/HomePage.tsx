import { useState, useEffect, type ReactElement } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Star } from "lucide-react";

import { Reveal } from "@/components/common/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ProductGrid } from "@/components/storefront/ProductCard";
import { SiteLayout } from "@/components/storefront/SiteLayout";
import { Button } from "@/components/ui/button";
import { imagery } from "@/data/catalog";
import { useStore } from "@/lib/store";
import type { Collection, Product } from "@/data/types";
import { cn } from "@/lib/utils";

const HERO_SLIDES = [
  {
    image: imagery.hero,
    eyebrow: "Bespoke Royal Couture",
    heading: "Crafted for the Extraordinary You",
    subheading: "Hand-embroidered lehengas, bridal sarees, and raw silk ensembles created in our Jaipur studio.",
    primaryCta: "Shop New Arrivals",
    primaryTo: "/products?sort=newest",
    secondaryCta: "Explore Collections",
    secondaryTo: "/collections",
  },
  {
    image: imagery.collection1,
    eyebrow: "The Wedding Pavilion Edit",
    heading: "Timeless Bridal Opulence",
    subheading: "Zardozi needlework and antique gota patti on hand-spun silks for life's greatest celebrations.",
    primaryCta: "Discover Bridal",
    primaryTo: "/collections/the-wedding-pavilion",
    secondaryCta: "View Lookbook",
    secondaryTo: "/products",
  },
  {
    image: imagery.collection2,
    eyebrow: "Summer Muslins & Florals",
    heading: "Breeze & Light Heritage",
    subheading: "Fine chanderi and tissue kurtas woven with pure silver zari threads.",
    primaryCta: "Shop Festive Edit",
    primaryTo: "/collections/courtly-threads",
    secondaryCta: "Our Story",
    secondaryTo: "/about",
  },
];

export function HomePage() {
  const { content, products, collections } = useStore();

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

  return (
    <SiteLayout>
      <HeroSlider />

      {/* Featured Collections Showcase */}
      {featuredCollections.length > 0 && (
        <CollectionsBlock collections={featuredCollections} />
      )}

      {/* New Arrivals Section */}
      {newArrivals.length > 0 && (
        <ProductBlock
          eyebrow="Just in"
          title="New Arrivals"
          description="The latest handcrafted pieces from our master weavers, updated weekly."
          items={newArrivals}
          href="/products?sort=newest"
          cta="View all new arrivals"
        />
      )}

      {/* Full-width Luxury Editorial Banner */}
      <Editorial />

      {/* Bestsellers Section */}
      {bestsellers.length > 0 && (
        <ProductBlock
          eyebrow="Most requested"
          title="The Bestsellers"
          description="Iconic silhouettes our patrons return to season after season."
          items={bestsellers}
          href="/products?sort=featured"
          cta="Shop bestsellers"
        />
      )}

      {/* Promotional Banner */}
      <Promo />

      {/* Craftsmanship & Heritage */}
      <Craft />

      {/* Client Testimonials */}
      <Testimonials />

      {/* Brand Story */}
      <Story />
    </SiteLayout>
  );
}

function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[current] ?? HERO_SLIDES[0]!;

  return (
    <section className="relative isolate min-h-[85vh] w-full overflow-hidden bg-slate-950">
      {HERO_SLIDES.map((s, idx) => (
        <div
          key={idx}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            current === idx ? "opacity-85" : "opacity-0 pointer-events-none",
          )}
        >
          <img
            src={s.image}
            alt={s.heading}
            className="h-full w-full object-cover object-center scale-100 transition-transform duration-[8000ms]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950/80 to-transparent" aria-hidden="true" />
        </div>
      ))}

      <div className="relative mx-auto flex min-h-[85vh] max-w-[1400px] flex-col justify-end px-5 pb-14 pt-28 sm:px-8 sm:pb-20 lg:px-12">
        <div className="max-w-2xl fade-up">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-2 mb-3">
            <Sparkles className="h-3.5 w-3.5" /> {slide.eyebrow}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            {slide.heading}
          </h1>
          <p className="mt-4 max-w-lg text-sm sm:text-base leading-relaxed text-slate-200">
            {slide.subheading}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
            <Button asChild variant="luxe" size="lg" className="bg-white text-slate-950 hover:bg-slate-100 font-semibold shadow-md">
              <Link to={slide.primaryTo}>{slide.primaryCta}</Link>
            </Button>
            <Button asChild variant="onImage" size="lg" className="border-white/30 text-white hover:bg-white/10 font-medium">
              <Link to={slide.secondaryTo}>{slide.secondaryCta}</Link>
            </Button>
          </div>
        </div>

        {/* Carousel Indicators & Controls */}
        <div className="mt-10 flex items-center justify-between">
          <div className="flex gap-2">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrent(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={cn(
                  "h-1.5 transition-all duration-300 rounded-full",
                  current === idx ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/70",
                )}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCurrent((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
              aria-label="Previous slide"
              className="grid h-9 w-9 place-items-center rounded-lg border border-white/20 text-white/80 hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrent((prev) => (prev + 1) % HERO_SLIDES.length)}
              aria-label="Next slide"
              className="grid h-9 w-9 place-items-center rounded-lg border border-white/20 text-white/80 hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CollectionsBlock({ collections }: { collections: Collection[] }) {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
      <SectionHeading
        eyebrow="Curated Edits"
        title="The Collections"
        description="Bespoke ensembles built around ceremony, quiet luxury, regal heritage, and modern grace."
      />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {collections.slice(0, 3).map((collection, i) => (
          <Reveal key={collection.id} delay={i === 0 ? 0 : i === 1 ? 100 : 200}>
            <Link to={`/collections/${collection.slug}`} className="group block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="relative aspect-3/4 overflow-hidden bg-slate-100">
                <img
                  src={collection.coverImage}
                  alt={collection.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" aria-hidden="true" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <p className="text-xs uppercase font-semibold tracking-wider text-amber-300">{collection.productIds.length} Creations</p>
                  <h3 className="mt-1 font-display font-bold text-2xl text-white sm:text-3xl">
                    {collection.name}
                  </h3>
                  <p className="mt-2 text-xs text-slate-200 line-clamp-2">{collection.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white group-hover:text-amber-200 transition-colors">
                    Explore Collection <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
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
    <section className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 border-t border-slate-200">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      <div className="mt-10">
        <ProductGrid products={items} />
      </div>
      <div className="mt-10 text-center">
        <Button asChild variant="luxeOutline" size="lg" className="font-semibold">
          <Link to={href}>
            {cta} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

function Editorial() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12 my-12">
      <div className="relative isolate overflow-hidden bg-slate-900 py-20 px-6 sm:py-28 sm:px-12 rounded-2xl text-white text-center shadow-lg">
        <img
          src={imagery.editorial}
          alt="Bansal-nx couture portrait"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="relative mx-auto max-w-2xl">
          <p className="text-xs uppercase font-bold tracking-wider text-amber-300">Bespoke Excellence</p>
          <h2 className="mt-4 font-display text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-snug">
            &ldquo;Every thread carries the heartbeat of Rajasthan&rsquo;s finest karigars.&rdquo;
          </h2>
          <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-300">
            From hand-drawn motifs to the final zardozi stitch, our garments are crafted with perfection.
          </p>
          <Button asChild variant="luxe" size="lg" className="mt-8 bg-white text-slate-900 hover:bg-slate-100 font-semibold shadow-md">
            <Link to="/about">Our Heritage &amp; Craft</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Promo() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 lg:px-12">
      <div className="relative overflow-hidden border border-amber-200/80 bg-gradient-to-r from-amber-50/50 via-white to-amber-50/30 p-8 sm:p-12 rounded-2xl text-slate-900 shadow-sm">
        <div className="relative z-10 max-w-xl">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Exclusive Client Privilege</p>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Complimentary Fitting &amp; Express Delivery
          </h2>
          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600">
            Enjoy complimentary made-to-measure sizing adjustments on all bridal lehengas and sherwanis with code <span className="font-mono text-amber-800 font-bold bg-amber-100/70 px-2 py-0.5 rounded">WELCOME10</span>.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="luxe" size="lg">
              <Link to="/products">Claim Privilege</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-slate-300 bg-white text-slate-800 hover:bg-slate-50">
              <Link to="/contact">Book Private Consultation</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Craft() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-24 lg:px-12 border-t border-slate-200">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-slate-100 border border-slate-200 shadow-sm">
          <img src={imagery.craft} alt="Artisan embroidering silk fabric" loading="lazy" className="h-full w-full object-cover" />
        </div>
        <div className="space-y-6">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Mastery &amp; Lineage</p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
            Generations of Jaipur Artistry
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
            We preserve centuries-old embroidery techniques: Gota Patti from Jaipur, Zardozi from Lucknow, and Marodi needlework. Each garment requires upwards of 80 hours of meticulous hand-needlework.
          </p>
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200">
            <div>
              <p className="font-display text-2xl sm:text-3xl font-bold text-amber-700">80+ Hours</p>
              <p className="mt-1 text-xs text-slate-500 font-medium">Hand-embroidery per piece</p>
            </div>
            <div>
              <p className="font-display text-2xl sm:text-3xl font-bold text-amber-700">100% Pure</p>
              <p className="mt-1 text-xs text-slate-500 font-medium">Mulberry &amp; raw silks</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const reviews = [
    {
      author: "Gayatri Singhania",
      city: "Mumbai",
      text: "The zardozi lehenga arrived for my wedding ceremony and took everyone's breath away. The weight of the silk and precision of the embroidery is unmatched.",
      rating: 5,
    },
    {
      author: "Dr. Radhika Sen",
      city: "New Delhi",
      text: "Ordering online was seamless. The tracking was precise and the packaging felt like receiving a royal heirloom.",
      rating: 5,
    },
    {
      author: "Ananya Mehta",
      city: "Bengaluru",
      text: "Bansal-nx embodies true Indian haute couture. Pure fabrics, immaculate finishing, and responsive concierge customer care.",
      rating: 5,
    },
  ];

  return (
    <section className="bg-slate-50 border-t border-b border-slate-200 py-16 sm:py-24">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <SectionHeading
          eyebrow="Patron Reviews"
          title="Voices of Our Patrons"
          description="Reflections from our cherished clients across the globe."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {reviews.map((r, i) => (
            <div key={i} className="border border-slate-200 bg-white p-6 rounded-xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex gap-1 text-amber-500 mb-3">
                  {[...Array(r.rating)].map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-600 italic">&ldquo;{r.text}&rdquo;</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-900">{r.author}</p>
                <p className="text-[11px] text-slate-500">{r.city}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Story() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
      <div className="mx-auto max-w-2xl text-center space-y-5">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Our Philosophy</p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
          Crafted for the Extraordinary You
        </h2>
        <p className="text-sm leading-relaxed text-slate-600">
          Bansal-nx was established with one singular vision: to create heirloom royal garments that elevate your most monumental moments. No shortcuts, no compromises.
        </p>
        <Button asChild variant="luxe" size="lg" className="font-semibold">
          <Link to="/products">Explore Full Catalog</Link>
        </Button>
      </div>
    </section>
  );
}

import { useState, useEffect, type ReactElement } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, Star } from "lucide-react";
import { toast } from "@/lib/toast";
import { z } from "zod";

import { Reveal } from "@/components/common/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ProductGrid } from "@/components/storefront/ProductCard";
import { SiteLayout } from "@/components/storefront/SiteLayout";
import { Button } from "@/components/ui/button";
import { imagery } from "@/data/catalog";
import { useStore } from "@/lib/store";
import type { Collection, HomepageContent, Product } from "@/data/types";
import { cn } from "@/lib/utils";

const newsletterEmailSchema = z.string().trim().email().max(255);

// The first slide's copy comes from the admin-editable content.hero; its
// image and link targets stay fixed since HomepageContent only models one
// hero object, not per-slide routing. The other two slides are fixed
// editorial spotlights, not part of the content model.
function buildHeroSlides(hero: HomepageContent["hero"]) {
  return [
    {
      image: hero.image || imagery.hero,
      eyebrow: hero.eyebrow,
      heading: hero.heading,
      subheading: hero.subheading,
      primaryCta: hero.primaryCta,
      primaryTo: "/products?sort=newest",
      secondaryCta: hero.secondaryCta,
      secondaryTo: "/collections",
    },
    {
      image: imagery.collection1,
      eyebrow: "The Wedding Pavilion Edit",
      heading: "Timeless Bridal Opulence",
      subheading:
        "Zardozi needlework and antique gota patti on hand-spun silks for life's greatest celebrations.",
      primaryCta: "Discover Bridal",
      primaryTo: "/collections/the-ceremony-edit",
      secondaryCta: "Browse All Collections",
      secondaryTo: "/collections",
    },
    {
      image: imagery.collection2,
      eyebrow: "Summer Muslins & Florals",
      heading: "Breeze & Light Heritage",
      subheading: "Fine chanderi and tissue kurtas woven with pure silver zari threads.",
      primaryCta: "Shop Festive Edit",
      primaryTo: "/collections/quiet-hours",
      secondaryCta: "Our Story",
      secondaryTo: "/about",
    },
  ];
}

function isSectionVisible(content: HomepageContent, key: string): boolean {
  return content.sections.find((s) => s.key === key)?.visible ?? true;
}

export function HomePage() {
  const { content, products, collections } = useStore();

  const live = products.filter((p) => p.published);
  // Matched by slug, not id — ids come from the backend now and vary per
  // deployment/seed run, while slugs are the stable, human-authored keys
  // shared between this mocked homepage config and the real catalog.
  const featuredProducts = content.featuredProductIds
    .map((slug) => live.find((p) => p.slug === slug))
    .filter((p): p is Product => !!p);
  const newArrivals = live
    .filter((p) => p.newArrival)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);
  const bestsellers = live.filter((p) => p.bestseller).slice(0, 4);
  const featuredCollections = content.featuredCollectionIds
    .map((slug) => collections.find((c) => c.slug === slug))
    .filter((c): c is Collection => !!c && c.published);

  return (
    <SiteLayout>
      <HeroSlider hero={content.hero} />

      {/* Featured Products */}
      {isSectionVisible(content, "featured") && featuredProducts.length > 0 && (
        <ProductBlock
          eyebrow="Handpicked"
          title="Featured Products"
          description="A curated edit of the pieces defining this season at Bansal-nx."
          items={featuredProducts}
          href="/products?sort=featured"
          cta="Shop featured pieces"
        />
      )}

      {/* Featured Collections Showcase */}
      {isSectionVisible(content, "collections") && featuredCollections.length > 0 && (
        <CollectionsBlock collections={featuredCollections} />
      )}

      {/* New Arrivals Section */}
      {isSectionVisible(content, "new-arrivals") && newArrivals.length > 0 && (
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
      {isSectionVisible(content, "editorial") && <Editorial editorial={content.editorial} />}

      {/* Bestsellers Section */}
      {isSectionVisible(content, "bestsellers") && bestsellers.length > 0 && (
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
      {isSectionVisible(content, "promo") && <Promo promo={content.promo} />}

      {/* Craftsmanship & Heritage */}
      <Craft />

      {/* Client Testimonials */}
      <Testimonials />

      {/* Newsletter */}
      {isSectionVisible(content, "newsletter") && <Newsletter />}

      {/* Brand Story */}
      {isSectionVisible(content, "story") && <Story story={content.story} />}
    </SiteLayout>
  );
}

function HeroSlider({ hero }: { hero: HomepageContent["hero"] }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const heroSlides = buildHeroSlides(hero);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroSlides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [heroSlides.length, isPaused, current]);

  const slide = heroSlides[current] ?? heroSlides[0]!;


  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative isolate min-h-[76vh] w-full overflow-hidden bg-[#173a3d]"
    >
      {heroSlides.map((s, idx) => (
        <div
          key={idx}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            current === idx ? "opacity-90" : "opacity-0 pointer-events-none",
          )}
        >
          <img
            src={s.image}
            alt={s.heading}
            className={cn(
              "h-full w-full object-cover object-center transition-transform duration-[7500ms] ease-out",
              current === idx ? "scale-105" : "scale-100",
            )}
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/45 to-transparent"
            aria-hidden="true"
          />
          <div
            className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"
            aria-hidden="true"
          />
        </div>
      ))}

      <div className="relative mx-auto flex min-h-[72vh] sm:min-h-[76vh] max-w-[1400px] flex-col justify-end px-4 pb-8 pt-24 sm:px-8 sm:pb-14 sm:pt-36 lg:pt-40 lg:px-12">
        <div key={current} className="max-w-2xl animate-fade-in">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.22em] text-[#d4a76a] mb-2 sm:mb-3 animate-fade-up">
            {slide.eyebrow}
          </p>
          <h1
            style={{ animationDelay: "120ms" }}
            className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight animate-fade-up"
          >
            {slide.heading}
          </h1>
          <p
            style={{ animationDelay: "220ms" }}
            className="mt-3 sm:mt-4 max-w-lg text-xs sm:text-base leading-relaxed text-slate-200 animate-fade-up line-clamp-3 sm:line-clamp-none"
          >
            {slide.subheading}
          </p>
          <div
            style={{ animationDelay: "320ms" }}
            className="mt-5 sm:mt-8 flex flex-wrap items-center gap-2 sm:gap-3.5 animate-fade-up"
          >
            <Button
              asChild
              variant="luxe"
              className="h-9 px-4 text-xs sm:h-11 sm:px-6 sm:text-sm bg-white text-slate-950 hover:bg-slate-100 font-semibold shadow-md whitespace-nowrap tracking-wide uppercase"
            >
              <Link to={slide.primaryTo}>{slide.primaryCta}</Link>
            </Button>
            <Button
              asChild
              variant="onImage"
              className="h-9 px-4 text-xs sm:h-11 sm:px-6 sm:text-sm border-white/35 text-white hover:bg-white/10 font-medium whitespace-nowrap tracking-wide uppercase"
            >
              <Link to={slide.secondaryTo}>{slide.secondaryCta}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CollectionsBlock({ collections }: { collections: Collection[] }) {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
      <Reveal>
        <SectionHeading
          eyebrow="Curated Edits"
          title="The Collections"
          description="Bespoke ensembles built around ceremony, quiet luxury, regal heritage, and modern grace."
        />
      </Reveal>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.slice(0, 3).map((collection, i) => (
          <Reveal key={collection.id} delay={i === 0 ? 0 : i === 1 ? 100 : 200}>
            <Link
              to={`/collections/${collection.slug}`}
              className="group block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:border-amber-300/80 shimmer-hover"
            >
              <div className="relative aspect-3/4 overflow-hidden bg-slate-100">
                <img
                  src={collection.coverImage}
                  alt={collection.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent transition-opacity duration-300 group-hover:opacity-90"
                  aria-hidden="true"
                />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <p className="inline-block rounded-full border border-amber-400/30 bg-black/40 backdrop-blur-md px-2.5 py-0.5 text-[11px] uppercase font-semibold tracking-wider text-amber-300">
                    {collection.productIds.length} Creations
                  </p>
                  <h3 className="mt-2 font-display font-bold text-2xl text-white sm:text-3xl group-hover:text-amber-200 transition-colors">
                    {collection.name}
                  </h3>
                  <p className="mt-2 text-xs text-slate-200 line-clamp-2">
                    {collection.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white group-hover:text-amber-200 transition-colors">
                    Explore Collection{" "}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
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
    <section className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 sm:py-10 lg:px-12 border-t border-slate-200">
      <Reveal>
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      </Reveal>
      <div className="mt-10">
        <ProductGrid products={items} />
      </div>
      <div className="mt-10 text-center">
        <Button asChild variant="luxeOutline" size="lg" className="font-semibold group">
          <Link to={href}>
            {cta}{" "}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

function Editorial({ editorial }: { editorial: HomepageContent["editorial"] }) {
  return (
    <section className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12 my-6">
      <Reveal className="group relative isolate overflow-hidden bg-[#183d40]/80 py-12 px-6 sm:py-16 sm:px-10 rounded-[24px] text-white text-center shadow-[0_22px_45px_-28px_rgba(17,43,47,0.55)] backdrop-blur-lg border border-white/10 transition-all duration-500 hover:border-amber-300/40 hover:shadow-[0_28px_50px_-20px_rgba(17,43,47,0.7)] shimmer-hover">
        <img
          src={editorial.image || imagery.editorial}
          alt="Bansal-nx couture portrait"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-25 transition-transform duration-[1400ms] ease-out group-hover:scale-108"
        />
        <div className="relative mx-auto max-w-2xl">
          <p className="text-xs uppercase font-bold tracking-wider text-amber-300">
            Bespoke Excellence
          </p>
          <h2 className="mt-4 font-display text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-snug">
            {editorial.heading}
          </h2>
          <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-200">
            {editorial.caption}
          </p>
          <Button
            asChild
            variant="luxe"
            size="lg"
            className="mt-8 bg-white text-slate-900 hover:bg-slate-100 font-semibold shadow-md"
          >
            <Link to="/collections">{editorial.cta}</Link>
          </Button>
        </div>
      </Reveal>
    </section>
  );
}

function Promo({ promo }: { promo: HomepageContent["promo"] }) {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-4 sm:px-8 lg:px-12">
      <Reveal className="relative overflow-hidden border border-[#e3d0a8]/80 bg-[linear-gradient(135deg,rgba(248,241,229,0.75),rgba(255,255,255,0.68),rgba(248,241,229,0.78))] p-5 sm:p-12 rounded-[20px] sm:rounded-[28px] text-slate-900 shadow-[0_18px_35px_-28px_rgba(17,43,47,0.35)] backdrop-blur-xl transition-all duration-500 hover:shadow-[0_24px_45px_-20px_rgba(17,43,47,0.45)] hover:border-[#c6903c] shimmer-hover">
        <div className="relative z-10 max-w-xl">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-800">
            Exclusive Client Privilege
          </p>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
            {promo.heading}
          </h2>
          <p className="mt-2 sm:mt-3 text-xs sm:text-sm leading-relaxed text-slate-700">{promo.caption}</p>
          <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            <Button asChild variant="luxe" size="lg" className="h-10 text-xs sm:text-sm">
              <Link to="/collections/the-ceremony-edit">{promo.cta}</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-10 text-xs sm:text-sm border-slate-300 bg-white text-slate-800 hover:bg-slate-50 font-medium transition-all active:scale-95"
            >
              <Link to="/contact">Book Private Consultation</Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Craft() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-6 sm:px-8 sm:py-8 lg:px-12 border-t border-slate-200">
      <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
        <Reveal className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-slate-100 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 shimmer-hover">
          <img
            src={imagery.craft}
            alt="Artisan embroidering silk fabric"
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-108"
          />
        </Reveal>
        <Reveal delay={150} className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
            Mastery &amp; Lineage
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-none">
            Generations of Jaipur Artistry
          </h2>
          <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
            We preserve centuries-old embroidery techniques: Gota Patti from Jaipur, Zardozi from
            Lucknow, and Marodi needlework. Each garment requires upwards of 80 hours of meticulous
            hand-needlework.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
            <div className="p-3 rounded-xl border border-transparent hover:border-amber-200/80 hover:bg-amber-50/40 transition-all duration-300">
              <p className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-amber-800 leading-none">
                80+ Hours
              </p>
              <p className="mt-1.5 text-xs text-slate-600 font-medium">Hand-embroidery per piece</p>
            </div>
            <div className="p-3 rounded-xl border border-transparent hover:border-amber-200/80 hover:bg-amber-50/40 transition-all duration-300">
              <p className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-amber-800 leading-none">
                100% Pure
              </p>
              <p className="mt-1.5 text-xs text-slate-600 font-medium">Mulberry &amp; raw silks</p>
            </div>
          </div>
        </Reveal>
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
    <section className="bg-slate-50 border-t border-b border-slate-200 py-10 sm:py-14">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <SectionHeading
          eyebrow="Patron Reviews"
          title="Voices of Our Patrons"
          description="Reflections from our cherished clients across the globe."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {reviews.map((r, i) => (
            <Reveal key={i} delay={i === 0 ? 0 : i === 1 ? 100 : 200}>
              <div className="group h-full border border-slate-200 bg-white p-5 rounded-xl shadow-sm flex flex-col justify-between transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:border-amber-300/70 shimmer-hover">
                <div>
                  <div className="flex gap-1 text-amber-500 mb-2.5">
                    {[...Array(r.rating)].map((_, idx) => (
                      <Star
                        key={idx}
                        className="h-4 w-4 fill-amber-400 text-amber-400 transition-transform duration-300 group-hover:scale-110"
                      />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-700 italic">
                    &ldquo;{r.text}&rdquo;
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-900">{r.author}</p>
                  <p className="text-[11px] text-slate-600">{r.city}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}


function Newsletter() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  function subscribe(event: React.FormEvent) {
    event.preventDefault();
    const parsed = newsletterEmailSchema.safeParse(email);
    if (!parsed.success) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setEmail("");
      toast.success("You're subscribed", {
        description: "We'll write when a new collection arrives.",
      });
    }, 700);
  }

  return (
    <section className="border-t border-[#214f6d]/20 bg-[#183d40] py-10 sm:py-14">
      <Reveal className="mx-auto max-w-2xl px-5 text-center sm:px-8">
        <Mail className="mx-auto h-7 w-7 text-[#d4a76a] animate-float" aria-hidden="true" />
        <p className="mt-3 text-xs font-bold uppercase tracking-wider text-[#d4a76a]">
          Stay in the know
        </p>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-white leading-none">
          Join the Bansal-nx Circle
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-200">
          Be first to know about new collections, private trunk shows, and member-only offers.
        </p>
        <form
          onSubmit={subscribe}
          className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center"
          noValidate
        >
          <label htmlFor="home-newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="home-newsletter-email"
            type="email"
            value={email}
            maxLength={255}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            aria-invalid={!!error}
            aria-describedby={error ? "home-newsletter-error" : undefined}
            className="h-11 w-full max-w-sm border border-white/20 bg-white/5 px-4 text-sm text-white rounded-md placeholder:text-slate-300 focus:border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-300"
          ></input>
          <Button
            type="submit"
            variant="luxe"
            size="lg"
            disabled={sending}
            className="bg-white text-slate-950 hover:bg-slate-100 font-semibold shrink-0"
          >
            {sending ? "…" : "Subscribe"}
          </Button>
        </form>
        {error && (
          <p id="home-newsletter-error" className="mt-2 text-xs text-rose-300">
            {error}
          </p>
        )}
      </Reveal>
    </section>
  );
}

function Story({ story }: { story: HomepageContent["story"] }) {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
      <Reveal className="mx-auto max-w-2xl text-center space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Our Philosophy</p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 leading-none">
          {story.heading}
        </h2>
        <p className="text-sm leading-relaxed text-slate-700">{story.body}</p>
        <Button asChild variant="luxe" size="lg" className="font-semibold">
          <Link to="/about">{story.cta}</Link>
        </Button>
      </Reveal>
    </section>
  );
}

import { Link } from "react-router-dom";
import { Gem, Hand, Sparkles } from "lucide-react";

import { Breadcrumbs, PageHeader, SiteLayout } from "@/components/storefront/SiteLayout";
import { imagery } from "@/data/catalog";

const values = [
  {
    icon: Hand,
    title: "Hand-crafted",
    body: "Every piece passes through the hands of our karigars — master artisans whose techniques are inherited across generations.",
  },
  {
    icon: Sparkles,
    title: "Made-to-order",
    body: "We craft in small, considered batches, not for a season. Fewer pieces, made better, made for you.",
  },
  {
    icon: Gem,
    title: "The peacock",
    body: "Our emblem, the peacock, is Jaipur's own — a symbol of grace, regality and quiet confidence.",
  },
];

export function AboutPage() {
  return (
    <SiteLayout>
      <PageHeader
        breadcrumb={<Breadcrumbs items={[{ label: "Home", href: <Link to="/">Home</Link> }, { label: "Our Story" }]} />}
        title="Our Story"
        description="Founded in Jaipur, built by hand."
      />

      <section className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 flex flex-col justify-center lg:order-1">
            <p className="eyebrow text-gold">Crafted for the extraordinary you</p>
            <h2 className="mt-4 text-3xl leading-tight sm:text-4xl">
              Born in the pink city, woven by our karigars.
            </h2>
            <div className="mt-6 space-y-5 text-sm leading-relaxed text-muted-foreground">
              <p>
                Bansal-nx began in Jaipur — a city where centuries of embroidery, block-printing and
                hand-loom weaving live in the same lanes as its bazaars. We started as a dedicated
                design studio working with a handful of karigars, and that intimacy remains the spine of
                everything we make.
              </p>
              <p>
                We build made-to-order: each garment is cut and finished only once it's chosen,
                rather than pulled from a warehouse of unsold stock. It takes longer, and it means
                a great deal more — to the hands that make it, and to the one who wears it.
              </p>
              <p>
                Our emblem is the peacock, native to Rajasthan and long a symbol of grace and
                regal confidence. It appears quietly through our world, from the mark on our
                garments to the language of our stores — a reminder that true luxury doesn't need
                to announce itself.
              </p>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <img
              src={imagery.craft}
              alt="Artisan hands at work on embroidery"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:px-12">
          <div>
            <img
              src={imagery.editorial}
              alt="Editorial view of a Bansal-nx garment"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center">
            <p className="eyebrow text-gold">The Studio</p>
            <h2 className="mt-4 text-3xl leading-tight sm:text-4xl">
              CRAFTED FOR THE EXTRAORDINARY YOU
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              This is more than a tagline — it's a standard. We hold every silhouette, embroidery
              and finish to the same question: would this be worthy of a moment that matters?
              Anything less doesn't leave our doors.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:px-12">
        <div className="grid gap-10 sm:grid-cols-3 sm:gap-8">
          {values.map(({ icon: Icon, title, body }) => (
            <div key={title} className="border-t border-border pt-6">
              <Icon className="h-6 w-6 text-gold" aria-hidden="true" />
              <h3 className="mt-4 text-xl">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}

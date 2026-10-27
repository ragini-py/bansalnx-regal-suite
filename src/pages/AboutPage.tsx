import { Link } from "react-router-dom";
import {
  Award,
  Building2,
  CheckCircle2,
  Factory,
  Globe2,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Users2,
} from "lucide-react";

import { Breadcrumbs, PageHeader, SiteLayout } from "@/components/storefront/SiteLayout";
import { Button } from "@/components/ui/button";
import { imagery } from "@/data/catalog";

const milestones = [
  {
    number: "15+",
    label: "Years of Experience",
    description: "Redefining women's ethnic and contemporary fashion since 2011",
    icon: Award,
  },
  {
    number: "1,000+",
    label: "Retail Partners",
    description: "Trusted boutiques and prestigious multi-brand outlets",
    icon: Users2,
  },
  {
    number: "20+",
    label: "Wholesalers & Traders",
    description: "Long-standing wholesale distribution networks",
    icon: Building2,
  },
  {
    number: "Global",
    label: "India & Overseas",
    description: "Growing presence across pan-India and international markets",
    icon: Globe2,
  },
];

const pillars = [
  {
    icon: Factory,
    title: "Direct In-House Manufacturing",
    body: "From original conceptual design and raw silk selection to precision cutting, hand-embroidery, and final tailoring — every step is guided under one roof with rigorous quality control.",
  },
  {
    icon: Sparkles,
    title: "Elegance Meets Everyday Comfort",
    body: "We blend centuries-old Indian artistry with contemporary silhouettes, creating garments that combine grandeur with breathable, effortless comfort for today's modern woman.",
  },
  {
    icon: HeartHandshake,
    title: "Trusted Trade Partnerships",
    body: "Over 15 years of steadfast relationships with 1,000+ retailers and 20+ wholesalers across India and overseas, built on dependable delivery and uncompromising standards.",
  },
];

export function AboutPage() {
  return (
    <SiteLayout>
      <PageHeader
        breadcrumb={
          <Breadcrumbs
            items={[{ label: "Home", href: <Link to="/">Home</Link> }, { label: "About Us" }]}
          />
        }
        title="About Bansal NX"
        description="Over 15 years of craftsmanship, quality, and timeless women's fashion."
      />

      {/* Main Brand Narrative */}
      <section className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="order-2 flex flex-col justify-center lg:order-1">
            <p className="eyebrow text-gold font-semibold tracking-wider">
              15+ Years of Fashion Excellence
            </p>
            <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl lg:text-5xl text-slate-900 font-bold">
              Redefining Women&apos;s Fashion With Passion &amp; Craft
            </h2>
            <div className="mt-6 space-y-4 text-sm sm:text-base leading-relaxed text-slate-600">
              <p>
                <strong className="text-slate-900 font-semibold">BANSAL NX</strong> has been
                redefining women&apos;s fashion for over 15 years with an unwavering commitment to
                quality, craftsmanship, and timeless design. As a premier manufacturer of luxury
                ethnic and contemporary wear based in Kolkata, we create collections that seamlessly
                combine elegance, comfort, and evolving fashion trends.
              </p>
              <p>
                Driven by creativity and a passion for excellence, we believe every collection
                should reflect confidence, individuality, and refined style. From design and
                manufacturing to the finished garment, every step is guided by our dedication to
                superior quality and customer satisfaction.
              </p>
              <p>
                Guided by innovation, craftsmanship, and uncompromising quality, BANSAL NX continues
                to shape the future of women&apos;s fashion through timeless designs, trusted
                partnerships, and an enduring standard of excellence.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="luxe" size="lg">
                <Link to="/products">Explore Collections</Link>
              </Button>
              <Button asChild variant="luxeOutline" size="lg">
                <Link to="/contact">Partner With Us</Link>
              </Button>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative overflow-hidden rounded-2xl shadow-xl border border-slate-200">
              <img
                src={imagery.craftOrange}
                alt="Handcrafted luxury textile detail at Bansal NX atelier"
                className="h-full w-full object-cover aspect-[4/3] sm:aspect-[16/11]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 text-white">
                <p className="text-xs uppercase tracking-widest text-amber-300 font-semibold">
                  Kolkata Manufacturing Atelier
                </p>
                <p className="text-sm sm:text-base font-medium mt-1">
                  100% In-House Design &amp; Craftsmanship
                </p>
                <p className="text-[11px] text-slate-300 mt-1 font-mono">
                  2nd Flr, Rm No. 38, 134/1, Mahatma Gandhi Rd, Central Avenue, Kolutolla, Kolkata 700073 · bansalnx.in
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Numbers / Business Scale Bar */}
      <section className="border-y border-slate-200 bg-amber-50/40 py-12 sm:py-16">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Scale &amp; Reach
            </p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Trusted Across India &amp; Overseas
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              From our manufacturing base in Kolkata to boutique retailers and patrons worldwide.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {milestones.map(({ number, label, description, icon: Icon }) => (
              <div
                key={label}
                className="bg-white rounded-xl border border-amber-200/70 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 text-center"
              >
                <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-amber-100 text-amber-800 mb-3">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <p className="font-display text-3xl sm:text-4xl font-bold text-amber-900 tracking-tight">
                  {number}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{label}</p>
                <p className="mt-1 text-xs text-slate-500 leading-snug">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHAMAK Brand Feature */}
      <section className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
        <div className="rounded-3xl border border-slate-200 bg-slate-900 text-white overflow-hidden shadow-2xl">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="p-8 sm:p-12 lg:p-16 space-y-5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-amber-300">
                <Sparkles className="h-3.5 w-3.5" /> A Signature Brand by BANSAL NX
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Introducing CHAMAK
              </h2>
              <p className="text-amber-200/90 text-sm sm:text-base font-medium">
                Celebrating Indian Craftsmanship with a Contemporary Design Approach
              </p>
              <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed pt-2">
                <p>
                  To extend our design philosophy to a wider audience, we introduced{" "}
                  <strong className="text-white font-semibold">CHAMAK</strong>, a premium women&apos;s
                  fashion brand that celebrates authentic Indian craftsmanship with a fresh,
                  contemporary design sensibility.
                </p>
                <p>
                  Every CHAMAK collection is thoughtfully created to deliver exceptional quality,
                  elegance, and style for today&apos;s modern woman — designed for effortless wear,
                  flattering silhouettes, and celebratory radiance.
                </p>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Button asChild variant="luxe" size="lg" className="bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold">
                  <Link to="/products?category=chamak">Explore CHAMAK Edit</Link>
                </Button>
                <div className="flex items-center gap-2 text-xs text-amber-200">
                  <CheckCircle2 className="h-4 w-4 text-amber-400" />
                  <span>Curated for the modern woman</span>
                </div>
              </div>
            </div>

            <div className="relative h-full min-h-[360px] lg:min-h-[500px]">
              <img
                src={imagery.aboutEditorial}
                alt="CHAMAK collection by Bansal NX"
                className="absolute inset-0 h-full w-full object-cover object-[center_25%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent lg:bg-gradient-to-r lg:from-slate-900 lg:via-transparent lg:to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Core Manufacturing Values */}
      <section className="mx-auto max-w-[1400px] px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
            Our Foundation
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">
            Guided by Innovation &amp; Quality
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Every garment begins with a conviction: superior quality, fair trade, and designs that endure.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {pillars.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-md hover:border-amber-300 transition-all duration-300"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-800 mb-5">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900">{title}</h3>
              <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-600">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Button asChild variant="luxe" size="luxe">
            <Link to="/products">Explore Our Collections</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}

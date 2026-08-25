import type { ReactNode } from "react";

import { CartDrawer } from "@/components/storefront/CartDrawer";
import { Footer } from "@/components/storefront/Footer";
import { Navbar } from "@/components/storefront/Navbar";
import { WelcomeOffer } from "@/components/storefront/WelcomeOffer";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-xs focus:uppercase focus:tracking-[0.2em] focus:text-pearl"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <WelcomeOffer />
    </div>
  );
}

export function PageHeader({
  breadcrumb,
  title,
  description,
  meta,
}: {
  breadcrumb?: ReactNode | undefined;
  title: string;
  description?: string | undefined;
  meta?: ReactNode | undefined;
}) {
  return (
    <div className="border-b border-slate-200 bg-slate-50/50">
      <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
        {breadcrumb}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-slate-900 tracking-tight">{title}</h1>
            {description && (
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500">{description}</p>
            )}
          </div>
          {meta}
        </div>
      </div>
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: ReactNode }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-2">
            {item.href ?? <span aria-current="page" className="text-slate-800 font-semibold">{item.label}</span>}
            {i < items.length - 1 && <span aria-hidden="true" className="text-slate-300">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

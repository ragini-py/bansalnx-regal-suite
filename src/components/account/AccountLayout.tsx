import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

import { Breadcrumbs, PageHeader, SiteLayout } from "@/components/storefront/SiteLayout";
import { Button } from "@/components/ui/button";
import { PeacockGlyph } from "@/components/brand/BrandMark";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Overview", to: "/account" },
  { label: "Orders", to: "/account/orders" },
  { label: "Wishlist", to: "/wishlist" },
  { label: "Addresses", to: "/account/addresses" },
  { label: "Coupons", to: "/account/coupons" },
  { label: "Profile", to: "/account/profile" },
];

export function AccountGate() {
  return (
    <SiteLayout>
      <PageHeader
        breadcrumb={<Breadcrumbs items={[{ label: "Home", href: <Link to="/">Home</Link> }, { label: "My Account" }]} />}
        title="My Account"
      />
      <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-md flex-col items-center border border-border/70 bg-card px-8 py-16 text-center">
          <span className="h-10 w-10 text-gold">
            <PeacockGlyph />
          </span>
          <h2 className="mt-6 font-display text-2xl font-light">Sign in to your account</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Sign in to manage your orders, wishlist, addresses and preferences.
          </p>
          <div className="mt-8 flex w-full flex-col gap-3">
            <Button asChild variant="luxe" size="luxe">
              <Link to="/login?redirect=/account">
                Login
              </Link>
            </Button>
            <Button asChild variant="luxeOutline" size="luxe">
              <Link to="/register?redirect=/account">
                Create Account
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

export function AccountLayout({
  title = "My Account",
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  const { logout } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  function handleSignOut() {
    logout();
    navigate("/");
  }

  return (
    <SiteLayout>
      <PageHeader
        breadcrumb={
          <Breadcrumbs items={[{ label: "Home", href: <Link to="/">Home</Link> }, { label: "My Account" }]} />
        }
        title={title}
        description={description}
      />
      <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[220px_1fr] lg:gap-10">
          <nav aria-label="Account navigation" className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm h-fit">
            <ul className="flex gap-1 overflow-x-auto whitespace-nowrap lg:flex-col lg:overflow-visible">
              {NAV_ITEMS.map((item) => {
                const active = currentPath === item.to;
                return (
                  <li key={item.to} className="shrink-0 lg:w-full">
                    <Link
                      to={item.to}
                      data-active={active || undefined}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "block px-3.5 py-2 text-xs font-medium rounded-lg transition-colors text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                        "data-[active]:bg-slate-900 data-[active]:text-white data-[active]:font-semibold data-[active]:shadow-xs",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="hidden pt-3 mt-3 border-t border-slate-100 lg:block">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-2 text-xs font-medium text-slate-600 hover:text-slate-900 border-slate-200"
                onClick={handleSignOut}
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                Sign Out
              </Button>
            </div>
          </nav>
          <div className="min-w-0">
            <div className="mb-6 flex justify-end lg:hidden">
              <Button
                type="button"
                variant="luxeOutline"
                size="luxeSm"
                className="gap-2"
                onClick={handleSignOut}
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                Sign Out
              </Button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

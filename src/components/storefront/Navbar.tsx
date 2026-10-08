import { Link, useLocation } from "react-router-dom";
import { Heart, Menu, Search, ShoppingBag, ShieldCheck, User, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { BrandMark } from "@/components/brand/BrandMark";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { formatINR } from "@/lib/format";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const primaryNav = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/products" },
  { label: "Collections", to: "/collections" },
  { label: "About", to: "/about" },
];

export function AnnouncementBar() {
  const { content } = useStore();
  const [dismissed, setDismissed] = useState(false);
  if (!content.announcement.enabled || dismissed) return null;
  return (
    <div className="relative bg-[#183d40] text-[#f8f1e5]">
      <p className="mx-auto max-w-[1400px] px-10 py-2 text-center text-xs font-medium tracking-normal">
        {content.announcement.text}
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-white"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { products } = useStore();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return products
      .filter(
        (p) =>
          p.published &&
          (p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.tags.some((t) => t.includes(q))),
      )
      .slice(0, 6);
  }, [products, query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border border-white/50 bg-white/70 p-0 rounded-xl shadow-xl overflow-hidden backdrop-blur-xl">
        <DialogTitle className="sr-only">Search products</DialogTitle>
        <DialogDescription className="sr-only">Search our luxury couture catalog</DialogDescription>
        <div className="border-b border-slate-200 p-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sarees, lehengas, silk kurta sets..."
              className="w-full bg-transparent font-sans text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {query.trim().length < 2 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              <p className="font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Popular Searches
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {["Silk Lehenga", "Handloom Saree", "Bridal Gown", "Raw Silk Kurta"].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="border border-slate-200 bg-slate-50 px-3 py-1 text-xs rounded-full text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              <p>No results found for "{query}".</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {results.map((product) => (
                <li key={product.id}>
                  <Link
                    to={`/products/${product.slug}`}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-12 w-12 object-cover rounded-md border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                        {product.category}
                      </p>
                      <p className="font-sans font-medium text-sm text-slate-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
                        {formatINR(product.price)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-slate-900 px-1 text-[8.5px] font-bold text-white sm:h-4 sm:min-w-4 sm:text-[9px]">
      {count}
    </span>
  );
}

export function Navbar() {
  const { wishlist, products, cartCount, user, isAuthenticated, isAdmin, setCartDrawerOpen } =
    useStore();
  const location = useLocation();
  const pathname = location.pathname;

  const accountHref = isAdmin ? "/admin" : isAuthenticated ? "/account" : "/login";
  const accountLabel = isAdmin
    ? "Admin"
    : isAuthenticated
      ? (user?.firstName ?? "Account")
      : "Sign In";

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <AnnouncementBar />
      <header
        className={cn(
          "sticky top-0 z-40 w-full border-b border-[#e7dcc2]/70 bg-white/40 backdrop-blur-xl transition-all duration-200",
          scrolled ? "shadow-[0_10px_28px_-24px_rgba(17,43,47,0.35)]" : "",
        )}
      >
        <div className="mx-auto flex h-16 sm:h-20 max-w-[1400px] items-center justify-between gap-2 sm:gap-4 px-4 sm:px-8 lg:px-12">
          {/* Logo - Left Most */}
          <Link to="/" className="flex items-center py-1 shrink-0" aria-label="Bansal-nx home">
            <BrandMark size="md" imgClassName="h-12 sm:h-14 lg:h-16" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex lg:items-center lg:gap-8" aria-label="Main">
            {primaryNav.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                data-active={pathname === item.to}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 link-underline"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-0.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search creations"
              className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center text-slate-600 transition-colors hover:text-slate-900"
            >
              <Search className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={1.5} />
            </button>

            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative grid h-8 w-8 sm:h-9 sm:w-9 place-items-center text-slate-600 transition-colors hover:text-slate-900"
            >
              <Heart className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={1.5} />
              <CountBadge
                count={
                  wishlist.filter((id) => products.some((p) => p.id === id && p.published)).length
                }
              />
            </Link>

            <button
              type="button"
              onClick={() => setCartDrawerOpen(true)}
              aria-label={`Open bag, ${cartCount} items`}
              className="relative grid h-8 w-8 sm:h-9 sm:w-9 place-items-center text-slate-600 transition-colors hover:text-slate-900"
            >
              <ShoppingBag className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={1.4} />
              <CountBadge count={cartCount} />
            </button>

            {/* Account / Admin Link - HIDDEN on mobile screens, shown on desktop */}
            <Link
              to={accountHref}
              aria-label={accountLabel}
              className="hidden lg:flex items-center gap-1.5 border border-slate-200 bg-slate-50/80 px-2.5 py-1 text-xs font-medium text-slate-700 rounded-md transition-colors hover:bg-slate-100 hover:text-slate-900 ml-1"
            >
              {isAdmin ? (
                <ShieldCheck className="h-3.5 w-3.5 text-amber-700" />
              ) : (
                <User
                  className={cn(
                    "h-3.5 w-3.5",
                    isAuthenticated ? "text-amber-700" : "text-slate-500",
                  )}
                />
              )}
              <span
                className={cn(
                  "hidden md:inline",
                  isAuthenticated ? "font-semibold" : "font-medium",
                )}
              >
                {accountLabel}
              </span>
            </Link>

            {/* Mobile Menu Button - RIGHT MOST */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center lg:hidden text-slate-700 hover:text-slate-900 ml-0.5"
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="right"
          className="w-[86%] border-border bg-background p-0 sm:max-w-sm rounded-none"
        >
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div className="flex h-full flex-col">
            {/* Header: Prominent logo, single close button (handled by SheetPrimitive.Close at top-right) */}
            <div className="flex items-center justify-between border-b border-border/80 px-5 py-4 pr-12">
              <BrandMark size="md" imgClassName="h-12 sm:h-14" />
            </div>

            {/* Account / Login Section inside Mobile Menu */}
            <div className="border-b border-border/70 bg-[#faf6ee]/50 p-4">
              {isAuthenticated ? (
                <Link
                  to={accountHref}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg border border-[#e4d4bd] bg-white p-3 shadow-xs transition-colors hover:border-[#c6903c]"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-[#f4ecd8] text-[#9b7038]">
                      {isAdmin ? <ShieldCheck className="h-5 w-5" /> : <User className="h-5 w-5" />}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-slate-900">
                        {isAdmin
                          ? "Admin Console"
                          : `${user?.firstName ?? "Valued Client"} ${user?.lastName ?? ""}`.trim()}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[150px]">
                        {user?.email ?? "Account"}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-gold/50 text-gold-deep text-[10px] uppercase tracking-wider rounded-none"
                  >
                    {isAdmin ? "Admin" : "Client"}
                  </Badge>
                </Link>
              ) : (
                <Button
                  asChild
                  variant="luxe"
                  className="w-full justify-center text-xs tracking-wider uppercase font-semibold h-10 shadow-xs"
                >
                  <Link to="/login" onClick={() => setMenuOpen(false)}>
                    <User className="h-4 w-4 mr-2" /> Sign In / Register
                  </Link>
                </Button>
              )}
            </div>

            <nav className="flex-1 overflow-y-auto p-5" aria-label="Mobile">
              <ul className="space-y-4 font-display text-xl">
                {primaryNav.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      onClick={() => setMenuOpen(false)}
                      className="block py-1 transition-colors hover:text-gold-deep"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to="/wishlist"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between py-1 text-slate-700 hover:text-gold-deep font-display"
                  >
                    <span>Wishlist</span>
                    <span className="text-xs font-sans text-muted-foreground">
                      ({wishlist.filter((id) => products.some((p) => p.id === id && p.published)).length})
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/track"
                    onClick={() => setMenuOpen(false)}
                    className="block py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground font-sans pt-2"
                  >
                    Track Your Order
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="border-t border-slate-200 p-5 text-xs text-slate-500 space-y-1.5">
              <p className="font-medium text-slate-700">Jaipur Studio · Handcrafted in India</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                Crafted for the Extraordinary You
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

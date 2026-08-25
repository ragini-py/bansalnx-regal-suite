import { Link, useLocation } from "react-router-dom";
import { Heart, Menu, Search, ShoppingBag, ShieldCheck, User, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { BrandMark } from "@/components/brand/BrandMark";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
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
    <div className="relative bg-slate-900 text-slate-100">
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

function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
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
      <DialogContent className="max-w-2xl border border-slate-200 bg-white p-0 rounded-xl shadow-xl overflow-hidden">
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
              <p className="font-semibold uppercase tracking-wider text-slate-400 mb-2">Popular Searches</p>
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
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">{product.category}</p>
                      <p className="font-sans font-medium text-sm text-slate-900 truncate">{product.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{formatINR(product.price)}</p>
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
    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-900 px-1 text-[9px] font-bold text-white">
      {count}
    </span>
  );
}

export function Navbar() {
  const { wishlist, cartCount, user, isAuthenticated, isAdmin, setCartDrawerOpen } = useStore();
  const location = useLocation();
  const pathname = location.pathname;

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
          "sticky top-0 z-40 w-full transition-all duration-200",
          scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80" : "bg-white border-b border-slate-200",
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-5 sm:h-20 sm:px-8 lg:px-12">
          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="grid h-9 w-9 place-items-center lg:hidden text-slate-700"
          >
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </button>

          {/* Logo */}
          <Link to="/" className="lg:order-1" aria-label="Bansal-nx home">
            <BrandMark size="sm" className="sm:hidden" />
            <BrandMark size="md" className="hidden sm:inline-flex" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:order-2 lg:flex lg:items-center lg:gap-8" aria-label="Main">
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
          <div className="flex items-center gap-1 sm:gap-2 lg:order-3">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search creations"
              className="grid h-9 w-9 place-items-center text-slate-600 transition-colors hover:text-slate-900"
            >
              <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </button>

            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative grid h-9 w-9 place-items-center text-slate-600 transition-colors hover:text-slate-900"
            >
              <Heart className="h-[18px] w-[18px]" strokeWidth={1.5} />
              <CountBadge count={wishlist.length} />
            </Link>

            {/* Direct Dashboard Link */}
            <Link
              to="/dashboard"
              aria-label="Dashboard"
              className="relative flex items-center gap-1.5 border border-slate-200 bg-slate-50/80 px-2.5 py-1 text-xs font-medium text-slate-700 rounded-md transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              {isAdmin ? (
                <>
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-700" />
                  <span className="hidden md:inline font-semibold">Admin</span>
                </>
              ) : isAuthenticated ? (
                <>
                  <User className="h-3.5 w-3.5 text-amber-700" />
                  <span className="hidden md:inline font-medium">{user?.firstName ?? "Account"}</span>
                </>
              ) : (
                <>
                  <User className="h-3.5 w-3.5 text-slate-500" />
                  <span className="hidden md:inline font-medium">Dashboard</span>
                </>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setCartDrawerOpen(true)}
              aria-label={`Open bag, ${cartCount} items`}
              className="relative grid h-9 w-9 place-items-center text-slate-600 transition-colors hover:text-slate-900"
            >
              <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.4} />
              <CountBadge count={cartCount} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-[86%] border-border bg-background p-0 sm:max-w-sm rounded-none">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-border p-5">
              <BrandMark size="sm" />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="grid h-8 w-8 place-items-center text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
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
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between py-1 text-gold-deep font-medium"
                  >
                    <span>{isAdmin ? "👑 Admin Management" : isAuthenticated ? "👤 My Account" : "✨ Unified Dashboard"}</span>
                    <Badge variant="outline" className="border-gold/50 text-gold-deep text-[10px] uppercase tracking-wider rounded-none">
                      {isAdmin ? "Admin" : isAuthenticated ? "Client" : "Portal"}
                    </Badge>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/track"
                    onClick={() => setMenuOpen(false)}
                    className="block py-1 text-sm uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
                  >
                    Track Your Order
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="border-t border-slate-200 p-5 text-xs text-slate-500 space-y-1.5">
              <p className="font-medium text-slate-700">Jaipur Studio · Handcrafted in India</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Crafted for the Extraordinary You</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

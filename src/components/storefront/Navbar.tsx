import { Link, useRouter } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { BrandMark } from "@/components/brand/BrandMark";
import { Button } from "@/components/ui/button";
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
  { label: "Home", to: "/" as const },
  { label: "Shop", to: "/products" as const },
  { label: "Collections", to: "/collections" as const },
  { label: "About", to: "/about" as const },
];

export function AnnouncementBar() {
  const { content } = useStore();
  const [dismissed, setDismissed] = useState(false);
  if (!content.announcement.enabled || dismissed) return null;
  return (
    <div className="relative bg-ink text-pearl">
      <p className="mx-auto max-w-[1400px] px-10 py-2.5 text-center text-[10px] uppercase tracking-[0.24em] sm:text-[11px]">
        {content.announcement.text}
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-pearl/60 transition-colors hover:text-gold"
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
  }, [query, products]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-24 max-w-2xl translate-y-0 gap-0 rounded-none border-border bg-background p-0">
        <DialogTitle className="sr-only">Search products</DialogTitle>
        <DialogDescription className="sr-only">
          Search the Bansal-nx catalogue by name, category or fabric.
        </DialogDescription>
        <div className="flex items-center gap-3 border-b border-border px-5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            maxLength={80}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a piece, fabric or occasion"
            aria-label="Search products"
            className="h-14 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-[50vh] overflow-y-auto">
          {query.trim().length >= 2 && results.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              No pieces found for “{query.trim()}”.
            </p>
          )}
          <ul className="divide-y divide-border">
            {results.map((product) => (
              <li key={product.id}>
                <Link
                  to="/products/$slug"
                  params={{ slug: product.slug }}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-muted"
                >
                  <img
                    src={product.images[0]}
                    alt=""
                    width={1000}
                    height={1300}
                    loading="lazy"
                    className="h-16 w-13 object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-base">{product.name}</span>
                    <span className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      {product.category}
                    </span>
                  </span>
                  <span className="text-sm">{formatINR(product.price)}</span>
                </Link>
              </li>
            ))}
          </ul>
          {query.trim().length >= 2 && (
            <div className="border-t border-border p-4">
              <Button asChild variant="luxeOutline" size="luxeSm" className="w-full">
                <Link to="/products" search={{ q: query.trim() }} onClick={() => onOpenChange(false)}>
                  See all results
                </Link>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CountBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[9px] font-medium text-ink">
      {count > 9 ? "9+" : count}
    </span>
  );
}

export function Navbar() {
  const { cartCount, wishlist, isAuthenticated, isAdmin, setCartDrawerOpen, user, logout } =
    useStore();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = router.state.location.pathname;

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40">
        <AnnouncementBar />
        <div
          className={cn(
            "border-b transition-all duration-500",
            scrolled
              ? "border-border bg-background/95 backdrop-blur-md"
              : "border-transparent bg-background",
          )}
        >
          <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-5 sm:h-20 sm:px-8 lg:px-12">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="grid h-9 w-9 place-items-center lg:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={1.4} />
            </button>

            <Link to="/" className="lg:order-1" aria-label="Bansal-nx home">
              <BrandMark size="sm" className="sm:hidden" />
              <BrandMark size="md" className="hidden sm:inline-flex" />
            </Link>

            <nav className="hidden lg:order-2 lg:flex lg:items-center lg:gap-9" aria-label="Main">
              {primaryNav.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  data-active={pathname === item.to}
                  className="link-underline text-[11px] uppercase tracking-[0.22em] text-foreground/80 transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1 sm:gap-2 lg:order-3">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="grid h-9 w-9 place-items-center transition-colors hover:text-gold-deep"
              >
                <Search className="h-[18px] w-[18px]" strokeWidth={1.4} />
              </button>
              <Link
                to="/wishlist"
                aria-label="Wishlist"
                className="relative grid h-9 w-9 place-items-center transition-colors hover:text-gold-deep"
              >
                <Heart className="h-[18px] w-[18px]" strokeWidth={1.4} />
                <CountBadge count={wishlist.length} />
              </Link>
              {isAuthenticated ? (
                <Link
                  to="/account"
                  aria-label="My account"
                  className="hidden h-9 w-9 place-items-center transition-colors hover:text-gold-deep sm:grid"
                >
                  <User className="h-[18px] w-[18px]" strokeWidth={1.4} />
                </Link>
              ) : (
                <Link
                  to="/login"
                  search={{ redirect: "/account" }}
                  aria-label="Sign in"
                  className="hidden h-9 w-9 place-items-center transition-colors hover:text-gold-deep sm:grid"
                >
                  <User className="h-[18px] w-[18px]" strokeWidth={1.4} />
                </Link>
              )}
              <button
                type="button"
                onClick={() => setCartDrawerOpen(true)}
                aria-label={`Open bag, ${cartCount} items`}
                className="relative grid h-9 w-9 place-items-center transition-colors hover:text-gold-deep"
              >
                <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.4} />
                <CountBadge count={cartCount} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-[86%] border-border bg-background p-0 sm:max-w-sm">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <div className="flex h-full flex-col">
            <div className="border-b border-border px-6 py-5">
              <BrandMark size="sm" />
            </div>
            <nav className="flex-1 overflow-y-auto px-6 py-6" aria-label="Mobile">
              <ul className="space-y-1">
                {[
                  { label: "Shop", to: "/products" as const },
                  { label: "Collections", to: "/collections" as const },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      onClick={() => setMenuOpen(false)}
                      className="block py-3 font-display text-2xl"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to="/products"
                    search={{ sort: "newest" }}
                    onClick={() => setMenuOpen(false)}
                    className="block py-3 font-display text-2xl"
                  >
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products"
                    search={{ sort: "best-selling" }}
                    onClick={() => setMenuOpen(false)}
                    className="block py-3 font-display text-2xl"
                  >
                    Best Sellers
                  </Link>
                </li>
              </ul>
              <div className="rule-gold my-6" />
              <ul className="space-y-3">
                {[
                  { label: `Account${isAuthenticated ? "" : " / Sign in"}`, to: isAuthenticated ? ("/account" as const) : ("/login" as const) },
                  { label: `Wishlist (${wishlist.length})`, to: "/wishlist" as const },
                  { label: "Track Order", to: "/track" as const },
                  { label: "About", to: "/about" as const },
                  { label: "Contact", to: "/contact" as const },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      onClick={() => setMenuOpen(false)}
                      className="block text-[11px] uppercase tracking-[0.22em] text-muted-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                {isAdmin && (
                  <li>
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="block text-[11px] uppercase tracking-[0.22em] text-gold-deep"
                    >
                      Admin Dashboard
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
            <div className="border-t border-border px-6 py-5">
              {isAuthenticated ? (
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm">{user?.firstName} {user?.lastName}</p>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Button asChild variant="luxe" size="luxeSm" className="flex-1">
                    <Link to="/login" onClick={() => setMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button asChild variant="luxeOutline" size="luxeSm" className="flex-1">
                    <Link to="/register" onClick={() => setMenuOpen(false)}>
                      Register
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { BrandMark } from "@/components/brand/BrandMark";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

const emailSchema = z.string().trim().email().max(255);

const columns = [
  {
    title: "Shop",
    links: [
      { label: "All Products", to: "/products" as const },
      { label: "Collections", to: "/collections" as const },
      { label: "New Arrivals", to: "/products" as const, search: { sort: "newest" } },
      { label: "Best Sellers", to: "/products" as const, search: { sort: "best-selling" } },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "Contact", to: "/contact" as const },
      { label: "Shipping", to: "/shipping" as const },
      { label: "Returns", to: "/returns" as const },
      { label: "FAQs", to: "/faqs" as const },
      { label: "Track Order", to: "/track" as const },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "My Account", to: "/account" as const },
      { label: "Orders", to: "/account/orders" as const },
      { label: "Wishlist", to: "/wishlist" as const },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" as const },
      { label: "Privacy Policy", to: "/privacy" as const },
      { label: "Terms", to: "/terms" as const },
      { label: "Refund Policy", to: "/refund-policy" as const },
    ],
  },
];

export function Footer() {
  const { settings } = useStore();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  function subscribe(event: React.FormEvent) {
    event.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setEmail("");
      toast.success("You're on the list", {
        description: "We'll write when a new collection arrives.",
      });
    }, 700);
  }

  return (
    <footer className="mt-24 border-t border-border bg-ink text-pearl">
      <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <BrandMark size="md" tone="onDark" />
            <p className="mt-6 max-w-xs text-[10px] uppercase tracking-[0.3em] text-pearl/60">
              {settings.tagline}
            </p>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-pearl/60">
              Made to order in India. Hand-embroidered by our karigars in small numbers.
            </p>
            <form onSubmit={subscribe} className="mt-8 max-w-sm" noValidate>
              <label
                htmlFor="footer-email"
                className="text-[10px] uppercase tracking-[0.28em] text-pearl/70"
              >
                Newsletter
              </label>
              <div className="mt-3 flex">
                <input
                  id="footer-email"
                  type="email"
                  value={email}
                  maxLength={255}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  aria-invalid={!!error}
                  aria-describedby={error ? "footer-email-error" : undefined}
                  className="h-11 w-full border border-pearl/25 bg-transparent px-4 text-sm text-pearl placeholder:text-pearl/40 focus:border-gold focus:outline-none"
                />
                <Button type="submit" variant="gold" size="luxeSm" disabled={sending} className="h-11">
                  {sending ? "…" : "Subscribe"}
                </Button>
              </div>
              {error && (
                <p id="footer-email-error" className="mt-2 text-xs text-destructive">
                  {error}
                </p>
              )}
            </form>
            <div className="mt-8 flex gap-5">
              {[
                { Icon: Instagram, label: "Instagram" },
                { Icon: Facebook, label: "Facebook" },
                { Icon: Youtube, label: "YouTube" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="text-pearl/60 transition-colors hover:text-gold"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.4} />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {columns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h3 className="text-[10px] uppercase tracking-[0.28em] text-pearl/70">
                  {column.title}
                </h3>
                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        search={"search" in link ? (link.search as never) : undefined}
                        className="text-sm text-pearl/70 transition-colors hover:text-gold"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-pearl/15 pt-8 text-[11px] text-pearl/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Bansal-nx. All rights reserved.</p>
          <p>
            {settings.supportEmail} · {settings.supportPhone}
          </p>
        </div>
      </div>
    </footer>
  );
}

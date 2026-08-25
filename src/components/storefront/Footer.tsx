import { Link } from "react-router-dom";
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
      { label: "All Products", to: "/products" },
      { label: "Collections", to: "/collections" },
      { label: "New Arrivals", to: "/products?sort=newest" },
      { label: "Best Sellers", to: "/products?sort=best-selling" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "Contact", to: "/contact" },
      { label: "Shipping", to: "/shipping" },
      { label: "Returns", to: "/returns" },
      { label: "FAQs", to: "/faqs" },
      { label: "Track Order", to: "/track" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "My Account", to: "/account" },
      { label: "Orders", to: "/account/orders" },
      { label: "Wishlist", to: "/wishlist" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms", to: "/terms" },
      { label: "Refund Policy", to: "/returns" },
    ],
  },
];

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" stroke="none" />
    </svg>
  );
}

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
                { Icon: InstagramIcon, label: "Instagram" },
                { Icon: FacebookIcon, label: "Facebook" },
                { Icon: YoutubeIcon, label: "YouTube" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="text-pearl/60 transition-colors hover:text-gold"
                >
                  <Icon className="h-4 w-4" />
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

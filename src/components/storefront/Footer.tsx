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
      toast.success("You're subscribed", {
        description: "We'll write when a new collection arrives.",
      });
    }, 700);
  }

  return (
    <footer className="mt-20 border-t border-slate-200 bg-slate-50 text-slate-800">
      <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <BrandMark size="md" />
            <p className="mt-4 max-w-xs text-xs font-semibold uppercase tracking-wider text-slate-500">
              {settings.tagline}
            </p>
            <p className="mt-3 max-w-sm text-xs sm:text-sm leading-relaxed text-slate-600">
              Made to order in India. Hand-embroidered by master karigars in limited bespoke editions.
            </p>
            <form onSubmit={subscribe} className="mt-6 max-w-sm" noValidate>
              <label
                htmlFor="footer-email"
                className="text-xs font-medium text-slate-700"
              >
                Join Our Newsletter
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="footer-email"
                  type="email"
                  value={email}
                  maxLength={255}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  aria-invalid={!!error}
                  aria-describedby={error ? "footer-email-error" : undefined}
                  className="h-10 w-full border border-slate-200 bg-white px-3 text-xs sm:text-sm text-slate-900 rounded-md placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
                <Button type="submit" variant="luxe" size="sm" disabled={sending} className="h-10 shrink-0 font-medium">
                  {sending ? "…" : "Subscribe"}
                </Button>
              </div>
              {error && (
                <p id="footer-email-error" className="mt-1.5 text-xs text-destructive">
                  {error}
                </p>
              )}
            </form>
            <div className="mt-6 flex gap-4">
              {[
                { Icon: InstagramIcon, label: "Instagram", href: "https://www.instagram.com/bansalnx" },
                { Icon: FacebookIcon, label: "Facebook", href: "https://www.facebook.com/bansalnx" },
                { Icon: YoutubeIcon, label: "YouTube", href: "https://www.youtube.com/@bansalnx" },
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="text-slate-400 transition-colors hover:text-slate-900"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {columns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-xs sm:text-sm text-slate-600 transition-colors hover:text-slate-900 font-medium"
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

        <div className="mt-12 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Bansal·nx. All rights reserved.</p>
          <p>
            {settings.supportEmail} · {settings.supportPhone}
          </p>
        </div>
      </div>
    </footer>
  );
}

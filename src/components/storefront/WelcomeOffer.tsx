import { useEffect, useState } from "react";
import { z } from "zod";

import { PeacockGlyph } from "@/components/brand/BrandMark";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useStore } from "@/lib/store";

const emailSchema = z.string().trim().email().max(255);

/** First-visit offer. Appears once, after a deliberate delay, never on repeat visits. */
export function WelcomeOffer() {
  const { hydrated, welcomeOfferSeen, markWelcomeOfferSeen, claimWelcomeCoupon } = useStore();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated || welcomeOfferSeen) return;
    const timer = window.setTimeout(() => setOpen(true), 9000);
    return () => window.clearTimeout(timer);
  }, [hydrated, welcomeOfferSeen]);

  function close(next: boolean) {
    setOpen(next);
    if (!next) markWelcomeOfferSeen();
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!emailSchema.safeParse(email).success) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setCode(claimWelcomeCoupon());
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-lg gap-0 rounded-none border-border bg-card p-0">
        <div className="px-8 py-10 text-center sm:px-12 sm:py-12">
          <span className="mx-auto block h-10 w-10 text-gold">
            <PeacockGlyph />
          </span>
          {code ? (
            <>
              <DialogTitle className="mt-6 font-display text-3xl font-light">
                Your offer is ready
              </DialogTitle>
              <DialogDescription className="mt-3 text-sm text-muted-foreground">
                Use this code at checkout to enjoy 10% off your first order.
              </DialogDescription>
              <p className="mt-6 border border-dashed border-gold px-6 py-4 text-lg tracking-[0.3em] text-gold-deep">
                {code}
              </p>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Valid on orders above ₹10,000 · one use per customer · applies at the coupon field in
                your bag or at checkout.
              </p>
              <Button variant="luxe" size="luxe" className="mt-8 w-full" onClick={() => close(false)}>
                Start shopping
              </Button>
            </>
          ) : (
            <>
              <DialogTitle className="mt-6 font-display text-3xl font-light">
                Welcome to Bansal-nx
              </DialogTitle>
              <DialogDescription className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Enjoy an exclusive offer on your first order, and first word on new collections.
              </DialogDescription>
              <form onSubmit={submit} className="mt-8" noValidate>
                <label htmlFor="welcome-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="welcome-email"
                  type="email"
                  value={email}
                  maxLength={255}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  aria-invalid={!!error}
                  aria-describedby={error ? "welcome-email-error" : undefined}
                  className="h-12 w-full border border-input bg-background px-4 text-center text-sm outline-none transition-colors focus:border-gold"
                />
                {error && (
                  <p id="welcome-email-error" className="mt-2 text-xs text-destructive">
                    {error}
                  </p>
                )}
                <Button type="submit" variant="gold" size="luxe" className="mt-4 w-full">
                  Unlock my offer
                </Button>
              </form>
              <button
                type="button"
                onClick={() => close(false)}
                className="mt-6 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
              >
                No thank you
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

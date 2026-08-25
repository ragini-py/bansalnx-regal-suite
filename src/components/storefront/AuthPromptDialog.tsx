import { Link, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { PeacockGlyph } from "@/components/brand/BrandMark";

const copy = {
  wishlist: {
    title: "Save your favourites",
    description: "Sign in to save this piece to your wishlist.",
  },
  cart: {
    title: "Sign in to continue",
    description:
      "Create an account to save your selections and continue shopping where you left off.",
  },
  checkout: {
    title: "Sign in to check out",
    description: "Your bag is waiting. Sign in to complete your order securely.",
  },
} as const;

export function AuthPromptDialog({
  open,
  onOpenChange,
  intent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  intent: "wishlist" | "cart" | "checkout";
}) {
  const location = useLocation();
  const redirect = location.pathname + location.search;
  const { title, description } = copy[intent];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 rounded-none border-border bg-card p-0">
        <div className="flex flex-col items-center px-8 py-10 text-center">
          <span className="h-10 w-10 text-gold">
            <PeacockGlyph />
          </span>
          <DialogTitle className="mt-6 font-display text-2xl font-light">{title}</DialogTitle>
          <DialogDescription className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {description}
          </DialogDescription>
          <div className="mt-8 flex w-full flex-col gap-3">
            <Button asChild variant="luxe" size="luxe">
              <Link
                to={`/login?redirect=${encodeURIComponent(redirect)}`}
                onClick={() => onOpenChange(false)}
              >
                Login
              </Link>
            </Button>
            <Button asChild variant="luxeOutline" size="luxe">
              <Link
                to={`/register?redirect=${encodeURIComponent(redirect)}`}
                onClick={() => onOpenChange(false)}
              >
                Create Account
              </Link>
            </Button>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="mt-6 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Continue browsing
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

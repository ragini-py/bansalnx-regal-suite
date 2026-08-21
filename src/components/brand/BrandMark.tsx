import { cn } from "@/lib/utils";

/**
 * Placeholder brand treatment for Bansal-nx.
 *
 * The real logo (stylised capital B built from a peacock's head and neck, set
 * against a fan of peacock feathers, in metallic gold) is not available yet.
 * This mark is a tasteful stand-in with the same silhouette and proportions:
 * swap the <PeacockGlyph /> for the supplied asset and nothing else changes.
 */
export function PeacockGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={cn("h-full w-full", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
    >
      {/* feather fan */}
      <path d="M24 42C13 38 7 29 8 18" opacity="0.5" />
      <path d="M24 42C18 36 15 27 17 15" opacity="0.6" />
      <path d="M24 42C30 36 33 27 31 15" opacity="0.6" />
      <path d="M24 42C35 38 41 29 40 18" opacity="0.5" />
      <circle cx="8" cy="16" r="1.6" opacity="0.7" />
      <circle cx="17" cy="13" r="1.6" opacity="0.8" />
      <circle cx="31" cy="13" r="1.6" opacity="0.8" />
      <circle cx="40" cy="16" r="1.6" opacity="0.7" />
      {/* stylised B whose bowl reads as a peacock head and neck */}
      <path d="M19 40V10h6.5c3.6 0 6 1.9 6 5.2 0 2.6-1.6 4.4-4.2 4.9 3.2.4 5.2 2.5 5.2 5.6 0 3.8-2.7 6.1-7 6.1H19" />
      <path d="M25.5 20c2.8-1.1 4.6-3.3 4.6-6.2 0-1.6-.6-3-1.7-4" />
      <circle cx="28.6" cy="9.4" r="0.9" fill="currentColor" stroke="none" />
      <path d="M29.4 8.2 32 6.4" />
    </svg>
  );
}

export function BrandMark({
  className,
  size = "md",
  withTagline = false,
  tone = "default",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  withTagline?: boolean;
  tone?: "default" | "onDark" | "gold";
}) {
  const glyph = { sm: "h-6 w-6", md: "h-8 w-8", lg: "h-12 w-12" }[size];
  const word = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl sm:text-5xl",
  }[size];
  const toneClass =
    tone === "onDark" ? "text-ivory" : tone === "gold" ? "text-gold" : "text-foreground";

  return (
    <span className={cn("inline-flex items-center gap-2.5", toneClass, className)}>
      <span className={cn(glyph, "shrink-0 text-gold")}>
        <PeacockGlyph />
      </span>
      <span className="flex flex-col leading-none">
        <span className={cn("font-display font-normal tracking-[0.06em]", word)}>Bansal-nx</span>
        {withTagline && (
          <span className="mt-1.5 text-[9px] uppercase tracking-[0.3em] opacity-70">
            Crafted for the extraordinary you
          </span>
        )}
      </span>
    </span>
  );
}

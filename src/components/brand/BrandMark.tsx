import { cn } from "@/lib/utils";

/**
 * Official Bansal-nx peacock insignia mark (from /ui/favicon.png).
 */
export function PeacockGlyph({ className }: { className?: string }) {
  return (
    <img
      src="/ui/favicon.png"
      alt="Bansal-nx Insignia"
      className={cn("h-full w-full object-contain inline-block select-none", className)}
      loading="eager"
      decoding="async"
    />
  );
}

/**
 * Official Bansal-nx primary brand logo (from /ui/logo.png).
 */
export function BrandMark({
  className,
  size = "md",
  withTagline,
  tone = "default",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  withTagline?: boolean;
  tone?: "default" | "onDark" | "gold";
}) {
  const sizeMap = {
    sm: "h-9 sm:h-10",
    md: "h-11 sm:h-13",
    lg: "h-24 sm:h-32",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center select-none transition-opacity hover:opacity-95",
        className,
      )}
    >
      <img
        src="/ui/logo.png"
        alt="Bansal-nx — Crafted for the Extraordinary You"
        className={cn(
          sizeMap[size] ?? sizeMap.md,
          "w-auto max-w-full object-contain transition-transform duration-200",
          tone === "onDark"
            ? "drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
            : "drop-shadow-[0_1px_2px_rgba(0,0,0,0.06)]",
        )}
        loading="eager"
        decoding="async"
      />
    </span>
  );
}

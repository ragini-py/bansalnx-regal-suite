import collection1 from "@/assets/collection-1.jpg";
import collection2 from "@/assets/collection-2.jpg";
import collection3 from "@/assets/collection-3.jpg";
import editorial from "@/assets/editorial-1.jpg";
import promo from "@/assets/promo.jpg";
import craft from "@/assets/craft.jpg";
import craftOrange from "@/assets/craft-orange.jpg";
import hero from "@/assets/hero.jpg";
import heroSlide2 from "@/assets/hero-slide-2.jpg";
import heroSlide3 from "@/assets/hero-slide-3.jpg";
import heroSlide4 from "@/assets/hero-slide-4.jpg";
import authHero from "@/assets/auth-hero.jpg";
import aboutEditorial from "@/assets/about-editorial.jpg";

import type { Product, ProductVariant } from "./types";

export const imagery = {
  hero,
  heroSlide2,
  heroSlide3,
  heroSlide4,
  authHero,
  editorial,
  aboutEditorial,
  promo,
  craft,
  crafft: craft,
  craftOrange,
  collection1,
  collection2,
  collection3,
};

export const allSizes = ["XS", "S", "M", "L", "XL", "Free Size"];

export function isVariantAvailable(product: Product, size: string, colour?: string | null): boolean {
  const normSize = (size || "").trim().toLowerCase();
  const normColour = (colour || "").trim().toLowerCase();

  if (Array.isArray(product.variants) && product.variants.length > 0) {
    if (normColour) {
      const match = product.variants.find(
        (v) =>
          v.size.trim().toLowerCase() === normSize &&
          v.colour.trim().toLowerCase() === normColour,
      );
      if (match) return match.availability === "available";
    }
    // Fallback: check if size is available in any colour
    const sizeMatch = product.variants.find(
      (v) => v.size.trim().toLowerCase() === normSize,
    );
    if (sizeMatch) return sizeMatch.availability === "available";
  }

  if (Array.isArray(product.availableSizes) && product.availableSizes.length > 0) {
    return product.availableSizes.some((s) => s.trim().toLowerCase() === normSize);
  }

  return true;
}

/**
 * Checks if a product as a whole is out of stock.
 * A product is out of stock if:
 * 1. It has variants and ALL variants are "unavailable" (no variant is "available").
 * 2. It has availableSizes defined and it is empty.
 * 3. Its quantity is explicitly 0 and no variants are available.
 */
export function isProductOutOfStock(product: Product): boolean {
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    const hasAvailable = product.variants.some((v) => v.availability === "available");
    return !hasAvailable;
  }

  if (Array.isArray(product.availableSizes)) {
    return product.availableSizes.length === 0;
  }

  if (typeof product.quantity === "number" && product.quantity <= 0) {
    return true;
  }

  return false;
}

/**
 * Checks if a specific colour for a product has all sizes turned off / out of stock.
 */
export function isColourOutOfStock(product: Product, colour: string): boolean {
  const normColour = (colour || "").trim().toLowerCase();
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    const colourVariants = product.variants.filter(
      (v) => v.colour.trim().toLowerCase() === normColour,
    );
    if (colourVariants.length > 0) {
      return !colourVariants.some((v) => v.availability === "available");
    }
  }

  if (Array.isArray(product.sizes) && product.sizes.length > 0) {
    return !product.sizes.some((s) => isVariantAvailable(product, s, colour));
  }

  return isProductOutOfStock(product);
}

/**
 * Sorts products so that:
 * 1. In-stock products ALWAYS appear first.
 * 2. Out-of-stock products ALWAYS appear at the very bottom/end.
 * 3. Within each group (in-stock or out-of-stock), the chosen comparator is respected.
 */
export function sortProductsWithStockPriority(
  products: Product[],
  comparator?: (a: Product, b: Product) => number,
): Product[] {
  return [...products].sort((a, b) => {
    const aOut = isProductOutOfStock(a) ? 1 : 0;
    const bOut = isProductOutOfStock(b) ? 1 : 0;

    if (aOut !== bOut) {
      return aOut - bOut;
    }

    if (comparator) {
      return comparator(a, b);
    }
    return 0;
  });
}

export function findVariant(
  product: Product,
  size: string,
  colour: string,
): ProductVariant | undefined {
  const normSize = (size || "").trim().toLowerCase();
  const normColour = (colour || "").trim().toLowerCase();
  return product.variants.find(
    (v) =>
      v.size.trim().toLowerCase() === normSize &&
      v.colour.trim().toLowerCase() === normColour,
  );
}

export function getProductImagesForColour(
  product: Product,
  colour?: string | null,
): string[] {
  if (colour && product.imagesByColour) {
    const target = colour.toLowerCase().trim();
    for (const [c, imgs] of Object.entries(product.imagesByColour)) {
      if (c.toLowerCase().trim() === target && Array.isArray(imgs) && imgs.length > 0) {
        return imgs;
      }
    }
  }
  return product.images && product.images.length > 0 ? product.images : ["/products/p1.jpg"];
}

export const colourMap: Record<string, string> = {
  // Base neutrals & whites
  ivory: "#fcf8ee",
  cream: "#fffdd0",
  white: "#ffffff",
  black: "#1c1917",
  "charcoal grey": "#374151",
  charcoal: "#374151",
  grey: "#6b7280",
  beige: "#f5f0e6",

  // Pinks & Peaches
  "rani pink": "#e0218a",
  "fuchsia pink": "#d946ef",
  "blush pink": "#f8b4cb",
  peach: "#fba38a",
  pink: "#f472b6",
  blush: "#f7cfcf",
  rose: "#e8a598",

  // Blues
  "teal blue": "#008080",
  "royal blue": "#2563eb",
  "sky blue": "#38bdf8",
  "powder blue": "#b0c4de",
  "navy blue": "#1e3a8a",
  "cerulean blue": "#0284c7",
  teal: "#008080",
  navy: "#1b2a47",
  blue: "#3b82f6",

  // Greens
  "sage green": "#9caf88",
  "pista green": "#93c572",
  "lime green": "#84cc16",
  emerald: "#2d5a43",
  green: "#3b5323",
  sage: "#9caf88",

  // Reds, Wines & Rusts
  "crimson red": "#dc2626",
  red: "#dc2626",
  wine: "#722f37",
  maroon: "#6b1724",
  ruby: "#9b111e",
  "rust orange": "#b7410e",
  rust: "#b7410e",

  // Yellows, Oranges & Golds
  "mustard yellow": "#d49b00",
  mustard: "#d49b00",
  "lemon yellow": "#eab308",
  yellow: "#eedc82",
  "tangerine orange": "#ea580c",
  orange: "#ea580c",
  "copper gold": "#b87333",
  gold: "#d4af37",

  // Purples & Lavenders
  purple: "#7b2cbf",
  lavender: "#c084fc",
  plum: "#5e2a40",
  "royal purple": "#602b7a",
};

export function getColourHex(colour?: string | null): string {
  if (!colour) return "#c8bca9";
  const norm = colour.toLowerCase().trim();
  if (colourMap[norm]) return colourMap[norm];

  // Smart partial/keyword fallback
  if (norm.includes("rani") || norm.includes("fuchsia")) return "#e0218a";
  if (norm.includes("pink")) return "#f472b6";
  if (norm.includes("blush")) return "#f8b4cb";
  if (norm.includes("peach")) return "#fba38a";
  if (norm.includes("wine")) return "#722f37";
  if (norm.includes("maroon")) return "#6b1724";
  if (norm.includes("crimson") || norm.includes("red")) return "#dc2626";
  if (norm.includes("rust")) return "#b7410e";
  if (norm.includes("orange") || norm.includes("tangerine")) return "#ea580c";
  if (norm.includes("mustard")) return "#d49b00";
  if (norm.includes("lemon") || norm.includes("yellow")) return "#eab308";
  if (norm.includes("gold") || norm.includes("copper")) return "#d4af37";
  if (norm.includes("sage")) return "#9caf88";
  if (norm.includes("pista")) return "#93c572";
  if (norm.includes("lime")) return "#84cc16";
  if (norm.includes("green")) return "#2d5a43";
  if (norm.includes("teal")) return "#008080";
  if (norm.includes("navy")) return "#1e3a8a";
  if (norm.includes("royal blue")) return "#2563eb";
  if (norm.includes("sky") || norm.includes("powder") || norm.includes("cerulean")) return "#38bdf8";
  if (norm.includes("blue")) return "#3b82f6";
  if (norm.includes("purple")) return "#7b2cbf";
  if (norm.includes("lavender") || norm.includes("lilac")) return "#c084fc";
  if (norm.includes("black")) return "#1c1917";
  if (norm.includes("white")) return "#ffffff";
  if (norm.includes("ivory") || norm.includes("cream")) return "#fcf8ee";
  if (norm.includes("grey") || norm.includes("gray") || norm.includes("charcoal")) return "#374151";

  return "#c8bca9";
}


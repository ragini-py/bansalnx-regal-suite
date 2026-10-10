import collection1 from "@/assets/collection-1.jpg";
import collection2 from "@/assets/collection-2.jpg";
import collection3 from "@/assets/collection-3.jpg";
import editorial from "@/assets/editorial-1.jpg";
import promo from "@/assets/promo.jpg";
import craft from "@/assets/craft.jpg";
import hero from "@/assets/hero.jpg";

import type { Product, ProductVariant } from "./types";

export const imagery = {
  hero,
  editorial,
  promo,
  craft,
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

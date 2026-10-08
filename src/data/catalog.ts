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

export function isVariantAvailable(product: Product, size: string, colour: string): boolean {
  return (
    product.variants.find((v) => v.size === size && v.colour === colour)?.availability ===
    "available"
  );
}

export function findVariant(
  product: Product,
  size: string,
  colour: string,
): ProductVariant | undefined {
  return product.variants.find((v) => v.size === size && v.colour === colour);
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

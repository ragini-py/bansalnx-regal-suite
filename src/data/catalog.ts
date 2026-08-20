import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import p5 from "@/assets/p5.jpg";
import p6 from "@/assets/p6.jpg";
import collection1 from "@/assets/collection-1.jpg";
import collection2 from "@/assets/collection-2.jpg";
import collection3 from "@/assets/collection-3.jpg";
import editorial from "@/assets/editorial-1.jpg";
import promo from "@/assets/promo.jpg";
import craft from "@/assets/craft.jpg";
import hero from "@/assets/hero.jpg";

import type { Category, Collection, Product, ProductVariant } from "./types";

export const imagery = {
  hero,
  editorial,
  promo,
  craft,
  collection1,
  collection2,
  collection3,
};

const SIZES = ["XS", "S", "M", "L", "XL"];

function variants(
  id: string,
  colours: string[],
  unavailable: string[] = [],
): ProductVariant[] {
  return colours.flatMap((colour) =>
    SIZES.map((size) => ({
      id: `${id}-${colour.toLowerCase().replace(/\s+/g, "-")}-${size}`,
      size,
      colour,
      availability: unavailable.includes(`${colour}:${size}`)
        ? ("unavailable" as const)
        : ("available" as const),
    })),
  );
}

export const categories: Category[] = [
  { id: "cat-1", name: "Lehengas", slug: "lehengas" },
  { id: "cat-2", name: "Sarees", slug: "sarees" },
  { id: "cat-3", name: "Gowns", slug: "gowns" },
  { id: "cat-4", name: "Kurta Sets", slug: "kurta-sets" },
  { id: "cat-5", name: "Skirt Sets", slug: "skirt-sets" },
];

export const products: Product[] = [
  {
    id: "prd-1",
    slug: "blush-rosette-skirt-set",
    name: "Blush Rosette Skirt Set",
    price: 24900,
    mrp: 32500,
    currency: "INR",
    images: [p1, p5, p3],
    category: "Skirt Sets",
    collections: ["the-ceremony-edit", "new-season"],
    tags: ["hand-embroidered", "festive", "pastel"],
    badge: "new",
    shortDescription: "Hand-embroidered blush organza skirt set with fine gold thread work.",
    description:
      "A study in restraint. The Blush Rosette skirt set is crafted from feather-light organza and hand-embroidered with dense gold resham rosettes along the hem. Paired with a structured blouse and a whisper-soft dupatta, it is made for celebrations that ask for elegance rather than volume.",
    details: [
      "Hand-embroidered organza with resham and sequin work",
      "Structured blouse with concealed hook fastening",
      "Includes skirt, blouse and dupatta",
      "Made to order in our Jaipur atelier",
    ],
    care: ["Dry clean only", "Store in the muslin bag provided", "Avoid direct sunlight and perfume"],
    sizes: SIZES,
    colours: ["Blush", "Ivory"],
    variants: variants("prd-1", ["Blush", "Ivory"], ["Blush:M", "Ivory:XL", "Ivory:XS"]),
    featured: true,
    bestseller: true,
    newArrival: true,
    published: true,
    createdAt: "2026-07-02T10:00:00.000Z",
  },
  {
    id: "prd-2",
    slug: "emerald-zari-anarkali",
    name: "Emerald Zari Anarkali",
    price: 38900,
    mrp: 46000,
    currency: "INR",
    images: [p2, p6, p1],
    category: "Gowns",
    collections: ["the-ceremony-edit", "heritage-atelier"],
    tags: ["silk", "zari", "wedding"],
    badge: "bestseller",
    shortDescription: "Pure silk anarkali with a hand-woven zari border.",
    description:
      "Cut from pure mulberry silk in deep emerald, this anarkali falls in a single uninterrupted sweep. The border is hand-woven zari, drawn from an archival Banarasi motif and re-scaled for a modern silhouette.",
    details: [
      "Pure mulberry silk with hand-woven zari border",
      "Full-flare anarkali with side pockets",
      "Includes anarkali and matching stole",
      "Model is 5'9\" and wears size S",
    ],
    care: ["Dry clean only", "Iron on reverse at low heat"],
    sizes: SIZES,
    colours: ["Emerald"],
    variants: variants("prd-2", ["Emerald"], ["Emerald:XS", "Emerald:XL"]),
    featured: true,
    bestseller: true,
    newArrival: false,
    published: true,
    createdAt: "2026-05-18T10:00:00.000Z",
  },
  {
    id: "prd-3",
    slug: "champagne-tissue-saree",
    name: "Champagne Tissue Saree",
    price: 21500,
    mrp: 21500,
    currency: "INR",
    images: [p3, p1, p2],
    category: "Sarees",
    collections: ["new-season", "heritage-atelier"],
    tags: ["tissue", "gold", "minimal"],
    badge: "exclusive",
    shortDescription: "Liquid-gold tissue saree with a hand-finished selvedge.",
    description:
      "Woven on a handloom in Chanderi, this tissue saree catches light like poured metal. Deliberately unembellished, it is finished with a narrow gold selvedge and a slub-textured pallu.",
    details: [
      "Handloom tissue with gold zari selvedge",
      "6.3 metres with unstitched blouse piece",
      "Naturally slubbed texture; no two pieces are identical",
    ],
    care: ["Dry clean only", "Refold along different lines every few months"],
    sizes: ["Free Size"],
    colours: ["Champagne"],
    variants: [
      {
        id: "prd-3-champagne-free",
        size: "Free Size",
        colour: "Champagne",
        availability: "available",
      },
    ],
    featured: true,
    bestseller: false,
    newArrival: true,
    published: true,
    createdAt: "2026-07-21T10:00:00.000Z",
  },
  {
    id: "prd-4",
    slug: "royal-velvet-lehenga",
    name: "Royal Velvet Lehenga",
    price: 74900,
    mrp: 92000,
    currency: "INR",
    images: [p4, p2, p6],
    category: "Lehengas",
    collections: ["the-ceremony-edit"],
    tags: ["velvet", "bridal", "zardozi"],
    badge: "bestseller",
    shortDescription: "Zardozi-embroidered velvet lehenga for the wedding hour.",
    description:
      "Nine metres of silk velvet, hand-embroidered over four hundred hours in gold zardozi and antique sequins. A ceremonial piece, weighted and lined so that it moves with you rather than against you.",
    details: [
      "Silk velvet with hand zardozi and dabka work",
      "Canvassed waistband with adjustable drawstring",
      "Includes lehenga, blouse and net dupatta",
      "Made to order; 4-6 weeks",
    ],
    care: ["Dry clean by specialist only", "Store flat, never on a hanger"],
    sizes: SIZES,
    colours: ["Royal Purple"],
    variants: variants("prd-4", ["Royal Purple"], ["Royal Purple:M", "Royal Purple:XL"]),
    featured: true,
    bestseller: true,
    newArrival: false,
    published: true,
    createdAt: "2026-03-11T10:00:00.000Z",
  },
  {
    id: "prd-5",
    slug: "ivory-chikankari-kurta-set",
    name: "Ivory Chikankari Kurta Set",
    price: 14900,
    mrp: 18500,
    currency: "INR",
    images: [p5, p3, p1],
    category: "Kurta Sets",
    collections: ["new-season", "quiet-hours"],
    tags: ["chikankari", "cotton", "day"],
    badge: "new",
    shortDescription: "Hand-embroidered chikankari in mulmul cotton with pearl buttons.",
    description:
      "Lucknow chikankari at its most restrained: shadow-work vines across a mulmul kurta, finished with mother-of-pearl buttons. Designed for long afternoons and quiet celebrations.",
    details: [
      "Hand chikankari on mulmul cotton",
      "Includes kurta, straight trousers and dupatta",
      "Mother-of-pearl buttons",
    ],
    care: ["Gentle hand wash in cold water", "Dry in shade"],
    sizes: SIZES,
    colours: ["Ivory", "Pearl Grey"],
    variants: variants("prd-5", ["Ivory", "Pearl Grey"], ["Pearl Grey:S", "Pearl Grey:M"]),
    featured: false,
    bestseller: true,
    newArrival: true,
    published: true,
    createdAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "prd-6",
    slug: "teal-organza-sharara",
    name: "Teal Organza Sharara",
    price: 29900,
    mrp: 34900,
    currency: "INR",
    images: [p6, p4, p2],
    category: "Skirt Sets",
    collections: ["new-season", "quiet-hours"],
    tags: ["organza", "sequin", "evening"],
    badge: null,
    shortDescription: "Sequinned organza sharara set in deep peacock teal.",
    description:
      "Peacock teal organza, scattered with hand-set gold sequins that read as texture rather than sparkle. The sharara is generously cut and lined in cotton voile for comfort through long evenings.",
    details: [
      "Hand-set sequin and cutdana work on organza",
      "Cotton voile lining",
      "Includes blouse, sharara and cape dupatta",
    ],
    care: ["Dry clean only", "Handle sequins with care"],
    sizes: SIZES,
    colours: ["Peacock Teal"],
    variants: variants("prd-6", ["Peacock Teal"], ["Peacock Teal:XS"]),
    featured: false,
    bestseller: false,
    newArrival: true,
    published: true,
    createdAt: "2026-07-14T10:00:00.000Z",
  },
  {
    id: "prd-7",
    slug: "sapphire-silk-gown",
    name: "Sapphire Silk Gown",
    price: 44900,
    mrp: 52000,
    currency: "INR",
    images: [p2, p4, p3],
    category: "Gowns",
    collections: ["quiet-hours", "heritage-atelier"],
    tags: ["silk", "evening", "sapphire"],
    badge: "exclusive",
    shortDescription: "Bias-cut silk gown in deep sapphire with a draped shoulder.",
    description:
      "A bias-cut column in sapphire silk crepe with one softly draped shoulder. Unembellished by design — the fall of the fabric is the ornament.",
    details: ["Bias-cut silk crepe", "Concealed side zip", "Fully lined"],
    care: ["Dry clean only"],
    sizes: SIZES,
    colours: ["Sapphire"],
    variants: variants("prd-7", ["Sapphire"], ["Sapphire:L", "Sapphire:XL"]),
    featured: true,
    bestseller: false,
    newArrival: false,
    published: true,
    createdAt: "2026-04-26T10:00:00.000Z",
  },
  {
    id: "prd-8",
    slug: "gilded-jacket-saree",
    name: "Gilded Jacket Saree",
    price: 56900,
    mrp: 68000,
    currency: "INR",
    images: [p3, p6, p5],
    category: "Sarees",
    collections: ["the-ceremony-edit", "heritage-atelier"],
    tags: ["saree", "jacket", "gold"],
    badge: "bestseller",
    shortDescription: "Pre-draped gold saree with a hand-embroidered structured jacket.",
    description:
      "A pre-draped tissue saree worn under a sharply tailored, hand-embroidered jacket. Ceremonial dressing, simplified to a single step.",
    details: [
      "Pre-draped tissue saree with concealed fastening",
      "Hand-embroidered jacket with canvassed shoulders",
      "Includes saree, stitched blouse and jacket",
    ],
    care: ["Dry clean only", "Store jacket on a padded hanger"],
    sizes: SIZES,
    colours: ["Antique Gold"],
    variants: variants("prd-8", ["Antique Gold"], ["Antique Gold:XS", "Antique Gold:M"]),
    featured: false,
    bestseller: true,
    newArrival: false,
    published: true,
    createdAt: "2026-02-08T10:00:00.000Z",
  },
  {
    id: "prd-9",
    slug: "pearl-grey-draped-set",
    name: "Pearl Grey Draped Set",
    price: 19900,
    mrp: 24500,
    currency: "INR",
    images: [p5, p1, p6],
    category: "Kurta Sets",
    collections: ["quiet-hours"],
    tags: ["drape", "minimal", "day"],
    badge: null,
    shortDescription: "Softly draped kurta set in pearl grey crepe.",
    description:
      "A fluid, asymmetrically draped kurta in pearl grey crepe with tonal thread detailing at the neckline. Understated enough for daylight, considered enough for evening.",
    details: ["Draped crepe kurta with tonal embroidery", "Includes kurta and tapered trousers"],
    care: ["Dry clean recommended"],
    sizes: SIZES,
    colours: ["Pearl Grey"],
    variants: variants("prd-9", ["Pearl Grey"], ["Pearl Grey:XL"]),
    featured: false,
    bestseller: false,
    newArrival: true,
    published: true,
    createdAt: "2026-06-30T10:00:00.000Z",
  },
  {
    id: "prd-10",
    slug: "leaf-green-brocade-lehenga",
    name: "Leaf Green Brocade Lehenga",
    price: 49900,
    mrp: 61000,
    currency: "INR",
    images: [p4, p6, p2],
    category: "Lehengas",
    collections: ["the-ceremony-edit", "new-season"],
    tags: ["brocade", "festive"],
    badge: "new",
    shortDescription: "Handloom brocade lehenga in leaf green with a scalloped hem.",
    description:
      "Handloom brocade woven with a repeating botanical motif, cut into a full lehenga with a scalloped, zari-bound hem. Weighted for movement, kept clean at the waist.",
    details: ["Handloom brocade with zari-bound scalloped hem", "Includes lehenga, blouse, dupatta"],
    care: ["Dry clean only"],
    sizes: SIZES,
    colours: ["Leaf Green"],
    variants: variants("prd-10", ["Leaf Green"], ["Leaf Green:XS", "Leaf Green:L"]),
    featured: false,
    bestseller: false,
    newArrival: true,
    published: true,
    createdAt: "2026-08-05T10:00:00.000Z",
  },
  {
    id: "prd-11",
    slug: "antique-rose-tulle-gown",
    name: "Antique Rose Tulle Gown",
    price: 61900,
    mrp: 72000,
    currency: "INR",
    images: [p1, p4, p3],
    category: "Gowns",
    collections: ["quiet-hours", "the-ceremony-edit"],
    tags: ["tulle", "couture"],
    badge: "exclusive",
    shortDescription: "Layered tulle gown with hand-appliquéd rose petals.",
    description:
      "Eleven layers of antique rose tulle, hand-appliquéd with silk petals that thin as they climb. A couture piece, entirely made to measure.",
    details: ["Eleven-layer silk tulle", "Hand-appliquéd petals", "Made to measure; 6-8 weeks"],
    care: ["Specialist dry clean only"],
    sizes: SIZES,
    colours: ["Antique Rose"],
    variants: variants("prd-11", ["Antique Rose"], ["Antique Rose:XS", "Antique Rose:S"]),
    featured: false,
    bestseller: false,
    newArrival: false,
    published: true,
    createdAt: "2026-01-19T10:00:00.000Z",
  },
  {
    id: "prd-12",
    slug: "ivory-gold-festive-set",
    name: "Ivory & Gold Festive Set",
    price: 27900,
    mrp: 33000,
    currency: "INR",
    images: [p5, p2, p1],
    category: "Kurta Sets",
    collections: ["new-season", "heritage-atelier"],
    tags: ["festive", "gold", "ivory"],
    badge: null,
    shortDescription: "Ivory silk kurta set with gold gota borders.",
    description:
      "Ivory raw silk with hand-applied gota borders at the placket and hem. A calm answer to festive dressing, cut narrow and finished by hand.",
    details: ["Raw silk with hand gota work", "Includes kurta, churidar and organza dupatta"],
    care: ["Dry clean only"],
    sizes: SIZES,
    colours: ["Ivory"],
    variants: variants("prd-12", ["Ivory"], ["Ivory:M"]),
    featured: false,
    bestseller: false,
    newArrival: false,
    published: true,
    createdAt: "2026-05-02T10:00:00.000Z",
  },
];

export const collections: Collection[] = [
  {
    id: "col-1",
    slug: "the-ceremony-edit",
    name: "The Ceremony Edit",
    description:
      "Weighted silks, hand zardozi and ceremonial colour — pieces made for the moments people photograph.",
    coverImage: collection1,
    bannerImage: collection1,
    productIds: ["prd-1", "prd-2", "prd-4", "prd-8", "prd-10", "prd-11"],
    featured: true,
    published: true,
    order: 1,
  },
  {
    id: "col-2",
    slug: "quiet-hours",
    name: "Quiet Hours",
    description:
      "Restrained silhouettes in crepe, tulle and mulmul for evenings that need no announcement.",
    coverImage: collection2,
    bannerImage: collection2,
    productIds: ["prd-5", "prd-6", "prd-7", "prd-9", "prd-11"],
    featured: true,
    published: true,
    order: 2,
  },
  {
    id: "col-3",
    slug: "heritage-atelier",
    name: "Heritage Atelier",
    description:
      "Archival weaves reinterpreted with our karigars — handloom brocade, tissue and Banarasi zari.",
    coverImage: collection3,
    bannerImage: collection3,
    productIds: ["prd-2", "prd-3", "prd-7", "prd-8", "prd-12"],
    featured: true,
    published: true,
    order: 3,
  },
  {
    id: "col-4",
    slug: "new-season",
    name: "New Season",
    description: "The latest arrivals from the atelier, added weekly.",
    coverImage: collection2,
    bannerImage: collection2,
    productIds: ["prd-1", "prd-3", "prd-5", "prd-6", "prd-9", "prd-10", "prd-12"],
    featured: false,
    published: true,
    order: 4,
  },
];

export const allSizes = ["XS", "S", "M", "L", "XL", "Free Size"];
export const allColours = Array.from(new Set(products.flatMap((p) => p.colours))).sort();

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getCollectionBySlug(slug: string): Collection | undefined {
  return collections.find((c) => c.slug === slug);
}

export function isVariantAvailable(product: Product, size: string, colour: string): boolean {
  return (
    product.variants.find((v) => v.size === size && v.colour === colour)?.availability ===
    "available"
  );
}

export function findVariant(product: Product, size: string, colour: string) {
  return product.variants.find((v) => v.size === size && v.colour === colour);
}
